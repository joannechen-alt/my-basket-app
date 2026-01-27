# Test Fixtures - Best Practices

## 📁 Structure

```
src/
├── __fixtures__/
│   ├── index.ts            # Central export for all fixtures
│   ├── products.fixture.ts # Product test data and factories
│   └── mocks.fixture.ts    # Mock service implementations
├── service.ts
└── service.test.ts         # Uses fixtures from __fixtures__/
```

## ✅ Benefits

### 1. **Single Source of Truth**
- All test data defined in one place
- Easy to update when data structure changes
- Consistent across all test files

### 2. **Reusability**
- Import fixtures in any test file
- No duplication of test data
- Reduced test file size and clutter

### 3. **Maintainability**
- Changes to Product interface only require updating fixtures once
- Clear separation between test logic and test data
- Easy to add new test scenarios

### 4. **Flexibility**
- Factory functions for dynamic test data generation
- Pre-configured fixtures for common scenarios
- Easy customization with `createMockProduct()` overrides

## 📖 Usage Examples

### Basic Usage
```typescript
import { mockProducts } from './__fixtures__';

// Use pre-configured fixtures
const { product1, product2, product3 } = mockProducts;

mockProductClient.getProduct.mockResolvedValue(product1);
await cartService.addToCart(userId, product1.id, 1);
```

### Creating Custom Products
```typescript
import { createMockProduct, createProductWithPrice } from './__fixtures__';

// Create a product with specific overrides
const customProduct = createMockProduct({
  id: 'custom-123',
  name: 'Custom Product',
  price: 19.99,
});

// Create a product with just a specific price
const cheapProduct = createProductWithPrice(0.99);
```

### Using in Multiple Test Files
```typescript
// routes.test.ts
import { mockProducts } from './__fixtures__';

describe('Cart Routes', () => {
  const { product1 } = mockProducts;
  
  it('should return cart data', async () => {
    // Same fixtures, different test file!
  });
});
```

### Mocking Services
```typescript
import { createMockProductClient, setupMockProductClient } from './__fixtures__';
import { mockProducts } from './__fixtures__';

// Quick setup for common scenarios
const mockClient = createMockProductClient();
setupMockProductClient(mockClient, [mockProducts.product1, mockProducts.product2]);

// Now mockClient.getProduct() will automatically return the right products
```

## 🎯 Best Practices

### ✅ DO:
- Store all shared test data in `__fixtures__/`
- Use factory functions for flexible data generation
- Create pre-configured fixtures for common test scenarios
- Export everything through `index.ts` for clean imports
- Document what each fixture represents

### ❌ DON'T:
- Duplicate test data across multiple test files
- Hard-code product data directly in tests
- Mix test data with test logic
- Forget to update fixtures when types change

## 🔄 Migration Guide

### Before (Inline Data)
```typescript
// ❌ Data mixed with test logic
const mockProduct1: Product = {
  id: 'product-1',
  name: 'Test Product',
  price: 10.99,
  description: 'A test product',
  image: 'https://example.com/image.jpg',
  dataAiHint: 'test hint',
};

it('should add product', async () => {
  mockClient.getProduct.mockResolvedValue(mockProduct1);
  // test logic...
});
```

### After (Using Fixtures)
```typescript
// ✅ Clean separation of concerns
import { mockProducts } from './__fixtures__';

it('should add product', async () => {
  mockClient.getProduct.mockResolvedValue(mockProducts.product1);
  // test logic...
});
```

## 📊 Comparison

| Aspect | Before | After |
|--------|--------|-------|
| Lines of test data in test files | ~50 lines | 3 lines (import) |
| Reusability | Copy-paste required | Import and use |
| Maintainability | Update in multiple places | Update once |
| Readability | Mixed with logic | Clear separation |
| Test file focus | Data + Logic | Logic only |

## 🚀 Extending Fixtures

To add new test data:

1. Add to `products.fixture.ts`:
```typescript
export const mockProducts = {
  // existing products...
  newProduct: createMockProduct({
    id: 'new-product',
    name: 'New Test Product',
    price: 29.99,
  }),
};
```

2. Use in any test file:
```typescript
const { newProduct } = mockProducts;
```

That's it! All test files automatically have access.
