import { CartService } from './service';
import { ProductServiceClient } from './product-client';
import { mockProducts, createMockProduct, createProductWithPrice } from './__fixtures__';

// Mock the ProductServiceClient
jest.mock('./product-client');

describe('CartService', () => {
  let cartService: CartService;
  let mockProductClient: jest.Mocked<ProductServiceClient>;

  // Use centralized test fixtures for reusability
  const { product1, product2, product3 } = mockProducts;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Create a new instance of CartService
    cartService = new CartService();

    // Get the mocked ProductServiceClient instance
    mockProductClient = (cartService as any).productClient as jest.Mocked<ProductServiceClient>;

    // Setup default mock implementations
    mockProductClient.getProduct = jest.fn();
    mockProductClient.getProducts = jest.fn();
  });

  describe('getOrCreateCart', () => {
    it('should create a new cart for a new user', async () => {
      const userId = 'user-123';
      const cart = await cartService.getOrCreateCart(userId);

      expect(cart).toBeDefined();
      expect(cart.userId).toBe(userId);
      expect(cart.items).toEqual([]);
      expect(cart.totalAmount).toBe(0);
      expect(cart.totalItems).toBe(0);
      expect(cart.id).toBeDefined();
      expect(cart.createdAt).toBeInstanceOf(Date);
      expect(cart.updatedAt).toBeInstanceOf(Date);
    });

    it('should return existing cart for returning user', async () => {
      const userId = 'user-123';
      const cart1 = await cartService.getOrCreateCart(userId);
      const cart2 = await cartService.getOrCreateCart(userId);

      expect(cart1.id).toBe(cart2.id);
      expect(cart1).toBe(cart2);
    });
  });

  describe('addToCart', () => {
    it('should add a valid product to cart', async () => {
      const userId = 'user-123';
      mockProductClient.getProduct.mockResolvedValue(product1);

      const cart = await cartService.addToCart(userId, product1.id, 1);

      expect(mockProductClient.getProduct).toHaveBeenCalledWith(product1.id);
      expect(cart.items).toHaveLength(1);
      expect(cart.items[0].id).toBe(product1.id);
      expect(cart.items[0].name).toBe(product1.name);
      expect(cart.items[0].price).toBe(product1.price);
      expect(cart.items[0].quantity).toBe(1);
      expect(cart.totalItems).toBe(1);
      expect(cart.totalAmount).toBe(10.99);
    });

    it('should add multiple quantities of a product', async () => {
      const userId = 'user-123';
      mockProductClient.getProduct.mockResolvedValue(product1);

      const cart = await cartService.addToCart(userId, product1.id, 3);

      expect(cart.items).toHaveLength(1);
      expect(cart.items[0].quantity).toBe(3);
      expect(cart.totalItems).toBe(3);
      expect(cart.totalAmount).toBe(32.97);
    });

    it('should increment quantity if product already exists in cart', async () => {
      const userId = 'user-123';
      mockProductClient.getProduct.mockResolvedValue(product1);

      await cartService.addToCart(userId, product1.id, 2);
      const cart = await cartService.addToCart(userId, product1.id, 3);

      expect(cart.items).toHaveLength(1);
      expect(cart.items[0].quantity).toBe(5);
      expect(cart.totalItems).toBe(5);
      expect(cart.totalAmount).toBe(54.95);
    });

    it('should throw error if product not found', async () => {
      const userId = 'user-123';
      mockProductClient.getProduct.mockResolvedValue(null);

      await expect(cartService.addToCart(userId, 'invalid-id', 1)).rejects.toThrow(
        'Product not found'
      );
    });

    it('should add multiple different products to cart', async () => {
      const userId = 'user-123';
      mockProductClient.getProduct
        .mockResolvedValueOnce(product1)
        .mockResolvedValueOnce(product2);

      await cartService.addToCart(userId, product1.id, 2);
      const cart = await cartService.addToCart(userId, product2.id, 1);

      expect(cart.items).toHaveLength(2);
      expect(cart.totalItems).toBe(3);
      expect(cart.totalAmount).toBe(47.48); // (10.99 * 2) + (25.50 * 1)
    });

    it('should handle floating point precision correctly with 3 items at 10.99', async () => {
      const userId = 'user-123';
      mockProductClient.getProduct.mockResolvedValue(product1);

      const cart = await cartService.addToCart(userId, product1.id, 3);

      // 10.99 * 3 = 32.97 (should be exact)
      expect(cart.totalAmount).toBe(32.97);
      expect(cart.totalItems).toBe(3);
      
      // Verify it's rounded to 2 decimal places
      expect(Number(cart.totalAmount.toFixed(2))).toBe(cart.totalAmount);
    });

    it('should update updatedAt timestamp', async () => {
      const userId = 'user-123';
      mockProductClient.getProduct.mockResolvedValue(product1);

      const cart1 = await cartService.getOrCreateCart(userId);
      const originalUpdatedAt = cart1.updatedAt;

      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));

      const cart2 = await cartService.addToCart(userId, product1.id, 1);

      expect(cart2.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });

  describe('updateCartItem', () => {
    it('should update quantity of existing item', async () => {
      const userId = 'user-123';
      mockProductClient.getProduct.mockResolvedValue(product1);

      await cartService.addToCart(userId, product1.id, 2);
      const cart = await cartService.updateCartItem(userId, product1.id, 5);

      expect(cart.items[0].quantity).toBe(5);
      expect(cart.totalItems).toBe(5);
      expect(cart.totalAmount).toBe(54.95); // 10.99 * 5
    });

    it('should calculate totals correctly after update', async () => {
      const userId = 'user-123';
      mockProductClient.getProduct
        .mockResolvedValueOnce(product1)
        .mockResolvedValueOnce(product2);

      await cartService.addToCart(userId, product1.id, 2);
      await cartService.addToCart(userId, product2.id, 1);
      const cart = await cartService.updateCartItem(userId, product1.id, 10);

      expect(cart.totalItems).toBe(11); // 10 + 1
      expect(cart.totalAmount).toBe(135.40); // (10.99 * 10) + (25.50 * 1)
    });

    it('should ensure totalAmount is rounded to 2 decimal places', async () => {
      const userId = 'user-123';
      
      // Use fixture for precision testing
      const precisionProduct = mockProducts.precisionProduct;

      mockProductClient.getProduct.mockResolvedValue(precisionProduct);

      await cartService.addToCart(userId, precisionProduct.id, 3);
      const cart = await cartService.updateCartItem(userId, precisionProduct.id, 7);

      // 0.1 * 7 could result in floating point imprecision
      expect(cart.totalAmount).toBe(0.70);
      // Verify exactly 2 decimal places
      expect(cart.totalAmount.toString().split('.')[1]?.length || 0).toBeLessThanOrEqual(2);
    });

    it('should handle floating point precision with multiple price points', async () => {
      const userId = 'user-123';
      mockProductClient.getProduct
        .mockResolvedValueOnce(product1) // 10.99
        .mockResolvedValueOnce(product2) // 25.50
        .mockResolvedValueOnce(product3); // 5.00

      await cartService.addToCart(userId, product1.id, 3);
      await cartService.addToCart(userId, product2.id, 2);
      await cartService.addToCart(userId, product3.id, 4);

      const cart = await cartService.updateCartItem(userId, product1.id, 7);

      // (10.99 * 7) + (25.50 * 2) + (5.00 * 4) = 76.93 + 51.00 + 20.00 = 147.93
      expect(cart.totalAmount).toBe(147.93);
      expect(cart.totalItems).toBe(13); // 7 + 2 + 4
      
      // Verify rounding to 2 decimal places
      const decimalPart = cart.totalAmount.toString().split('.')[1];
      expect(decimalPart?.length || 0).toBeLessThanOrEqual(2);
    });

    it('should throw error if item not in cart', async () => {
      const userId = 'user-123';

      await expect(
        cartService.updateCartItem(userId, 'non-existent-id', 5)
      ).rejects.toThrow('Item not found in cart');
    });

    it('should remove item if quantity set to 0', async () => {
      const userId = 'user-123';
      mockProductClient.getProduct.mockResolvedValue(product1);

      await cartService.addToCart(userId, product1.id, 2);
      const cart = await cartService.updateCartItem(userId, product1.id, 0);

      expect(cart.items).toHaveLength(0);
      expect(cart.totalItems).toBe(0);
      expect(cart.totalAmount).toBe(0);
    });

    it('should remove item if quantity set to negative', async () => {
      const userId = 'user-123';
      mockProductClient.getProduct.mockResolvedValue(product1);

      await cartService.addToCart(userId, product1.id, 2);
      const cart = await cartService.updateCartItem(userId, product1.id, -1);

      expect(cart.items).toHaveLength(0);
      expect(cart.totalItems).toBe(0);
      expect(cart.totalAmount).toBe(0);
    });
  });

  describe('removeFromCart', () => {
    it('should remove item from cart', async () => {
      const userId = 'user-123';
      mockProductClient.getProduct.mockResolvedValue(product1);

      await cartService.addToCart(userId, product1.id, 2);
      const cart = await cartService.removeFromCart(userId, product1.id);

      expect(cart.items).toHaveLength(0);
      expect(cart.totalItems).toBe(0);
      expect(cart.totalAmount).toBe(0);
    });

    it('should recalculate totals after removal', async () => {
      const userId = 'user-123';
      mockProductClient.getProduct
        .mockResolvedValueOnce(product1)
        .mockResolvedValueOnce(product2);

      await cartService.addToCart(userId, product1.id, 2);
      await cartService.addToCart(userId, product2.id, 3);
      const cart = await cartService.removeFromCart(userId, product1.id);

      expect(cart.items).toHaveLength(1);
      expect(cart.totalItems).toBe(3);
      expect(cart.totalAmount).toBe(76.50); // 25.50 * 3
    });

    it('should handle removing non-existent item gracefully', async () => {
      const userId = 'user-123';

      const cart = await cartService.removeFromCart(userId, 'non-existent-id');

      expect(cart.items).toHaveLength(0);
      expect(cart.totalAmount).toBe(0);
    });
  });

  describe('clearCart', () => {
    it('should clear all items from cart', async () => {
      const userId = 'user-123';
      mockProductClient.getProduct
        .mockResolvedValueOnce(product1)
        .mockResolvedValueOnce(product2);

      await cartService.addToCart(userId, product1.id, 2);
      await cartService.addToCart(userId, product2.id, 3);
      const cart = await cartService.clearCart(userId);

      expect(cart.items).toHaveLength(0);
      expect(cart.totalItems).toBe(0);
      expect(cart.totalAmount).toBe(0);
    });

    it('should maintain cart id and userId after clearing', async () => {
      const userId = 'user-123';
      mockProductClient.getProduct.mockResolvedValue(product1);

      const cart1 = await cartService.addToCart(userId, product1.id, 2);
      const cart2 = await cartService.clearCart(userId);

      expect(cart2.id).toBe(cart1.id);
      expect(cart2.userId).toBe(cart1.userId);
    });
  });

  describe('getCart', () => {
    it('should return cart for user', async () => {
      const userId = 'user-123';
      mockProductClient.getProduct.mockResolvedValue(product1);

      await cartService.addToCart(userId, product1.id, 2);
      const cart = await cartService.getCart(userId);

      expect(cart.items).toHaveLength(1);
      expect(cart.totalItems).toBe(2);
    });

    it('should return empty cart for new user', async () => {
      const userId = 'user-456';

      const cart = await cartService.getCart(userId);

      expect(cart.items).toHaveLength(0);
      expect(cart.totalAmount).toBe(0);
      expect(cart.totalItems).toBe(0);
    });
  });

  describe('getCartSummary', () => {
    it('should return correct summary for cart with items', async () => {
      const userId = 'user-123';
      mockProductClient.getProduct
        .mockResolvedValueOnce(product1)
        .mockResolvedValueOnce(product2);

      await cartService.addToCart(userId, product1.id, 2);
      await cartService.addToCart(userId, product2.id, 3);
      const summary = await cartService.getCartSummary(userId);

      expect(summary.totalItems).toBe(5); // 2 + 3
      expect(summary.totalAmount).toBe(98.48); // (10.99 * 2) + (25.50 * 3)
      expect(summary.itemCount).toBe(2); // 2 unique products
    });

    it('should return zero summary for empty cart', async () => {
      const userId = 'user-456';

      const summary = await cartService.getCartSummary(userId);

      expect(summary.totalItems).toBe(0);
      expect(summary.totalAmount).toBe(0);
      expect(summary.itemCount).toBe(0);
    });
  });

  describe('Floating Point Precision Edge Cases', () => {
    it('should handle 3 items at 10.99 with correct precision', async () => {
      const userId = 'user-123';
      mockProductClient.getProduct.mockResolvedValue(product1);

      const cart = await cartService.addToCart(userId, product1.id, 3);

      // The edge case: 10.99 * 3 = 32.97
      expect(cart.totalAmount).toBe(32.97);
      expect(cart.totalItems).toBe(3);
      
      // Verify exactly 2 decimal places
      const totalStr = cart.totalAmount.toString();
      if (totalStr.includes('.')) {
        const decimals = totalStr.split('.')[1];
        expect(decimals.length).toBeLessThanOrEqual(2);
      }
    });

    it('should handle complex floating point calculations', async () => {
      const userId = 'user-123';
      
      // Use fixture for low price testing
      const floatProduct = mockProducts.lowPriceProduct;

      mockProductClient.getProduct.mockResolvedValue(floatProduct);

      // 0.07 * 3 = 0.21, which can have floating point issues
      const cart = await cartService.addToCart(userId, floatProduct.id, 3);

      expect(cart.totalAmount).toBe(0.21);
      expect(Math.round(cart.totalAmount * 100) / 100).toBe(cart.totalAmount);
    });

    it('should maintain precision across multiple operations', async () => {
      const userId = 'user-123';
      mockProductClient.getProduct.mockResolvedValue(product1);

      // Add 3 items
      await cartService.addToCart(userId, product1.id, 3);
      // Add 2 more
      await cartService.addToCart(userId, product1.id, 2);
      // Update to 10
      const cart = await cartService.updateCartItem(userId, product1.id, 10);

      // 10.99 * 10 = 109.90
      expect(cart.totalAmount).toBe(109.90);
      expect(cart.totalItems).toBe(10);
      
      // Verify precision
      const decimalPart = cart.totalAmount.toString().split('.')[1];
      expect(decimalPart?.length || 0).toBeLessThanOrEqual(2);
    });

    it('should handle edge case with many decimal operations', async () => {
      const userId = 'user-123';
      
      // Use fixtures for complex calculations
      const complexProduct1 = product1; // 10.99
      const complexProduct2 = mockProducts.complexDecimalProduct; // 15.97
      const complexProduct3 = mockProducts.edgeCaseProduct; // 7.03

      mockProductClient.getProduct
        .mockResolvedValueOnce(complexProduct1)
        .mockResolvedValueOnce(complexProduct2)
        .mockResolvedValueOnce(complexProduct3);

      await cartService.addToCart(userId, complexProduct1.id, 3);
      await cartService.addToCart(userId, complexProduct2.id, 2);
      const cart = await cartService.addToCart(userId, complexProduct3.id, 5);

      // (10.99 * 3) + (15.97 * 2) + (7.03 * 5)
      // = 32.97 + 31.94 + 35.15 = 100.06
      expect(cart.totalAmount).toBe(100.06);
      
      // Ensure it's rounded to 2 decimal places
      expect(Number(cart.totalAmount.toFixed(2))).toBe(cart.totalAmount);
    });
  });

  describe('Mock Verification', () => {
    it('should verify ProductServiceClient.getProduct is called with correct parameters', async () => {
      const userId = 'user-123';
      const productId = 'test-product-id';
      mockProductClient.getProduct.mockResolvedValue(product1);

      await cartService.addToCart(userId, productId, 2);

      expect(mockProductClient.getProduct).toHaveBeenCalledTimes(1);
      expect(mockProductClient.getProduct).toHaveBeenCalledWith(productId);
    });

    it('should not make network calls when using mocks', async () => {
      const userId = 'user-123';
      mockProductClient.getProduct.mockResolvedValue(product1);

      await cartService.addToCart(userId, product1.id, 1);

      // Verify the mock was called, proving no real network call was made
      expect(mockProductClient.getProduct).toHaveBeenCalled();
      expect(jest.isMockFunction(mockProductClient.getProduct)).toBe(true);
    });
  });
});
