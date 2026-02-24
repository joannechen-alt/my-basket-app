// Product Service API - GET /api/products/{id} Tests
// Auto-generated from test plan

import { test, expect } from '@playwright/test';

test.describe('GET /api/products/{id}', () => {
  const baseUrl = 'http://localhost:3001/api';

  test('should successfully get product by valid ID', async ({ request }) => {
    // Arrange - Use a known product ID from the sample data
    const productId = '1';

    // Act
    const response = await request.get(`${baseUrl}/products/${productId}`);

    // Assert
    expect(response.status()).toBe(200);
    
    const responseBody = await response.json();
    
    // Verify product structure
    expect(responseBody).toHaveProperty('id');
    expect(responseBody).toHaveProperty('name');
    expect(responseBody).toHaveProperty('price');
    expect(responseBody).toHaveProperty('description');
    expect(responseBody).toHaveProperty('image');
    expect(responseBody).toHaveProperty('dataAiHint');
    expect(responseBody).toHaveProperty('category');
    expect(responseBody).toHaveProperty('inStock');
    expect(responseBody).toHaveProperty('createdAt');
    expect(responseBody).toHaveProperty('updatedAt');
    
    // Verify the ID matches
    expect(responseBody.id).toBe(productId);
    
    // Verify data types
    expect(typeof responseBody.name).toBe('string');
    expect(typeof responseBody.price).toBe('number');
    expect(typeof responseBody.description).toBe('string');
    expect(typeof responseBody.inStock).toBe('boolean');
  });

  test('should return 404 for non-existent product ID', async ({ request }) => {
    // Arrange - Use a product ID that doesn't exist
    const nonExistentId = '99999';

    // Act
    const response = await request.get(`${baseUrl}/products/${nonExistentId}`);

    // Assert
    expect(response.status()).toBe(404);
    
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('error');
    expect(responseBody.error).toContain('Product not found');
  });

  test('should return 404 for invalid product ID format', async ({ request }) => {
    // Arrange - Use an invalid ID format
    const invalidId = 'invalid-id-@#$';

    // Act
    const response = await request.get(`${baseUrl}/products/${invalidId}`);

    // Assert
    expect(response.status()).toBe(404);
    
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('error');
  });

  test('should handle multiple sequential requests for different products', async ({ request }) => {
    // Arrange - Multiple known product IDs
    const productIds = ['1', '2', '3'];

    // Act & Assert - Fetch each product sequentially
    for (const productId of productIds) {
      const response = await request.get(`${baseUrl}/products/${productId}`);
      
      expect(response.status()).toBe(200);
      
      const responseBody = await response.json();
      expect(responseBody.id).toBe(productId);
    }
  });

  test('should return consistent data for same product ID across multiple requests', async ({ request }) => {
    // Arrange
    const productId = '1';

    // Act - Make two requests for the same product
    const response1 = await request.get(`${baseUrl}/products/${productId}`);
    const response2 = await request.get(`${baseUrl}/products/${productId}`);

    // Assert - Both responses should be identical
    expect(response1.status()).toBe(200);
    expect(response2.status()).toBe(200);
    
    const product1 = await response1.json();
    const product2 = await response2.json();
    
    expect(product1).toEqual(product2);
  });

  test('should handle empty product ID gracefully', async ({ request }) => {
    // Arrange - Empty ID (this changes the endpoint)
    const emptyId = '';

    // Act - This will actually call GET /products instead of /products/{id}
    const response = await request.get(`${baseUrl}/products/${emptyId}`);

    // Assert - Should either redirect to list or return 404
    expect([200, 404]).toContain(response.status());
  });

  test('should verify all product fields have correct data types', async ({ request }) => {
    // Arrange
    const productId = '1';

    // Act
    const response = await request.get(`${baseUrl}/products/${productId}`);

    // Assert
    expect(response.status()).toBe(200);
    
    const product = await response.json();
    
    // Verify data types of all fields
    expect(typeof product.id).toBe('string');
    expect(typeof product.name).toBe('string');
    expect(typeof product.price).toBe('number');
    expect(typeof product.description).toBe('string');
    expect(typeof product.image).toBe('string');
    expect(typeof product.dataAiHint).toBe('string');
    expect(typeof product.category).toBe('string');
    expect(typeof product.inStock).toBe('boolean');
    
    // Verify price is positive
    expect(product.price).toBeGreaterThan(0);
  });

  test('should verify product has valid category', async ({ request }) => {
    // Arrange
    const productId = '1';
    const validCategories = ['fruits', 'vegetables', 'dairy', 'meat', 'bakery', 'grains'];

    // Act
    const response = await request.get(`${baseUrl}/products/${productId}`);

    // Assert
    expect(response.status()).toBe(200);
    
    const product = await response.json();
    
    // Verify category is one of the valid categories
    expect(validCategories).toContain(product.category);
  });

  test('should verify image URL is accessible format', async ({ request }) => {
    // Arrange
    const productId = '1';

    // Act
    const response = await request.get(`${baseUrl}/products/${productId}`);

    // Assert
    expect(response.status()).toBe(200);
    
    const product = await response.json();
    
    // Verify image URL starts with http:// or https://
    expect(product.image).toMatch(/^https?:\/\//);
  });
});
