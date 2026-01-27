import { Product } from '../types';

/**
 * Factory function to create mock products with customizable properties
 * Follows the Test Data Builder pattern for flexible test data generation
 */
export const createMockProduct = (overrides?: Partial<Product>): Product => {
  const defaults: Product = {
    id: 'product-default',
    name: 'Default Test Product',
    price: 10.00,
    description: 'A default test product',
    image: 'https://example.com/default.jpg',
    dataAiHint: 'default product hint',
  };

  return { ...defaults, ...overrides };
};

/**
 * Pre-configured mock products for common test scenarios
 * Centralized test fixtures that can be reused across all test files
 */
export const mockProducts = {
  // Standard product with decimal price (tests floating-point precision)
  product1: createMockProduct({
    id: 'product-1',
    name: 'Test Product 1',
    price: 10.99,
    description: 'A test product',
    image: 'https://example.com/image1.jpg',
    dataAiHint: 'test product hint',
  }),

  // Higher-priced product
  product2: createMockProduct({
    id: 'product-2',
    name: 'Test Product 2',
    price: 25.50,
    description: 'Another test product',
    image: 'https://example.com/image2.jpg',
    dataAiHint: 'another test product hint',
  }),

  // Lower-priced product with round number
  product3: createMockProduct({
    id: 'product-3',
    name: 'Test Product 3',
    price: 5.00,
    description: 'Third test product',
    image: 'https://example.com/image3.jpg',
    dataAiHint: 'third product hint',
  }),

  // Edge case: very low price for floating-point precision testing
  lowPriceProduct: createMockProduct({
    id: 'low-price-product',
    name: 'Low Price Product',
    price: 0.07,
    description: 'Testing floating point precision',
    image: 'https://example.com/low-price.jpg',
    dataAiHint: 'low price test',
  }),

  // Edge case: decimal price for precision testing
  precisionProduct: createMockProduct({
    id: 'precision-product',
    name: 'Precision Test',
    price: 0.1,
    description: 'Testing precision',
    image: 'https://example.com/precision.jpg',
    dataAiHint: 'precision test',
  }),

  // Product with complex decimal for multi-product calculations
  complexDecimalProduct: createMockProduct({
    id: 'complex-decimal',
    name: 'Complex Decimal Product',
    price: 15.97,
    description: 'Product with complex decimal',
    image: 'https://example.com/complex.jpg',
    dataAiHint: 'complex decimal test',
  }),

  // Product for edge case testing
  edgeCaseProduct: createMockProduct({
    id: 'edge-case-product',
    name: 'Edge Case Product',
    price: 7.03,
    description: 'Product for edge case testing',
    image: 'https://example.com/edge.jpg',
    dataAiHint: 'edge case test',
  }),
};

/**
 * Helper function to create an array of mock products
 * Useful for batch operations and list testing
 */
export const createMockProductList = (count: number): Product[] => {
  return Array.from({ length: count }, (_, index) =>
    createMockProduct({
      id: `product-${index + 1}`,
      name: `Test Product ${index + 1}`,
      price: (index + 1) * 10.99,
    })
  );
};

/**
 * Creates a product with a specific price
 * Useful for precise calculation testing
 */
export const createProductWithPrice = (price: number, id?: string): Product => {
  return createMockProduct({
    id: id || `product-${price}`,
    name: `Product at $${price}`,
    price,
  });
};
