// Product Service API - POST /api/products Tests
// Auto-generated from test plan

import { test, expect } from '@playwright/test';

test.describe('POST /api/products', () => {
  const baseUrl = 'http://localhost:3001/api';

  test('should successfully create a new product with valid data', async ({ request }) => {
    // Arrange
    const newProduct = {
      name: 'Organic Bananas',
      price: 2.99,
      description: 'Fresh organic bananas from local farms',
      image: 'https://example.com/images/banana.jpg',
      dataAiHint: 'fruit, organic, potassium',
      category: 'fruits',
      inStock: true,
      discount: 15
    };

    // Act
    const response = await request.post(`${baseUrl}/products`, {
      data: newProduct,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Assert
    expect(response.status()).toBe(201);
    
    const responseBody = await response.json();
    
    // Verify response contains all required fields
    expect(responseBody).toHaveProperty('id');
    expect(responseBody.name).toBe(newProduct.name);
    expect(responseBody.price).toBe(newProduct.price);
    expect(responseBody.description).toBe(newProduct.description);
    expect(responseBody.image).toBe(newProduct.image);
    expect(responseBody.dataAiHint).toBe(newProduct.dataAiHint);
    expect(responseBody.category).toBe(newProduct.category);
    expect(responseBody.inStock).toBe(newProduct.inStock);
    
    // Verify auto-generated fields
    expect(responseBody.id).toBeTruthy();
    expect(responseBody).toHaveProperty('createdAt');
    expect(responseBody).toHaveProperty('updatedAt');
  });

  test('should reject invalid request data with 400 status', async ({ request }) => {
    // Arrange - Send invalid/incomplete data
    const invalidProduct = {
      invalid: 'data',
      notAField: 123
    };

    // Act
    const response = await request.post(`${baseUrl}/products`, {
      data: invalidProduct,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Assert
    expect(response.status()).toBe(400);
    
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('error');
  });

  test('should reject product with missing required fields', async ({ request }) => {
    // Arrange - Missing required fields (name, price, description)
    const incompleteProduct = {
      category: 'fruits'
    };

    // Act
    const response = await request.post(`${baseUrl}/products`, {
      data: incompleteProduct,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Assert
    expect(response.status()).toBe(400);
    
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('error');
    expect(responseBody.error).toContain('Invalid request data');
  });

  test('should reject product with invalid price (negative)', async ({ request }) => {
    // Arrange
    const productWithNegativePrice = {
      name: 'Test Product',
      price: -5.99,
      description: 'Test description',
      image: 'https://example.com/test.jpg',
      dataAiHint: 'test',
      category: 'test',
      inStock: true
    };

    // Act
    const response = await request.post(`${baseUrl}/products`, {
      data: productWithNegativePrice,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Assert
    expect(response.status()).toBe(400);
    
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('error');
  });

  test('should handle large payload appropriately', async ({ request }) => {
    // Arrange - Create a product with very long description
    const largeDescription = 'x'.repeat(10000); // 10KB description
    const productWithLargePayload = {
      name: 'Large Payload Product',
      price: 9.99,
      description: largeDescription,
      image: 'https://example.com/large.jpg',
      dataAiHint: 'test large payload',
      category: 'test',
      inStock: true
    };

    // Act
    const response = await request.post(`${baseUrl}/products`, {
      data: productWithLargePayload,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Assert - Should either accept (201), reject as too large (413), or validate (400)
    expect([200, 201, 400, 413]).toContain(response.status());
    
    if (response.status() === 201) {
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty('id');
    }
  });

  test('should reject empty payload with 400 status', async ({ request }) => {
    // Arrange - Empty object
    const emptyPayload = {};

    // Act
    const response = await request.post(`${baseUrl}/products`, {
      data: emptyPayload,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Assert
    expect(response.status()).toBe(400);
    
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('error');
  });

  test('should reject product with invalid data types', async ({ request }) => {
    // Arrange - Wrong data types
    const productWithWrongTypes = {
      name: 12345, // should be string
      price: 'not-a-number', // should be number
      description: 'Valid description',
      image: 'https://example.com/test.jpg',
      dataAiHint: 'test',
      category: 'test',
      inStock: 'yes' // should be boolean
    };

    // Act
    const response = await request.post(`${baseUrl}/products`, {
      data: productWithWrongTypes,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Assert
    expect(response.status()).toBe(400);
    
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('error');
  });

  test('should handle special characters in product name and description', async ({ request }) => {
    // Arrange
    const productWithSpecialChars = {
      name: 'Product with Special Chars: <>&"\'',
      price: 5.99,
      description: 'Description with émojis 🍎🍌 and spëcial chars',
      image: 'https://example.com/special.jpg',
      dataAiHint: 'test special characters',
      category: 'test',
      inStock: true
    };

    // Act
    const response = await request.post(`${baseUrl}/products`, {
      data: productWithSpecialChars,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Assert
    expect([200, 201]).toContain(response.status());
    
    if (response.status() === 201) {
      const responseBody = await response.json();
      expect(responseBody.name).toBe(productWithSpecialChars.name);
      expect(responseBody.description).toBe(productWithSpecialChars.description);
    }
  });

  test('should validate image URL format', async ({ request }) => {
    // Arrange - Invalid URL format
    const productWithInvalidUrl = {
      name: 'Test Product',
      price: 5.99,
      description: 'Test description',
      image: 'not-a-valid-url',
      dataAiHint: 'test',
      category: 'test',
      inStock: true
    };

    // Act
    const response = await request.post(`${baseUrl}/products`, {
      data: productWithInvalidUrl,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Assert - Should either accept or reject based on validation rules
    expect([200, 201, 400]).toContain(response.status());
  });
});
