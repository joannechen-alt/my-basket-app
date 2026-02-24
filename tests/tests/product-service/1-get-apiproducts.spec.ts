// Product Service API - GET /api/products Tests
// Auto-generated from test plan

import { test, expect } from '@playwright/test';

test.describe('GET /api/products', () => {
  const baseUrl = 'http://localhost:3001/api';

  test('should successfully get all products with default parameters', async ({ request }) => {
    // Act
    const response = await request.get(`${baseUrl}/products`);

    // Assert
    expect(response.status()).toBe(200);
    
    const responseBody = await response.json();
    
    // Verify response structure
    expect(responseBody).toHaveProperty('products');
    expect(responseBody).toHaveProperty('pagination');
    expect(Array.isArray(responseBody.products)).toBeTruthy();
    
    // Verify pagination structure
    expect(responseBody.pagination).toHaveProperty('total');
    expect(responseBody.pagination).toHaveProperty('page');
    expect(responseBody.pagination).toHaveProperty('limit');
    expect(responseBody.pagination).toHaveProperty('totalPages');
  });

  test('should filter products by category', async ({ request }) => {
    // Arrange
    const category = 'fruits';

    // Act
    const response = await request.get(`${baseUrl}/products?category=${category}`);

    // Assert
    expect(response.status()).toBe(200);
    
    const responseBody = await response.json();
    expect(Array.isArray(responseBody.products)).toBeTruthy();
    
    // Verify all products have the correct category
    if (responseBody.products.length > 0) {
      responseBody.products.forEach((product: any) => {
        expect(product.category).toBe(category);
      });
    }
  });

  test('should filter products by price range', async ({ request }) => {
    // Arrange
    const minPrice = 2.00;
    const maxPrice = 5.00;

    // Act
    const response = await request.get(`${baseUrl}/products?minPrice=${minPrice}&maxPrice=${maxPrice}`);

    // Assert
    expect(response.status()).toBe(200);
    
    const responseBody = await response.json();
    expect(Array.isArray(responseBody.products)).toBeTruthy();
    
    // Verify all products are within the price range
    if (responseBody.products.length > 0) {
      responseBody.products.forEach((product: any) => {
        expect(product.price).toBeGreaterThanOrEqual(minPrice);
        expect(product.price).toBeLessThanOrEqual(maxPrice);
      });
    }
  });

  test('should filter products by stock availability', async ({ request }) => {
    // Arrange
    const inStock = true;

    // Act
    const response = await request.get(`${baseUrl}/products?inStock=${inStock}`);

    // Assert
    expect(response.status()).toBe(200);
    
    const responseBody = await response.json();
    expect(Array.isArray(responseBody.products)).toBeTruthy();
    
    // Verify all products are in stock
    if (responseBody.products.length > 0) {
      responseBody.products.forEach((product: any) => {
        expect(product.inStock).toBe(inStock);
      });
    }
  });

  test('should search products by keyword', async ({ request }) => {
    // Arrange
    const searchTerm = 'organic';

    // Act
    const response = await request.get(`${baseUrl}/products?search=${searchTerm}`);

    // Assert
    expect(response.status()).toBe(200);
    
    const responseBody = await response.json();
    expect(Array.isArray(responseBody.products)).toBeTruthy();
    
    // Verify search results contain the search term (in name or description)
    if (responseBody.products.length > 0) {
      responseBody.products.forEach((product: any) => {
        const matchesSearch = 
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.dataAiHint.toLowerCase().includes(searchTerm.toLowerCase());
        expect(matchesSearch).toBeTruthy();
      });
    }
  });

  test('should support pagination with page and limit parameters', async ({ request }) => {
    // Arrange
    const page = 1;
    const limit = 5;

    // Act
    const response = await request.get(`${baseUrl}/products?page=${page}&limit=${limit}`);

    // Assert
    expect(response.status()).toBe(200);
    
    const responseBody = await response.json();
    expect(Array.isArray(responseBody.products)).toBeTruthy();
    expect(responseBody.products.length).toBeLessThanOrEqual(limit);
    
    // Verify pagination metadata
    expect(responseBody.pagination.page).toBe(page);
    expect(responseBody.pagination.limit).toBe(limit);
  });

  test('should handle combined filters correctly', async ({ request }) => {
    // Arrange
    const category = 'fruits';
    const inStock = true;
    const minPrice = 2.00;

    // Act
    const response = await request.get(
      `${baseUrl}/products?category=${category}&inStock=${inStock}&minPrice=${minPrice}`
    );

    // Assert
    expect(response.status()).toBe(200);
    
    const responseBody = await response.json();
    expect(Array.isArray(responseBody.products)).toBeTruthy();
    
    // Verify all filters are applied
    if (responseBody.products.length > 0) {
      responseBody.products.forEach((product: any) => {
        expect(product.category).toBe(category);
        expect(product.inStock).toBe(inStock);
        expect(product.price).toBeGreaterThanOrEqual(minPrice);
      });
    }
  });

  test('should return empty array for non-matching filters', async ({ request }) => {
    // Arrange - Use filters that should match no products
    const category = 'non-existent-category';

    // Act
    const response = await request.get(`${baseUrl}/products?category=${category}`);

    // Assert
    expect(response.status()).toBe(200);
    
    const responseBody = await response.json();
    expect(Array.isArray(responseBody.products)).toBeTruthy();
    expect(responseBody.products.length).toBe(0);
  });
});
