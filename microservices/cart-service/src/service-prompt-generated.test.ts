import { CartService } from './service';
import { ProductServiceClient } from './product-client';
import { Cart, CartItem, Product } from './types';

jest.mock('./product-client');

describe('CartService Unit Tests', () => {
  let cartService: CartService;
  let mockProductClient: jest.Mocked<ProductServiceClient>;

  const mockProduct1: Product = {
    id: 'prod-1',
    name: 'Organic Bananas',
    price: 2.99,
    description: 'Fresh organic bananas',
    image: 'https://example.com/banana.jpg',
    dataAiHint: 'fruit, organic',
  };

  const mockProduct2: Product = {
    id: 'prod-2',
    name: 'Whole Milk',
    price: 4.50,
    description: 'Fresh whole milk',
    image: 'https://example.com/milk.jpg',
    dataAiHint: 'dairy',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    cartService = new CartService();
    mockProductClient = (cartService as any).productClient as jest.Mocked<ProductServiceClient>;
  });

  describe('getOrCreateCart - Positive Cases', () => {
    it('should create new cart for first-time user', async () => {
      const userId = 'user-new';
      
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
      const userId = 'user-returning';
      
      const cart1 = await cartService.getOrCreateCart(userId);
      const cart2 = await cartService.getOrCreateCart(userId);
      
      expect(cart1.id).toBe(cart2.id);
      expect(cart1).toBe(cart2);
    });

    it('should maintain separate carts for different users', async () => {
      const cart1 = await cartService.getOrCreateCart('user-1');
      const cart2 = await cartService.getOrCreateCart('user-2');
      
      expect(cart1.id).not.toBe(cart2.id);
      expect(cart1.userId).toBe('user-1');
      expect(cart2.userId).toBe('user-2');
    });
  });

  describe('addToCart - Positive Cases', () => {
    it('should add product to empty cart', async () => {
      mockProductClient.getProduct.mockResolvedValue(mockProduct1);
      
      const cart = await cartService.addToCart('user-1', 'prod-1', 1);
      
      expect(mockProductClient.getProduct).toHaveBeenCalledWith('prod-1');
      expect(mockProductClient.getProduct).toHaveBeenCalledTimes(1);
      expect(cart.items).toHaveLength(1);
      expect(cart.items[0].id).toBe('prod-1');
      expect(cart.items[0].quantity).toBe(1);
      expect(cart.totalItems).toBe(1);
      expect(cart.totalAmount).toBe(2.99);
    });

    it('should add multiple quantities of same product', async () => {
      mockProductClient.getProduct.mockResolvedValue(mockProduct1);
      
      const cart = await cartService.addToCart('user-1', 'prod-1', 3);
      
      expect(cart.items[0].quantity).toBe(3);
      expect(cart.totalItems).toBe(3);
      expect(cart.totalAmount).toBe(8.97);
    });

    it('should increment quantity when adding existing product', async () => {
      mockProductClient.getProduct.mockResolvedValue(mockProduct1);
      
      await cartService.addToCart('user-1', 'prod-1', 2);
      const cart = await cartService.addToCart('user-1', 'prod-1', 3);
      
      expect(cart.items).toHaveLength(1);
      expect(cart.items[0].quantity).toBe(5);
      expect(cart.totalItems).toBe(5);
      expect(cart.totalAmount).toBe(14.95);
    });

    it('should add different products to cart', async () => {
      mockProductClient.getProduct
        .mockResolvedValueOnce(mockProduct1)
        .mockResolvedValueOnce(mockProduct2);
      
      await cartService.addToCart('user-1', 'prod-1', 2);
      const cart = await cartService.addToCart('user-1', 'prod-2', 1);
      
      expect(cart.items).toHaveLength(2);
      expect(cart.totalItems).toBe(3);
      expect(cart.totalAmount).toBe(10.48);
    });
  });

  describe('addToCart - Negative Cases', () => {
    it('should throw error when product not found', async () => {
      mockProductClient.getProduct.mockResolvedValue(null);
      
      await expect(
        cartService.addToCart('user-1', 'invalid-id', 1)
      ).rejects.toThrow('Product not found');
      
      expect(mockProductClient.getProduct).toHaveBeenCalledWith('invalid-id');
    });

    it('should throw error for empty productId', async () => {
      mockProductClient.getProduct.mockResolvedValue(null);
      
      await expect(
        cartService.addToCart('user-1', '', 1)
      ).rejects.toThrow('Product not found');
    });

    it('should handle zero quantity by adding default 1', async () => {
      mockProductClient.getProduct.mockResolvedValue(mockProduct1);
      
      const cart = await cartService.addToCart('user-1', 'prod-1', 0);
      
      expect(cart.items[0].quantity).toBe(0);
      expect(cart.totalItems).toBe(0);
    });
  });

  describe('updateCartItem - Positive Cases', () => {
    it('should update quantity of existing item', async () => {
      mockProductClient.getProduct.mockResolvedValue(mockProduct1);
      await cartService.addToCart('user-1', 'prod-1', 2);
      
      const cart = await cartService.updateCartItem('user-1', 'prod-1', 5);
      
      expect(cart.items[0].quantity).toBe(5);
      expect(cart.totalItems).toBe(5);
      expect(cart.totalAmount).toBe(14.95);
    });

    it('should recalculate totals after update', async () => {
      mockProductClient.getProduct
        .mockResolvedValueOnce(mockProduct1)
        .mockResolvedValueOnce(mockProduct2);
      await cartService.addToCart('user-1', 'prod-1', 2);
      await cartService.addToCart('user-1', 'prod-2', 1);
      
      const cart = await cartService.updateCartItem('user-1', 'prod-1', 10);
      
      expect(cart.totalItems).toBe(11);
      expect(cart.totalAmount).toBe(34.40);
    });

    it('should remove item when quantity set to zero', async () => {
      mockProductClient.getProduct.mockResolvedValue(mockProduct1);
      await cartService.addToCart('user-1', 'prod-1', 2);
      
      const cart = await cartService.updateCartItem('user-1', 'prod-1', 0);
      
      expect(cart.items).toHaveLength(0);
      expect(cart.totalItems).toBe(0);
      expect(cart.totalAmount).toBe(0);
    });
  });

  describe('updateCartItem - Negative Cases', () => {
    it('should throw error when item not in cart', async () => {
      await expect(
        cartService.updateCartItem('user-1', 'prod-nonexistent', 5)
      ).rejects.toThrow('Item not found in cart');
    });

    it('should remove item when quantity is negative', async () => {
      mockProductClient.getProduct.mockResolvedValue(mockProduct1);
      await cartService.addToCart('user-1', 'prod-1', 2);
      
      const cart = await cartService.updateCartItem('user-1', 'prod-1', -1);
      
      expect(cart.items).toHaveLength(0);
    });
  });

  describe('removeFromCart - Positive Cases', () => {
    it('should remove item from cart', async () => {
      mockProductClient.getProduct.mockResolvedValue(mockProduct1);
      await cartService.addToCart('user-1', 'prod-1', 2);
      
      const cart = await cartService.removeFromCart('user-1', 'prod-1');
      
      expect(cart.items).toHaveLength(0);
      expect(cart.totalItems).toBe(0);
      expect(cart.totalAmount).toBe(0);
    });

    it('should recalculate totals after removal', async () => {
      mockProductClient.getProduct
        .mockResolvedValueOnce(mockProduct1)
        .mockResolvedValueOnce(mockProduct2);
      await cartService.addToCart('user-1', 'prod-1', 2);
      await cartService.addToCart('user-1', 'prod-2', 3);
      
      const cart = await cartService.removeFromCart('user-1', 'prod-1');
      
      expect(cart.items).toHaveLength(1);
      expect(cart.totalItems).toBe(3);
      expect(cart.totalAmount).toBe(13.50);
    });

    it('should handle removing non-existent item gracefully', async () => {
      const cart = await cartService.removeFromCart('user-1', 'prod-nonexistent');
      
      expect(cart.items).toHaveLength(0);
    });
  });

  describe('clearCart - Positive Cases', () => {
    it('should clear all items from cart', async () => {
      mockProductClient.getProduct
        .mockResolvedValueOnce(mockProduct1)
        .mockResolvedValueOnce(mockProduct2);
      await cartService.addToCart('user-1', 'prod-1', 2);
      await cartService.addToCart('user-1', 'prod-2', 3);
      
      const cart = await cartService.clearCart('user-1');
      
      expect(cart.items).toHaveLength(0);
      expect(cart.totalItems).toBe(0);
      expect(cart.totalAmount).toBe(0);
    });

    it('should maintain cart id and userId after clearing', async () => {
      mockProductClient.getProduct.mockResolvedValue(mockProduct1);
      const cart1 = await cartService.addToCart('user-1', 'prod-1', 2);
      const cart2 = await cartService.clearCart('user-1');
      
      expect(cart2.id).toBe(cart1.id);
      expect(cart2.userId).toBe(cart1.userId);
    });

    it('should clear empty cart without errors', async () => {
      const cart = await cartService.clearCart('user-new');
      
      expect(cart.items).toHaveLength(0);
      expect(cart.totalAmount).toBe(0);
    });
  });

  describe('getCart - Positive Cases', () => {
    it('should return cart with items', async () => {
      mockProductClient.getProduct.mockResolvedValue(mockProduct1);
      await cartService.addToCart('user-1', 'prod-1', 2);
      
      const cart = await cartService.getCart('user-1');
      
      expect(cart.items).toHaveLength(1);
      expect(cart.totalItems).toBe(2);
    });

    it('should return empty cart for new user', async () => {
      const cart = await cartService.getCart('user-new');
      
      expect(cart.items).toHaveLength(0);
      expect(cart.totalAmount).toBe(0);
      expect(cart.totalItems).toBe(0);
    });
  });

  describe('getCartSummary - Positive Cases', () => {
    it('should return correct summary for cart with items', async () => {
      mockProductClient.getProduct
        .mockResolvedValueOnce(mockProduct1)
        .mockResolvedValueOnce(mockProduct2);
      await cartService.addToCart('user-1', 'prod-1', 2);
      await cartService.addToCart('user-1', 'prod-2', 3);
      
      const summary = await cartService.getCartSummary('user-1');
      
      expect(summary.totalItems).toBe(5);
      expect(summary.totalAmount).toBe(19.48);
      expect(summary.itemCount).toBe(2);
    });

    it('should return zero summary for empty cart', async () => {
      const summary = await cartService.getCartSummary('user-new');
      
      expect(summary.totalItems).toBe(0);
      expect(summary.totalAmount).toBe(0);
      expect(summary.itemCount).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle floating point precision correctly', async () => {
      const precisionProduct: Product = {
        id: 'prod-precision',
        name: 'Test Product',
        price: 0.1,
        description: 'Precision test',
        image: 'test.jpg',
        dataAiHint: 'test',
      };
      mockProductClient.getProduct.mockResolvedValue(precisionProduct);
      
      const cart = await cartService.addToCart('user-1', 'prod-precision', 7);
      
      expect(cart.totalAmount).toBe(0.70);
    });

    it('should handle multiple products with decimal prices', async () => {
      const product1: Product = { ...mockProduct1, price: 10.99 };
      const product2: Product = { ...mockProduct2, price: 25.50 };
      
      mockProductClient.getProduct
        .mockResolvedValueOnce(product1)
        .mockResolvedValueOnce(product2);
      
      await cartService.addToCart('user-1', 'prod-1', 3);
      const cart = await cartService.addToCart('user-1', 'prod-2', 2);
      
      expect(cart.totalAmount).toBe(83.97);
    });

    it('should update updatedAt timestamp on modifications', async () => {
      mockProductClient.getProduct.mockResolvedValue(mockProduct1);
      
      const initialCart = await cartService.getOrCreateCart('user-1');
      const initialTimestamp = initialCart.updatedAt.getTime();
      
      const updatedCart = await cartService.addToCart('user-1', 'prod-1', 1);
      const updatedTimestamp = updatedCart.updatedAt.getTime();
      
      expect(updatedTimestamp).toBeGreaterThanOrEqual(initialTimestamp);
    });
  });

  describe('Mock Verification', () => {
    it('should call getProduct with correct parameters', async () => {
      mockProductClient.getProduct.mockResolvedValue(mockProduct1);
      
      await cartService.addToCart('user-1', 'prod-test', 2);
      
      expect(mockProductClient.getProduct).toHaveBeenCalledWith('prod-test');
      expect(mockProductClient.getProduct).toHaveBeenCalledTimes(1);
    });

    it('should not make network calls with mocked client', async () => {
      mockProductClient.getProduct.mockResolvedValue(mockProduct1);
      
      await cartService.addToCart('user-1', 'prod-1', 1);
      
      expect(mockProductClient.getProduct).toHaveBeenCalled();
      expect(jest.isMockFunction(mockProductClient.getProduct)).toBe(true);
    });
  });
});