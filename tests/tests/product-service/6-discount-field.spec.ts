// Product Service API - Discount Field Tests
// Tests for the new discount field (0-100 numeric values)

import { test, expect } from '@playwright/test';

test.describe('Product Discount Field Tests', () => {
  const baseUrl = 'http://localhost:3001/api';
  let testProductId: string;

  test('should return products with discount field included', async ({ request }) => {
    // Act
    const response = await request.get(`${baseUrl}/products`);

    // Assert
    expect(response.status()).toBe(200);
    
    const responseBody = await response.json();
    expect(responseBody.products).toBeDefined();
    expect(Array.isArray(responseBody.products)).toBeTruthy();
    
    // Verify that products have discount field
    if (responseBody.products.length > 0) {
      const product = responseBody.products[0];
      expect(product).toHaveProperty('discount');
      
      // If discount is set, it should be between 0-100
      if (product.discount !== undefined && product.discount !== null) {
        expect(product.discount).toBeGreaterThanOrEqual(0);
        expect(product.discount).toBeLessThanOrEqual(100);
      }
    }
  });

  test('should get a single product with discount field', async ({ request }) => {
    // Arrange - Use a known product ID (Organic Apples)
    const productId = '1';

    // Act
    const response = await request.get(`${baseUrl}/products/${productId}`);

    // Assert
    expect(response.status()).toBe(200);
    
    const product = await response.json();
    expect(product).toHaveProperty('discount');
    expect(product.discount).toBe(10); // Organic Apples has 10% discount
    expect(product.name).toBe('Organic Apples');
  });

  test('should create a product with valid discount (within 0-100 range)', async ({ request }) => {
    // Arrange
    const newProduct = {
      name: 'Test Product with Discount',
      price: 15.99,
      description: 'A test product with 25% discount',
      image: 'https://placehold.co/300x200.png',
      dataAiHint: 'test product discount',
      category: 'test',
      inStock: true,
      discount: 25
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
    expect(responseBody.discount).toBe(25);
    expect(responseBody.name).toBe(newProduct.name);
    expect(responseBody.price).toBe(newProduct.price);
    
    // Store product ID for cleanup
    testProductId = responseBody.id;
  });

  test('should create a product with 0% discount', async ({ request }) => {
    // Arrange
    const newProduct = {
      name: 'Product with No Discount',
      price: 8.99,
      description: 'A product with 0% discount',
      image: 'https://placehold.co/300x200.png',
      dataAiHint: 'test no discount',
      category: 'test',
      inStock: true,
      discount: 0
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
    expect(responseBody.discount).toBe(0);
  });

  test('should create a product with 100% discount (maximum)', async ({ request }) => {
    // Arrange
    const newProduct = {
      name: 'Free Product',
      price: 20.00,
      description: 'A product with 100% discount',
      image: 'https://placehold.co/300x200.png',
      dataAiHint: 'test max discount',
      category: 'test',
      inStock: true,
      discount: 100
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
    expect(responseBody.discount).toBe(100);
  });

  test('should create a product without discount field (optional)', async ({ request }) => {
    // Arrange - discount field is optional
    const newProduct = {
      name: 'Product Without Discount Field',
      price: 12.99,
      description: 'A product without discount specified',
      image: 'https://placehold.co/300x200.png',
      dataAiHint: 'test optional discount',
      category: 'test',
      inStock: true
      // No discount field
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
    // Discount should be undefined or not set
    expect(responseBody.discount).toBeUndefined();
  });

  test('should reject product with discount below 0', async ({ request }) => {
    // Arrange
    const invalidProduct = {
      name: 'Invalid Discount Product',
      price: 10.00,
      description: 'Product with negative discount',
      image: 'https://placehold.co/300x200.png',
      dataAiHint: 'test invalid discount',
      category: 'test',
      inStock: true,
      discount: -5
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
    expect(responseBody.error).toContain('Invalid product data');
  });

  test('should reject product with discount above 100', async ({ request }) => {
    // Arrange
    const invalidProduct = {
      name: 'Invalid Discount Product',
      price: 10.00,
      description: 'Product with discount over 100%',
      image: 'https://placehold.co/300x200.png',
      dataAiHint: 'test invalid discount',
      category: 'test',
      inStock: true,
      discount: 150
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
    expect(responseBody.error).toContain('Invalid product data');
  });

  test('should update product discount successfully', async ({ request }) => {
    // Arrange - First create a product
    const newProduct = {
      name: 'Product to Update',
      price: 18.99,
      description: 'Product for update test',
      image: 'https://placehold.co/300x200.png',
      dataAiHint: 'test update',
      category: 'test',
      inStock: true,
      discount: 10
    };

    const createResponse = await request.post(`${baseUrl}/products`, {
      data: newProduct,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const createdProduct = await createResponse.json();
    const productId = createdProduct.id;

    // Act - Update the discount
    const updateData = {
      discount: 30
    };

    const updateResponse = await request.put(`${baseUrl}/products/${productId}`, {
      data: updateData,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Assert
    expect(updateResponse.status()).toBe(200);
    
    const updatedProduct = await updateResponse.json();
    expect(updatedProduct.discount).toBe(30);
    expect(updatedProduct.id).toBe(productId);
  });

  test('should reject update with invalid discount value', async ({ request }) => {
    // Arrange - Use existing product (Organic Apples)
    const productId = '1';

    // Act - Try to update with invalid discount
    const updateData = {
      discount: 200
    };

    const response = await request.put(`${baseUrl}/products/${productId}`, {
      data: updateData,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Assert
    expect(response.status()).toBe(400);
    
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('error');
    expect(responseBody.error).toContain('Invalid product data');
  });

  test('should verify sample products have correct discount values', async ({ request }) => {
    // This test validates that the seeded sample products have valid discount values
    
    // Act
    const response = await request.get(`${baseUrl}/products`);
    
    // Assert
    expect(response.status()).toBe(200);
    
    const responseBody = await response.json();
    const products = responseBody.products;
    
    // Check specific sample products
    const organicApples = products.find((p: any) => p.id === '1');
    const wholeWheatBread = products.find((p: any) => p.id === '2');
    const organicSpinach = products.find((p: any) => p.id === '4');
    const chickenBreast = products.find((p: any) => p.id === '6');
    
    if (organicApples) {
      expect(organicApples.discount).toBe(10);
    }
    
    if (wholeWheatBread) {
      expect(wholeWheatBread.discount).toBe(5);
    }
    
    if (organicSpinach) {
      expect(organicSpinach.discount).toBe(20);
    }
    
    if (chickenBreast) {
      expect(chickenBreast.discount).toBe(25);
    }
  });

  test('should handle decimal discount values (e.g., 12.5%)', async ({ request }) => {
    // Arrange
    const newProduct = {
      name: 'Product with Decimal Discount',
      price: 25.00,
      description: 'Product with 12.5% discount',
      image: 'https://placehold.co/300x200.png',
      dataAiHint: 'test decimal discount',
      category: 'test',
      inStock: true,
      discount: 12.5
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
    expect(responseBody.discount).toBe(12.5);
  });
});
