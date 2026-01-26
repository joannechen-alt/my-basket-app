import { test, expect } from '@playwright/test';

const CART_SERVICE_URL = 'http://localhost:3002';
const TEST_USER_ID = 'test-user';

test.describe('Cart Addition API Tests', () => {
  test.beforeEach(async ({ request }) => {
    // Clear the cart before each test to ensure clean state
    await request.delete(`${CART_SERVICE_URL}/api/cart/${TEST_USER_ID}`);
  });

  test.describe('Positive Test Cases', () => {
    test('should successfully add item to cart with valid productId and quantity', async ({ request }) => {
      // Arrange
      const requestBody = {
        productId: '1',
        quantity: 2
      };

      // Act
      const response = await request.post(`${CART_SERVICE_URL}/api/cart/${TEST_USER_ID}/items`, {
        data: requestBody,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Assert
      expect(response.status()).toBe(200);
      
      const responseBody = await response.json();
      
      // Verify cart structure
      expect(responseBody).toHaveProperty('id');
      expect(responseBody).toHaveProperty('userId', TEST_USER_ID);
      expect(responseBody).toHaveProperty('items');
      expect(responseBody).toHaveProperty('totalAmount');
      expect(responseBody).toHaveProperty('totalItems');
      expect(responseBody).toHaveProperty('createdAt');
      expect(responseBody).toHaveProperty('updatedAt');

      // Verify items array contains the added product
      expect(responseBody.items).toHaveLength(1);
      expect(responseBody.items[0]).toMatchObject({
        id: '1',
        quantity: 2
      });

      // Verify item properties
      expect(responseBody.items[0]).toHaveProperty('name');
      expect(responseBody.items[0]).toHaveProperty('price');
      expect(responseBody.items[0]).toHaveProperty('description');
      expect(responseBody.items[0]).toHaveProperty('image');
      expect(responseBody.items[0]).toHaveProperty('dataAiHint');
      expect(responseBody.items[0]).toHaveProperty('addedAt');

      // Verify totals are calculated correctly
      const expectedTotal = responseBody.items[0].price * 2;
      expect(responseBody.totalAmount).toBeCloseTo(expectedTotal, 2);
      expect(responseBody.totalItems).toBe(2);
    });

    test('should add item with default quantity of 1 when quantity not specified', async ({ request }) => {
      // Arrange
      const requestBody = {
        productId: '1'
      };

      // Act
      const response = await request.post(`${CART_SERVICE_URL}/api/cart/${TEST_USER_ID}/items`, {
        data: requestBody,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Assert
      expect(response.status()).toBe(200);
      
      const responseBody = await response.json();
      expect(responseBody.items[0].quantity).toBe(1);
      expect(responseBody.totalItems).toBe(1);
    });

    test('should increment quantity when adding existing item to cart', async ({ request }) => {
      // Arrange - Add item first time
      const firstRequest = {
        productId: '1',
        quantity: 3
      };
      
      await request.post(`${CART_SERVICE_URL}/api/cart/${TEST_USER_ID}/items`, {
        data: firstRequest
      });

      // Act - Add same item again
      const secondRequest = {
        productId: '1',
        quantity: 2
      };
      
      const response = await request.post(`${CART_SERVICE_URL}/api/cart/${TEST_USER_ID}/items`, {
        data: secondRequest,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Assert
      expect(response.status()).toBe(200);
      
      const responseBody = await response.json();
      
      // Should still have only 1 item in cart
      expect(responseBody.items).toHaveLength(1);
      
      // Quantity should be sum of both additions (3 + 2 = 5)
      expect(responseBody.items[0].quantity).toBe(5);
      expect(responseBody.totalItems).toBe(5);
      
      // Total amount should reflect updated quantity
      const expectedTotal = responseBody.items[0].price * 5;
      expect(responseBody.totalAmount).toBeCloseTo(expectedTotal, 2);
    });

    test('should add multiple different items to cart', async ({ request }) => {
      // Arrange & Act - Add first item
      await request.post(`${CART_SERVICE_URL}/api/cart/${TEST_USER_ID}/items`, {
        data: { productId: '1', quantity: 2 }
      });

      // Add second item
      const response = await request.post(`${CART_SERVICE_URL}/api/cart/${TEST_USER_ID}/items`, {
        data: { productId: '2', quantity: 1 },
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Assert
      expect(response.status()).toBe(200);
      
      const responseBody = await response.json();
      
      // Should have 2 different items
      expect(responseBody.items).toHaveLength(2);
      
      // Verify total items count
      expect(responseBody.totalItems).toBe(3); // 2 + 1
      
      // Verify both products are present
      const productIds = responseBody.items.map((item: any) => item.id);
      expect(productIds).toContain('1');
      expect(productIds).toContain('2');
    });

    test('should verify decimal price calculation precision', async ({ request }) => {
      // Arrange
      const requestBody = {
        productId: '1',
        quantity: 3
      };

      // Act
      const response = await request.post(`${CART_SERVICE_URL}/api/cart/${TEST_USER_ID}/items`, {
        data: requestBody,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Assert
      expect(response.status()).toBe(200);
      
      const responseBody = await response.json();
      
      // Verify totalAmount is rounded to 2 decimal places
      const totalAmount = responseBody.totalAmount;
      const decimalPlaces = (totalAmount.toString().split('.')[1] || '').length;
      expect(decimalPlaces).toBeLessThanOrEqual(2);
    });
  });

  test.describe('Negative Test Cases', () => {
    test('should return 400 for missing productId', async ({ request }) => {
      // Arrange
      const invalidRequest = {
        quantity: 2
        // productId is missing
      };

      // Act
      const response = await request.post(`${CART_SERVICE_URL}/api/cart/${TEST_USER_ID}/items`, {
        data: invalidRequest,
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

    test('should return 400 for empty productId', async ({ request }) => {
      // Arrange
      const invalidRequest = {
        productId: '',
        quantity: 1
      };

      // Act
      const response = await request.post(`${CART_SERVICE_URL}/api/cart/${TEST_USER_ID}/items`, {
        data: invalidRequest,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Assert
      expect(response.status()).toBe(400);
      
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty('error');
    });

    test('should return 400 for invalid quantity (negative)', async ({ request }) => {
      // Arrange
      const invalidRequest = {
        productId: '1',
        quantity: -1
      };

      // Act
      const response = await request.post(`${CART_SERVICE_URL}/api/cart/${TEST_USER_ID}/items`, {
        data: invalidRequest,
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

    test('should return 400 for invalid quantity (zero)', async ({ request }) => {
      // Arrange
      const invalidRequest = {
        productId: '1',
        quantity: 0
      };

      // Act
      const response = await request.post(`${CART_SERVICE_URL}/api/cart/${TEST_USER_ID}/items`, {
        data: invalidRequest,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Assert
      expect(response.status()).toBe(400);
      
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty('error');
    });

    test('should return 404 for non-existent productId', async ({ request }) => {
      // Arrange
      const invalidRequest = {
        productId: 'non-existent-product-999',
        quantity: 1
      };

      // Act
      const response = await request.post(`${CART_SERVICE_URL}/api/cart/${TEST_USER_ID}/items`, {
        data: invalidRequest,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Assert
      expect(response.status()).toBe(404);
      
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty('error');
      expect(responseBody.error).toBe('Product not found');
    });

    test('should return 400 for invalid userId', async ({ request }) => {
      // Arrange
      const requestBody = {
        productId: '1',
        quantity: 1
      };

      // Act
      const response = await request.post(`${CART_SERVICE_URL}/api/cart//items`, {
        data: requestBody,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Assert
      expect(response.status()).toBe(400);
      
      const responseBody = await response.json();
      expect(responseBody).toHaveProperty('error');
      expect(responseBody.error).toContain('Invalid user ID');
    });
  });

  test.describe('Edge Cases', () => {
    test('should handle large quantity values correctly', async ({ request }) => {
      // Arrange
      const requestBody = {
        productId: '1',
        quantity: 999
      };

      // Act
      const response = await request.post(`${CART_SERVICE_URL}/api/cart/${TEST_USER_ID}/items`, {
        data: requestBody,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Assert
      expect(response.status()).toBe(200);
      
      const responseBody = await response.json();
      expect(responseBody.items[0].quantity).toBe(999);
      expect(responseBody.totalItems).toBe(999);
      
      // Verify total amount calculation with large quantity
      const expectedTotal = responseBody.items[0].price * 999;
      expect(responseBody.totalAmount).toBeCloseTo(expectedTotal, 2);
    });

    test('should handle very small decimal prices', async ({ request }) => {
      // Arrange
      const requestBody = {
        productId: '1',
        quantity: 1
      };

      // Act
      const response = await request.post(`${CART_SERVICE_URL}/api/cart/${TEST_USER_ID}/items`, {
        data: requestBody,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Assert
      expect(response.status()).toBe(200);
      
      const responseBody = await response.json();
      
      // Verify price precision is maintained
      expect(responseBody.totalAmount).toBeGreaterThan(0);
      
      // Check decimal places
      const decimalPlaces = (responseBody.totalAmount.toString().split('.')[1] || '').length;
      expect(decimalPlaces).toBeLessThanOrEqual(2);
    });

    test('should handle adding many items to cart', async ({ request }) => {
      // Arrange & Act - Add 10 different products
      const productIds = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
      
      for (const productId of productIds) {
        await request.post(`${CART_SERVICE_URL}/api/cart/${TEST_USER_ID}/items`, {
          data: { productId, quantity: 1 }
        });
      }

      // Get final cart state
      const response = await request.get(`${CART_SERVICE_URL}/api/cart/${TEST_USER_ID}`);

      // Assert
      expect(response.status()).toBe(200);
      
      const responseBody = await response.json();
      expect(responseBody.items.length).toBeGreaterThan(0);
      expect(responseBody.totalItems).toBeGreaterThan(0);
      expect(responseBody.totalAmount).toBeGreaterThan(0);
    });
  });

  test.describe('Data Integrity Tests', () => {
    test('should verify totalAmount equals sum of all items', async ({ request }) => {
      // Arrange - Add multiple items
      await request.post(`${CART_SERVICE_URL}/api/cart/${TEST_USER_ID}/items`, {
        data: { productId: '1', quantity: 2 }
      });
      
      await request.post(`${CART_SERVICE_URL}/api/cart/${TEST_USER_ID}/items`, {
        data: { productId: '2', quantity: 3 }
      });

      // Act
      const response = await request.get(`${CART_SERVICE_URL}/api/cart/${TEST_USER_ID}`);

      // Assert
      expect(response.status()).toBe(200);
      
      const responseBody = await response.json();
      
      // Calculate expected total manually
      const manualTotal = responseBody.items.reduce((sum: number, item: any) => {
        return sum + (item.price * item.quantity);
      }, 0);
      
      // Verify totalAmount matches manual calculation
      expect(responseBody.totalAmount).toBeCloseTo(manualTotal, 2);
    });

    test('should verify totalItems equals sum of all quantities', async ({ request }) => {
      // Arrange - Add multiple items with different quantities
      await request.post(`${CART_SERVICE_URL}/api/cart/${TEST_USER_ID}/items`, {
        data: { productId: '1', quantity: 2 }
      });
      
      await request.post(`${CART_SERVICE_URL}/api/cart/${TEST_USER_ID}/items`, {
        data: { productId: '2', quantity: 5 }
      });
      
      await request.post(`${CART_SERVICE_URL}/api/cart/${TEST_USER_ID}/items`, {
        data: { productId: '3', quantity: 1 }
      });

      // Act
      const response = await request.get(`${CART_SERVICE_URL}/api/cart/${TEST_USER_ID}`);

      // Assert
      expect(response.status()).toBe(200);
      
      const responseBody = await response.json();
      
      // Calculate expected total items manually
      const expectedTotalItems = responseBody.items.reduce((sum: number, item: any) => {
        return sum + item.quantity;
      }, 0);
      
      // Verify totalItems matches manual calculation (2 + 5 + 1 = 8)
      expect(responseBody.totalItems).toBe(expectedTotalItems);
      expect(responseBody.totalItems).toBe(8);
    });

    test('should maintain data consistency after multiple operations', async ({ request }) => {
      // Arrange - Perform multiple operations
      // 1. Add item
      await request.post(`${CART_SERVICE_URL}/api/cart/${TEST_USER_ID}/items`, {
        data: { productId: '1', quantity: 3 }
      });
      
      // 2. Add same item again (should increment)
      await request.post(`${CART_SERVICE_URL}/api/cart/${TEST_USER_ID}/items`, {
        data: { productId: '1', quantity: 2 }
      });
      
      // 3. Add different item
      await request.post(`${CART_SERVICE_URL}/api/cart/${TEST_USER_ID}/items`, {
        data: { productId: '2', quantity: 4 }
      });

      // Act - Get final cart state
      const response = await request.get(`${CART_SERVICE_URL}/api/cart/${TEST_USER_ID}`);

      // Assert
      expect(response.status()).toBe(200);
      
      const responseBody = await response.json();
      
      // Verify data integrity
      const manualTotal = responseBody.items.reduce((sum: number, item: any) => {
        return sum + (item.price * item.quantity);
      }, 0);
      
      const manualTotalItems = responseBody.items.reduce((sum: number, item: any) => {
        return sum + item.quantity;
      }, 0);
      
      expect(responseBody.totalAmount).toBeCloseTo(manualTotal, 2);
      expect(responseBody.totalItems).toBe(manualTotalItems);
      expect(responseBody.totalItems).toBe(9); // 3+2 for product1 + 4 for product2
    });
  });
});