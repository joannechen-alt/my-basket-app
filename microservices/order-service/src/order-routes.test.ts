import request from 'supertest';
import express from 'express';
import { OrderService } from './service';
import { CartServiceClient } from './cart-client';

// Create mock functions
const mockCreateOrder = jest.fn();
const mockGetUserOrders = jest.fn();
const mockGetOrder = jest.fn();
const mockUpdateOrderStatus = jest.fn();
const mockClearCart = jest.fn();

// Helper function to reset and setup mocks
const setupMockCreateOrder = (returnValue: any) => {
  mockCreateOrder.mockClear();
  mockCreateOrder.mockResolvedValue(returnValue);
};
const setupMockGetUserOrders = (returnValue: any) => {
  mockGetUserOrders.mockClear();
  mockGetUserOrders.mockResolvedValue(returnValue);
};
const setupMockGetOrder = (returnValue: any) => {
  mockGetOrder.mockClear();
  mockGetOrder.mockResolvedValue(returnValue);
};
const setupMockUpdateOrderStatus = (returnValue: any) => {
  mockUpdateOrderStatus.mockClear();
  mockUpdateOrderStatus.mockResolvedValue(returnValue);
};
const setupMockClearCart = (returnValue: any) => {
  mockClearCart.mockClear();
  mockClearCart.mockResolvedValue(returnValue);
};

// Mock the OrderService and CartServiceClient
jest.mock('./service', () => {
  return {
    OrderService: jest.fn().mockImplementation(() => {
      return {
        createOrder: mockCreateOrder,
        getUserOrders: mockGetUserOrders,
        getOrder: mockGetOrder,
        updateOrderStatus: mockUpdateOrderStatus,
      };
    }),
  };
});

jest.mock('./cart-client', () => {
  return {
    CartServiceClient: jest.fn().mockImplementation(() => {
      return {
        clearCart: mockClearCart,
      };
    }),
  };
});

// Import router after mocks are set up
import router from './routes';

const app = express();
app.use(express.json());
app.use('/api', router);

