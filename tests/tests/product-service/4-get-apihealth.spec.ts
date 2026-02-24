// Product Service API - GET /api/health Tests
// Auto-generated from test plan

import { test, expect } from '@playwright/test';

test.describe('GET /api/health', () => {
  const baseUrl = 'http://localhost:3001/api';

  test('should return healthy status', async ({ request }) => {
    // Act
    const response = await request.get(`${baseUrl}/health`);

    // Assert
    expect(response.status()).toBe(200);
    
    const responseBody = await response.json();
    
    // Verify health check response structure
    expect(responseBody).toHaveProperty('status');
    expect(responseBody).toHaveProperty('service');
    expect(responseBody).toHaveProperty('timestamp');
    
    // Verify service is healthy
    expect(responseBody.status).toBe('healthy');
    expect(responseBody.service).toBe('product-service');
    
    // Verify timestamp is recent (within last 5 seconds)
    const timestamp = new Date(responseBody.timestamp);
    const now = new Date();
    const timeDiff = now.getTime() - timestamp.getTime();
    expect(timeDiff).toBeLessThan(5000); // 5 seconds
  });

  test('should respond quickly to health check requests', async ({ request }) => {
    // Act
    const startTime = Date.now();
    const response = await request.get(`${baseUrl}/health`);
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    // Assert
    expect(response.status()).toBe(200);
    
    // Health check should respond within 500ms
    expect(responseTime).toBeLessThan(500);
  });

  test('should handle multiple concurrent health check requests', async ({ request }) => {
    // Arrange - Create multiple concurrent requests
    const numberOfRequests = 10;
    const requests = Array.from({ length: numberOfRequests }, () =>
      request.get(`${baseUrl}/health`)
    );

    // Act
    const responses = await Promise.all(requests);

    // Assert - All requests should succeed
    responses.forEach(response => {
      expect(response.status()).toBe(200);
    });
    
    // Verify all responses have correct structure
    const bodies = await Promise.all(responses.map(r => r.json()));
    bodies.forEach(body => {
      expect(body.status).toBe('healthy');
      expect(body.service).toBe('product-service');
    });
  });

  test('should return valid JSON content type', async ({ request }) => {
    // Act
    const response = await request.get(`${baseUrl}/health`);

    // Assert
    expect(response.status()).toBe(200);
    
    // Verify content type is JSON
    const contentType = response.headers()['content-type'];
    expect(contentType).toContain('application/json');
  });

  test('should be accessible without authentication', async ({ request }) => {
    // Act - Make request without any auth headers
    const response = await request.get(`${baseUrl}/health`, {
      headers: {
        // No authorization headers
      }
    });

    // Assert - Should still succeed
    expect(response.status()).toBe(200);
    
    const responseBody = await response.json();
    expect(responseBody.status).toBe('healthy');
  });
});
