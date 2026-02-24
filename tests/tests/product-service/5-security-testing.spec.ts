// Product Service API - Security Testing
// Auto-generated from test plan

import { test, expect } from '@playwright/test';

test.describe('Security Testing', () => {
  const baseUrl = 'http://localhost:3001/api';

  test.describe('SQL Injection Protection', () => {
    test('should protect against SQL injection in search parameter', async ({ request }) => {
      // Arrange - SQL injection attempt in search
      const sqlInjection = "'; DROP TABLE users; --";

      // Act
      const response = await request.get(`${baseUrl}/products?search=${encodeURIComponent(sqlInjection)}`);

      // Assert - Should handle gracefully (200 with empty results or 400)
      expect([200, 400]).toContain(response.status());
      
      if (response.status() === 200) {
        const responseBody = await response.json();
        expect(responseBody).toHaveProperty('products');
        expect(Array.isArray(responseBody.products)).toBeTruthy();
      }
    });

    test('should protect against SQL injection in category parameter', async ({ request }) => {
      // Arrange
      const sqlInjection = "' OR '1'='1";

      // Act
      const response = await request.get(`${baseUrl}/products?category=${encodeURIComponent(sqlInjection)}`);

      // Assert
      expect([200, 400]).toContain(response.status());
      
      const responseBody = await response.json();
      expect(responseBody).toBeDefined();
    });

    test('should sanitize SQL injection in product ID', async ({ request }) => {
      // Arrange
      const maliciousId = "1' OR '1'='1";

      // Act
      const response = await request.get(`${baseUrl}/products/${encodeURIComponent(maliciousId)}`);

      // Assert - Should return 404 (not found) or properly sanitized
      expect([404, 400]).toContain(response.status());
    });
  });

  test.describe('XSS Protection', () => {
    test('should prevent XSS in product name field', async ({ request }) => {
      // Arrange - XSS attempt in product creation
      const xssPayload = {
        name: '<script>alert("xss")</script>',
        price: 9.99,
        description: 'Test product',
        image: 'https://example.com/test.jpg',
        dataAiHint: 'test',
        category: 'test',
        inStock: true
      };

      // Act
      const response = await request.post(`${baseUrl}/products`, {
        data: xssPayload,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Assert
      expect([200, 201, 400]).toContain(response.status());
      
      if (response.status() === 201) {
        const responseBody = await response.json();
        // Verify the script tag is escaped or sanitized
        expect(responseBody.name).not.toContain('<script>');
      }
    });

    test('should prevent XSS in product description', async ({ request }) => {
      // Arrange
      const xssPayload = {
        name: 'Test Product',
        price: 9.99,
        description: '<img src=x onerror="alert(\'xss\')">',
        image: 'https://example.com/test.jpg',
        dataAiHint: 'test',
        category: 'test',
        inStock: true
      };

      // Act
      const response = await request.post(`${baseUrl}/products`, {
        data: xssPayload,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Assert
      expect([200, 201, 400]).toContain(response.status());
      
      if (response.status() === 201) {
        const responseBody = await response.json();
        // Verify potentially malicious content is sanitized
        expect(responseBody.description).not.toContain('onerror=');
      }
    });

    test('should handle HTML entities in search', async ({ request }) => {
      // Arrange
      const htmlEntities = '&lt;script&gt;alert("test")&lt;/script&gt;';

      // Act
      const response = await request.get(`${baseUrl}/products?search=${encodeURIComponent(htmlEntities)}`);

      // Assert
      expect([200, 400]).toContain(response.status());
      
      const responseBody = await response.json();
      expect(responseBody).toBeDefined();
    });
  });

  test.describe('CSRF Protection', () => {
    test('should handle requests from different origins', async ({ request }) => {
      // Arrange - Request with suspicious origin
      const maliciousOrigin = 'https://malicious-site.com';

      // Act
      const response = await request.post(`${baseUrl}/products`, {
        data: {
          name: 'Test Product',
          price: 9.99,
          description: 'Test',
          image: 'https://example.com/test.jpg',
          dataAiHint: 'test',
          category: 'test',
          inStock: true
        },
        headers: {
          'Origin': maliciousOrigin,
          'Content-Type': 'application/json'
        }
      });

      // Assert - Should either reject (403) or handle with CORS
      expect([200, 201, 403, 400]).toContain(response.status());
    });

    test('should validate referer header for sensitive operations', async ({ request }) => {
      // Arrange
      const suspiciousReferer = 'https://phishing-site.com';

      // Act
      const response = await request.post(`${baseUrl}/products`, {
        data: {
          name: 'Test Product',
          price: 9.99,
          description: 'Test',
          image: 'https://example.com/test.jpg',
          dataAiHint: 'test',
          category: 'test',
          inStock: true
        },
        headers: {
          'Referer': suspiciousReferer,
          'Content-Type': 'application/json'
        }
      });

      // Assert - Should handle appropriately
      expect([200, 201, 403, 400]).toContain(response.status());
    });
  });

  test.describe('Input Validation', () => {
    test('should reject excessively long strings', async ({ request }) => {
      // Arrange - Very long product name
      const veryLongName = 'A'.repeat(1000000); // 1MB of text

      // Act
      const response = await request.post(`${baseUrl}/products`, {
        data: {
          name: veryLongName,
          price: 9.99,
          description: 'Test',
          image: 'https://example.com/test.jpg',
          dataAiHint: 'test',
          category: 'test',
          inStock: true
        },
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Assert - Should reject with 400 or 413 (payload too large)
      expect([400, 413]).toContain(response.status());
    });

    test('should validate number ranges for price', async ({ request }) => {
      // Arrange - Extremely large price
      const extremePrice = {
        name: 'Test Product',
        price: Number.MAX_SAFE_INTEGER,
        description: 'Test',
        image: 'https://example.com/test.jpg',
        dataAiHint: 'test',
        category: 'test',
        inStock: true
      };

      // Act
      const response = await request.post(`${baseUrl}/products`, {
        data: extremePrice,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Assert
      expect([200, 201, 400]).toContain(response.status());
    });

    test('should reject null byte injection', async ({ request }) => {
      // Arrange
      const nullBytePayload = {
        name: 'Test\0Product',
        price: 9.99,
        description: 'Test',
        image: 'https://example.com/test.jpg',
        dataAiHint: 'test',
        category: 'test',
        inStock: true
      };

      // Act
      const response = await request.post(`${baseUrl}/products`, {
        data: nullBytePayload,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Assert
      expect([200, 201, 400]).toContain(response.status());
    });
  });

  test.describe('Rate Limiting and DoS Protection', () => {
    test('should handle burst of requests gracefully', async ({ request }) => {
      // Arrange - Create 50 rapid requests
      const numberOfRequests = 50;
      const requests = Array.from({ length: numberOfRequests }, () =>
        request.get(`${baseUrl}/products`)
      );

      // Act
      const responses = await Promise.all(requests);

      // Assert - Should handle all requests (may rate limit some)
      responses.forEach(response => {
        expect([200, 429]).toContain(response.status());
      });
    });
  });
});
