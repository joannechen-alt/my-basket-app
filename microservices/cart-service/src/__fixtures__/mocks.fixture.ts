import { ProductServiceClient } from '../product-client';
import { Product } from '../types';

/**
 * Creates a fully mocked ProductServiceClient for testing
 * All methods are mocked and ready to be configured in tests
 */
export const createMockProductClient = (): jest.Mocked<ProductServiceClient> => {
  return {
    getProduct: jest.fn(),
    getProducts: jest.fn(),
  } as jest.Mocked<ProductServiceClient>;
};

/**
 * Helper to setup a mock product client with predefined responses
 * Useful for quickly configuring common test scenarios
 */
export const setupMockProductClient = (
  mockClient: jest.Mocked<ProductServiceClient>,
  products: Product[]
): void => {
  // Setup getProduct to return the correct product by ID
  mockClient.getProduct.mockImplementation(async (productId: string) => {
    return products.find((p) => p.id === productId) || null;
  });

  // Setup getProducts to return all matching products
  mockClient.getProducts.mockImplementation(async (productIds: string[]) => {
    return products.filter((p) => productIds.includes(p.id));
  });
};