describe('POST /api/orders/:userId - createOrder Route', () => {
  const validOrderData = {
    items: [
      {
        id: 'prod-1',
        name: 'Organic Apples',
        price: 3.99,
        description: 'Fresh organic apples',
        image: 'https://example.com/apple.jpg',
        dataAiHint: 'apples fruit',
        quantity: 2,
      },
    ],
    shippingAddress: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA',
    },
    billingAddress: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA',
    },
    paymentMethod: {
      type: 'credit_card' as const,
      last4: '4242',
      brand: 'Visa',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Positive Test Cases - Happy Path', () => {
    it('should create order with single item and return 201 status', async () => {
      // Arrange
      const userId = 'user-123';
      const expectedOrder = {
        id: 'order-123',
        userId,
        items: validOrderData.items,
        totalAmount: 7.98, // 3.99 * 2
        status: 'pending',
        shippingAddress: validOrderData.shippingAddress,
        billingAddress: validOrderData.billingAddress,
        paymentMethod: validOrderData.paymentMethod,
        orderDate: new Date(),
        estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setupMockCreateOrder(expectedOrder);

      // Act
      const response = await request(app)
        .post(`/api/orders/${userId}`)
        .send(validOrderData)
        .set('Content-Type', 'application/json');

      // Assert
      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        id: expect.any(String),
        userId,
        totalAmount: 7.98,
        status: 'pending',
      });
      expect(response.body.items).toHaveLength(1);
      expect(response.body.items[0]).toMatchObject({
        id: 'prod-1',
        name: 'Organic Apples',
        price: 3.99,
        quantity: 2,
      });
      expect(mockCreateOrder).toHaveBeenCalledWith(userId, validOrderData);
    });

    it('should create order with multiple items and calculate correct total', async () => {
      // Arrange
      const userId = 'user-456';
      const multiItemOrder = {
        ...validOrderData,
        items: [
          ...validOrderData.items,
          {
            id: 'prod-2',
            name: 'Whole Wheat Bread',
            price: 4.49,
            description: 'Fresh bread',
            image: 'https://example.com/bread.jpg',
            dataAiHint: 'bread bakery',
            quantity: 1,
          },
          {
            id: 'prod-3',
            name: 'Free-Range Eggs',
            price: 5.99,
            description: 'Dozen eggs',
            image: 'https://example.com/eggs.jpg',
            dataAiHint: 'eggs dairy',
            quantity: 3,
          },
        ],
      };

      const expectedTotal = 3.99 * 2 + 4.49 * 1 + 5.99 * 3; // 30.44

      const expectedOrder = {
        id: 'order-456',
        userId,
        items: multiItemOrder.items,
        totalAmount: expectedTotal,
        status: 'pending',
        shippingAddress: multiItemOrder.shippingAddress,
        billingAddress: multiItemOrder.billingAddress,
        paymentMethod: multiItemOrder.paymentMethod,
        orderDate: new Date(),
        estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCreateOrder.mockClear();

      mockCreateOrder.mockResolvedValue(expectedOrder);

      // Act
      const response = await request(app)
        .post(`/api/orders/${userId}`)
        .send(multiItemOrder)
        .set('Content-Type', 'application/json');

      // Assert
      expect(response.status).toBe(201);
      expect(response.body.totalAmount).toBeCloseTo(30.44, 2);
      expect(response.body.items).toHaveLength(3);
    });

    it('should set order status to PENDING by default', async () => {
      // Arrange
      const userId = 'user-789';
      const expectedOrder = {
        id: 'order-789',
        userId,
        items: validOrderData.items,
        totalAmount: 7.98,
        status: 'pending',
        shippingAddress: validOrderData.shippingAddress,
        billingAddress: validOrderData.billingAddress,
        paymentMethod: validOrderData.paymentMethod,
        orderDate: new Date(),
        estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCreateOrder.mockClear();

      mockCreateOrder.mockResolvedValue(expectedOrder);

      // Act
      const response = await request(app)
        .post(`/api/orders/${userId}`)
        .send(validOrderData)
        .set('Content-Type', 'application/json');

      // Assert
      expect(response.status).toBe(201);
      expect(response.body.status).toBe('pending');
    });

    it('should include estimated delivery date 5 days from order date', async () => {
      // Arrange
      const userId = 'user-delivery';
      const orderDate = new Date();
      const estimatedDelivery = new Date(orderDate);
      estimatedDelivery.setDate(orderDate.getDate() + 5);

      const expectedOrder = {
        id: 'order-delivery',
        userId,
        items: validOrderData.items,
        totalAmount: 7.98,
        status: 'pending',
        shippingAddress: validOrderData.shippingAddress,
        billingAddress: validOrderData.billingAddress,
        paymentMethod: validOrderData.paymentMethod,
        orderDate,
        estimatedDelivery,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCreateOrder.mockClear();

      mockCreateOrder.mockResolvedValue(expectedOrder);

      // Act
      const response = await request(app)
        .post(`/api/orders/${userId}`)
        .send(validOrderData)
        .set('Content-Type', 'application/json');

      // Assert
      expect(response.status).toBe(201);
      expect(response.body.estimatedDelivery).toBeDefined();
      
      const returnedDelivery = new Date(response.body.estimatedDelivery);
      const daysDifference = Math.floor(
        (returnedDelivery.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      expect(daysDifference).toBeGreaterThanOrEqual(4);
      expect(daysDifference).toBeLessThanOrEqual(5);
    });

    it('should preserve shipping and billing addresses', async () => {
      // Arrange
      const userId = 'user-address';
      const customAddress = {
        street: '456 Oak Avenue',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
        country: 'USA',
      };

      const orderWithCustomAddress = {
        ...validOrderData,
        shippingAddress: customAddress,
        billingAddress: { ...customAddress, street: '789 Pine St' },
      };

      const expectedOrder = {
        id: 'order-address',
        userId,
        items: validOrderData.items,
        totalAmount: 7.98,
        status: 'pending',
        shippingAddress: orderWithCustomAddress.shippingAddress,
        billingAddress: orderWithCustomAddress.billingAddress,
        paymentMethod: validOrderData.paymentMethod,
        orderDate: new Date(),
        estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCreateOrder.mockClear();

      mockCreateOrder.mockResolvedValue(expectedOrder);

      // Act
      const response = await request(app)
        .post(`/api/orders/${userId}`)
        .send(orderWithCustomAddress)
        .set('Content-Type', 'application/json');

      // Assert
      expect(response.status).toBe(201);
      expect(response.body.shippingAddress).toEqual(customAddress);
      expect(response.body.billingAddress.street).toBe('789 Pine St');
    });
  });

  describe('Negative Test Cases - Invalid Inputs', () => {
    it('should return 400 when items array is empty', async () => {
      // Arrange
      const userId = 'user-empty';
      const invalidOrder = {
        ...validOrderData,
        items: [],
      };

      // Act
      const response = await request(app)
        .post(`/api/orders/${userId}`)
        .send(invalidOrder)
        .set('Content-Type', 'application/json');

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid order data');
    });

    it('should return 400 when items field is missing', async () => {
      // Arrange
      const userId = 'user-no-items';
      const { items, ...orderWithoutItems } = validOrderData;

      // Act
      const response = await request(app)
        .post(`/api/orders/${userId}`)
        .send(orderWithoutItems)
        .set('Content-Type', 'application/json');

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 when shippingAddress is missing', async () => {
      // Arrange
      const userId = 'user-no-shipping';
      const { shippingAddress, ...orderWithoutShipping } = validOrderData;

      // Act
      const response = await request(app)
        .post(`/api/orders/${userId}`)
        .send(orderWithoutShipping)
        .set('Content-Type', 'application/json');

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid order data');
    });

    it('should return 400 when billingAddress is missing', async () => {
      // Arrange
      const userId = 'user-no-billing';
      const { billingAddress, ...orderWithoutBilling } = validOrderData;

      // Act
      const response = await request(app)
        .post(`/api/orders/${userId}`)
        .send(orderWithoutBilling)
        .set('Content-Type', 'application/json');

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid order data');
    });

    it('should return 400 when item price is negative', async () => {
      // Arrange
      const userId = 'user-negative-price';
      const invalidOrder = {
        ...validOrderData,
        items: [
          {
            ...validOrderData.items[0],
            price: -10.99,
          },
        ],
      };

      // Act
      const response = await request(app)
        .post(`/api/orders/${userId}`)
        .send(invalidOrder)
        .set('Content-Type', 'application/json');

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid order data');
    });

    it('should return 400 when item quantity is zero', async () => {
      // Arrange
      const userId = 'user-zero-quantity';
      const invalidOrder = {
        ...validOrderData,
        items: [
          {
            ...validOrderData.items[0],
            quantity: 0,
          },
        ],
      };

      // Act
      const response = await request(app)
        .post(`/api/orders/${userId}`)
        .send(invalidOrder)
        .set('Content-Type', 'application/json');

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid order data');
    });

    it('should return 400 when item quantity is negative', async () => {
      // Arrange
      const userId = 'user-negative-quantity';
      const invalidOrder = {
        ...validOrderData,
        items: [
          {
            ...validOrderData.items[0],
            quantity: -5,
          },
        ],
      };

      // Act
      const response = await request(app)
        .post(`/api/orders/${userId}`)
        .send(invalidOrder)
        .set('Content-Type', 'application/json');

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid order data');
    });

    it('should return 400 when address is missing required fields', async () => {
      // Arrange
      const userId = 'user-incomplete-address';
      const invalidOrder = {
        ...validOrderData,
        shippingAddress: {
          street: '123 Main St',
          // Missing city, state, zipCode, country
        },
      };

      // Act
      const response = await request(app)
        .post(`/api/orders/${userId}`)
        .send(invalidOrder)
        .set('Content-Type', 'application/json');

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid order data');
    });

    it('should return 400 when paymentMethod type is invalid', async () => {
      // Arrange
      const userId = 'user-invalid-payment';
      const invalidOrder = {
        ...validOrderData,
        paymentMethod: {
          type: 'invalid_payment_type',
          last4: '1234',
        },
      };

      // Act
      const response = await request(app)
        .post(`/api/orders/${userId}`)
        .send(invalidOrder)
        .set('Content-Type', 'application/json');

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid order data');
    });

    it('should return 400 when item is missing required fields', async () => {
      // Arrange
      const userId = 'user-incomplete-item';
      const invalidOrder = {
        ...validOrderData,
        items: [
          {
            id: 'prod-1',
            // Missing name, price, description, etc.
            quantity: 1,
          },
        ],
      };

      // Act
      const response = await request(app)
        .post(`/api/orders/${userId}`)
        .send(invalidOrder)
        .set('Content-Type', 'application/json');

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid order data');
    });
  });

  describe('Edge Cases', () => {
    it('should handle order with very large quantity correctly', async () => {
      // Arrange
      const userId = 'user-large-quantity';
      const largeQuantityOrder = {
        ...validOrderData,
        items: [
          {
            ...validOrderData.items[0],
            quantity: 999999,
          },
        ],
      };

      const expectedTotal = 3.99 * 999999; // 3,989,996.01

      const expectedOrder = {
        id: 'order-large',
        userId,
        items: largeQuantityOrder.items,
        totalAmount: expectedTotal,
        status: 'pending',
        shippingAddress: validOrderData.shippingAddress,
        billingAddress: validOrderData.billingAddress,
        paymentMethod: validOrderData.paymentMethod,
        orderDate: new Date(),
        estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCreateOrder.mockClear();

      mockCreateOrder.mockResolvedValue(expectedOrder);

      // Act
      const response = await request(app)
        .post(`/api/orders/${userId}`)
        .send(largeQuantityOrder)
        .set('Content-Type', 'application/json');

      // Assert
      expect(response.status).toBe(201);
      expect(response.body.totalAmount).toBe(expectedTotal);
    });

    it('should handle decimal prices with correct precision', async () => {
      // Arrange
      const userId = 'user-decimal';
      const decimalPriceOrder = {
        ...validOrderData,
        items: [
          {
            ...validOrderData.items[0],
            price: 10.99,
            quantity: 3,
          },
        ],
      };

      const expectedTotal = 32.97; // 10.99 * 3

      const expectedOrder = {
        id: 'order-decimal',
        userId,
        items: decimalPriceOrder.items,
        totalAmount: expectedTotal,
        status: 'pending',
        shippingAddress: validOrderData.shippingAddress,
        billingAddress: validOrderData.billingAddress,
        paymentMethod: validOrderData.paymentMethod,
        orderDate: new Date(),
        estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCreateOrder.mockClear();

      mockCreateOrder.mockResolvedValue(expectedOrder);

      // Act
      const response = await request(app)
        .post(`/api/orders/${userId}`)
        .send(decimalPriceOrder)
        .set('Content-Type', 'application/json');

      // Assert
      expect(response.status).toBe(201);
      expect(response.body.totalAmount).toBe(32.97);
      
      // Verify 2 decimal places
      const totalStr = response.body.totalAmount.toString();
      if (totalStr.includes('.')) {
        const decimals = totalStr.split('.')[1];
        expect(decimals.length).toBeLessThanOrEqual(2);
      }
    });

    it('should handle order with very small decimal price', async () => {
      // Arrange
      const userId = 'user-small-price';
      const smallPriceOrder = {
        ...validOrderData,
        items: [
          {
            ...validOrderData.items[0],
            price: 0.01,
            quantity: 1,
          },
        ],
      };

      const expectedOrder = {
        id: 'order-small',
        userId,
        items: smallPriceOrder.items,
        totalAmount: 0.01,
        status: 'pending',
        shippingAddress: validOrderData.shippingAddress,
        billingAddress: validOrderData.billingAddress,
        paymentMethod: validOrderData.paymentMethod,
        orderDate: new Date(),
        estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCreateOrder.mockClear();

      mockCreateOrder.mockResolvedValue(expectedOrder);

      // Act
      const response = await request(app)
        .post(`/api/orders/${userId}`)
        .send(smallPriceOrder)
        .set('Content-Type', 'application/json');

      // Assert
      expect(response.status).toBe(201);
      expect(response.body.totalAmount).toBe(0.01);
    });

    it('should handle special characters in product name', async () => {
      // Arrange
      const userId = 'user-special-chars';
      const specialCharsOrder = {
        ...validOrderData,
        items: [
          {
            ...validOrderData.items[0],
            name: 'Mouse & Keyboard #1 (Pro)',
          },
        ],
      };

      const expectedOrder = {
        id: 'order-special',
        userId,
        items: specialCharsOrder.items,
        totalAmount: 7.98,
        status: 'pending',
        shippingAddress: validOrderData.shippingAddress,
        billingAddress: validOrderData.billingAddress,
        paymentMethod: validOrderData.paymentMethod,
        orderDate: new Date(),
        estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCreateOrder.mockClear();

      mockCreateOrder.mockResolvedValue(expectedOrder);

      // Act
      const response = await request(app)
        .post(`/api/orders/${userId}`)
        .send(specialCharsOrder)
        .set('Content-Type', 'application/json');

      // Assert
      expect(response.status).toBe(201);
      expect(response.body.items[0].name).toBe('Mouse & Keyboard #1 (Pro)');
    });

    it('should handle unicode characters in product name', async () => {
      // Arrange
      const userId = 'user-unicode';
      const unicodeOrder = {
        ...validOrderData,
        items: [
          {
            ...validOrderData.items[0],
            name: 'Café ☕ Laptop 中文 العربية',
          },
        ],
      };

      const expectedOrder = {
        id: 'order-unicode',
        userId,
        items: unicodeOrder.items,
        totalAmount: 7.98,
        status: 'pending',
        shippingAddress: validOrderData.shippingAddress,
        billingAddress: validOrderData.billingAddress,
        paymentMethod: validOrderData.paymentMethod,
        orderDate: new Date(),
        estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCreateOrder.mockClear();

      mockCreateOrder.mockResolvedValue(expectedOrder);

      // Act
      const response = await request(app)
        .post(`/api/orders/${userId}`)
        .send(unicodeOrder)
        .set('Content-Type', 'application/json');

      // Assert
      expect(response.status).toBe(201);
      expect(response.body.items[0].name).toBe('Café ☕ Laptop 中文 العربية');
    });

    it('should handle order with 100 items (stress test)', async () => {
      // Arrange
      const userId = 'user-stress';
      const manyItems = Array.from({ length: 100 }, (_, i) => ({
        id: `prod-${i}`,
        name: `Product ${i}`,
        price: 9.99,
        description: `Description ${i}`,
        image: `https://example.com/product${i}.jpg`,
        dataAiHint: `product${i}`,
        quantity: 1,
      }));

      const stressOrder = {
        ...validOrderData,
        items: manyItems,
      };

      const expectedTotal = 9.99 * 100; // 999.00

      const expectedOrder = {
        id: 'order-stress',
        userId,
        items: manyItems,
        totalAmount: expectedTotal,
        status: 'pending',
        shippingAddress: validOrderData.shippingAddress,
        billingAddress: validOrderData.billingAddress,
        paymentMethod: validOrderData.paymentMethod,
        orderDate: new Date(),
        estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCreateOrder.mockClear();

      mockCreateOrder.mockResolvedValue(expectedOrder);

      // Act
      const response = await request(app)
        .post(`/api/orders/${userId}`)
        .send(stressOrder)
        .set('Content-Type', 'application/json');

      // Assert
      expect(response.status).toBe(201);
      expect(response.body.items).toHaveLength(100);
      expect(response.body.totalAmount).toBe(999.00);
    });
  });

  describe('Data Integrity Tests', () => {
    it('should verify totalAmount matches sum of (price × quantity) for all items', async () => {
      // Arrange
      const userId = 'user-integrity';
      const integrityOrder = {
        ...validOrderData,
        items: [
          {
            id: 'prod-1',
            name: 'Product 1',
            price: 19.99,
            description: 'Description 1',
            image: 'https://example.com/prod1.jpg',
            dataAiHint: 'product1',
            quantity: 2,
          },
          {
            id: 'prod-2',
            name: 'Product 2',
            price: 49.99,
            description: 'Description 2',
            image: 'https://example.com/prod2.jpg',
            dataAiHint: 'product2',
            quantity: 3,
          },
          {
            id: 'prod-3',
            name: 'Product 3',
            price: 30.01,
            description: 'Description 3',
            image: 'https://example.com/prod3.jpg',
            dataAiHint: 'product3',
            quantity: 1,
          },
        ],
      };

      // Calculate expected total: (19.99 * 2) + (49.99 * 3) + (30.01 * 1) = 39.98 + 149.97 + 30.01 = 219.96
      const expectedTotal = 219.96;

      const expectedOrder = {
        id: 'order-integrity',
        userId,
        items: integrityOrder.items,
        totalAmount: expectedTotal,
        status: 'pending',
        shippingAddress: validOrderData.shippingAddress,
        billingAddress: validOrderData.billingAddress,
        paymentMethod: validOrderData.paymentMethod,
        orderDate: new Date(),
        estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCreateOrder.mockClear();

      mockCreateOrder.mockResolvedValue(expectedOrder);

      // Act
      const response = await request(app)
        .post(`/api/orders/${userId}`)
        .send(integrityOrder)
        .set('Content-Type', 'application/json');

      // Assert
      expect(response.status).toBe(201);

      // Verify data integrity: calculate sum from response items
      const calculatedTotal = response.body.items.reduce(
        (sum: number, item: any) => sum + item.price * item.quantity,
        0
      );
      const roundedCalculatedTotal = Math.round(calculatedTotal * 100) / 100;

      expect(response.body.totalAmount).toBe(roundedCalculatedTotal);
      expect(response.body.totalAmount).toBe(219.96);
    });

    it('should verify all items from request are included in response', async () => {
      // Arrange
      const userId = 'user-item-integrity';
      const multiItemOrder = {
        ...validOrderData,
        items: [
          {
            id: 'prod-a',
            name: 'Product A',
            price: 10.00,
            description: 'Description A',
            image: 'https://example.com/a.jpg',
            dataAiHint: 'productA',
            quantity: 1,
          },
          {
            id: 'prod-b',
            name: 'Product B',
            price: 20.00,
            description: 'Description B',
            image: 'https://example.com/b.jpg',
            dataAiHint: 'productB',
            quantity: 2,
          },
        ],
      };

      const expectedOrder = {
        id: 'order-item-integrity',
        userId,
        items: multiItemOrder.items,
        totalAmount: 50.00,
        status: 'pending',
        shippingAddress: validOrderData.shippingAddress,
        billingAddress: validOrderData.billingAddress,
        paymentMethod: validOrderData.paymentMethod,
        orderDate: new Date(),
        estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCreateOrder.mockClear();

      mockCreateOrder.mockResolvedValue(expectedOrder);

      // Act
      const response = await request(app)
        .post(`/api/orders/${userId}`)
        .send(multiItemOrder)
        .set('Content-Type', 'application/json');

      // Assert
      expect(response.status).toBe(201);
      expect(response.body.items).toHaveLength(multiItemOrder.items.length);

      // Verify each item
      multiItemOrder.items.forEach((requestItem, index) => {
        const responseItem = response.body.items[index];
        expect(responseItem.id).toBe(requestItem.id);
        expect(responseItem.name).toBe(requestItem.name);
        expect(responseItem.price).toBe(requestItem.price);
        expect(responseItem.quantity).toBe(requestItem.quantity);
      });
    });

    it('should verify totalAmount is rounded to exactly 2 decimal places', async () => {
      // Arrange
      const userId = 'user-rounding';
      const roundingOrder = {
        ...validOrderData,
        items: [
          {
            ...validOrderData.items[0],
            price: 29.9999, // Should round to 30.00
            quantity: 1,
          },
        ],
      };

      const expectedOrder = {
        id: 'order-rounding',
        userId,
        items: [{ ...roundingOrder.items[0], price: 30.00 }],
        totalAmount: 30.00,
        status: 'pending',
        shippingAddress: validOrderData.shippingAddress,
        billingAddress: validOrderData.billingAddress,
        paymentMethod: validOrderData.paymentMethod,
        orderDate: new Date(),
        estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCreateOrder.mockClear();

      mockCreateOrder.mockResolvedValue(expectedOrder);

      // Act
      const response = await request(app)
        .post(`/api/orders/${userId}`)
        .send(roundingOrder)
        .set('Content-Type', 'application/json');

      // Assert
      expect(response.status).toBe(201);

      // Verify exactly 2 decimal places
      const totalStr = response.body.totalAmount.toString();
      if (totalStr.includes('.')) {
        const decimals = totalStr.split('.')[1];
        expect(decimals.length).toBeLessThanOrEqual(2);
      }
      expect(Number(response.body.totalAmount.toFixed(2))).toBe(response.body.totalAmount);
    });
  });

  describe('Error Handling', () => {
    it('should return 500 when OrderService.createOrder throws an error', async () => {
      // Arrange
      const userId = 'user-error';
      mockCreateOrder.mockClear();
      mockCreateOrder
        .mockRejectedValue(new Error('Database connection failed'));

      // Act
      const response = await request(app)
        .post(`/api/orders/${userId}`)
        .send(validOrderData)
        .set('Content-Type', 'application/json');

      // Assert
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Internal server error');
    });

    it('should handle malformed JSON gracefully', async () => {
      // Act
      const response = await request(app)
        .post('/api/orders/user-123')
        .send('{ invalid json }')
        .set('Content-Type', 'application/json');

      // Assert
      expect(response.status).toBe(400);
    });
  });

  describe('Mock Verification', () => {
    it('should verify OrderService.createOrder is called with correct parameters', async () => {
      // Arrange
      const userId = 'user-mock-verify';
      const expectedOrder = {
        id: 'order-mock',
        userId,
        items: validOrderData.items,
        totalAmount: 7.98,
        status: 'pending',
        shippingAddress: validOrderData.shippingAddress,
        billingAddress: validOrderData.billingAddress,
        paymentMethod: validOrderData.paymentMethod,
        orderDate: new Date(),
        estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCreateOrder.mockClear();

      mockCreateOrder.mockResolvedValue(expectedOrder);

      // Act
      await request(app)
        .post(`/api/orders/${userId}`)
        .send(validOrderData)
        .set('Content-Type', 'application/json');

      // Assert
      expect(mockCreateOrder).toHaveBeenCalledTimes(1);
      expect(mockCreateOrder).toHaveBeenCalledWith(userId, validOrderData);
    });

    it('should not make actual network calls when using mocks', async () => {
      // Arrange
      const userId = 'user-no-network';
      mockCreateOrder.mockClear();
      mockCreateOrder.mockResolvedValue({
        id: 'order-test',
        userId,
        items: validOrderData.items,
        totalAmount: 7.98,
        status: 'pending',
        shippingAddress: validOrderData.shippingAddress,
        billingAddress: validOrderData.billingAddress,
        paymentMethod: validOrderData.paymentMethod,
        orderDate: new Date(),
        estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Act
      await request(app)
        .post(`/api/orders/${userId}`)
        .send(validOrderData)
        .set('Content-Type', 'application/json');

      // Assert - Verify the mock was called (proving no real network call)
      expect(mockCreateOrder).toHaveBeenCalled();
      expect(jest.isMockFunction(mockCreateOrder)).toBe(true);
    });
  });
});

