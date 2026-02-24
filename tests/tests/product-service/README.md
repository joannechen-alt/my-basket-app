# Product Service API Tests

Comprehensive Playwright API test suite for the Product Service, auto-generated from the test plan.

## 📁 Test Files

### 1. **1-get-apiproducts.spec.ts** - GET /api/products
- Tests product listing with various filters
- Query parameter validation (category, price range, stock status, search)
- Pagination testing
- Combined filter scenarios
- **8 test scenarios**

### 2. **2-post-apiproducts.spec.ts** - POST /api/products
- Product creation with valid data
- Input validation (missing fields, invalid types, negative prices)
- Payload size testing (large, empty payloads)
- Special character handling
- URL format validation
- **9 test scenarios**

### 3. **3-get-apiproductsid.spec.ts** - GET /api/products/{id}
- Fetching products by ID
- 404 handling for non-existent products
- Invalid ID format handling
- Data consistency verification
- Field type validation
- **9 test scenarios**

### 4. **4-get-apihealth.spec.ts** - GET /api/health
- Health check endpoint verification
- Response time testing
- Concurrent request handling
- Authentication-free access verification
- **5 test scenarios**

### 5. **5-security-testing.spec.ts** - Security Tests
- SQL injection protection
- XSS (Cross-Site Scripting) prevention
- CSRF protection mechanisms
- Input validation and sanitization
- Rate limiting and DoS protection
- **13 test scenarios**

## 📊 Test Coverage Summary

- **Total Test Files:** 5
- **Total Test Scenarios:** 44
- **Base URL:** `http://localhost:3001/api`
- **Test Framework:** Playwright with TypeScript

## 🚀 Running the Tests

### Prerequisites
1. Start the Product Service:
   ```bash
   cd microservices/product-service
   npm start
   ```
   Service should be running on `http://localhost:3001`

### Run All Product Service Tests
```bash
cd tests
npx playwright test tests/product-service/
```

### Run Individual Test Files
```bash
# GET /api/products tests
npx playwright test tests/product-service/1-get-apiproducts.spec.ts

# POST /api/products tests
npx playwright test tests/product-service/2-post-apiproducts.spec.ts

# GET /api/products/{id} tests
npx playwright test tests/product-service/3-get-apiproductsid.spec.ts

# Health check tests
npx playwright test tests/product-service/4-get-apihealth.spec.ts

# Security tests
npx playwright test tests/product-service/5-security-testing.spec.ts
```

### Run with Options
```bash
# Run in headed mode (see browser)
npx playwright test tests/product-service/ --headed

# Run with detailed output
npx playwright test tests/product-service/ --reporter=list

# Run only failed tests
npx playwright test tests/product-service/ --last-failed

# Run with HTML report
npx playwright test tests/product-service/ --reporter=html
```

## 📋 Test Categories

### Functional Tests
- ✅ CRUD operations (Create, Read)
- ✅ Query parameters and filtering
- ✅ Pagination
- ✅ Error handling (404, 400)
- ✅ Data validation

### Security Tests
- 🔒 SQL Injection protection
- 🔒 XSS prevention
- 🔒 CSRF protection
- 🔒 Input sanitization
- 🔒 Rate limiting

### Performance Tests
- ⚡ Response time verification
- ⚡ Concurrent request handling
- ⚡ Large payload handling

## 🎯 Expected Results

All tests should pass when the Product Service is running correctly with:
- Sample products (products 1-8) available
- Proper validation middleware active
- Security measures implemented

## 🔍 Test Data

The tests use:
- **Known Product IDs:** 1, 2, 3, 4, 5, 6, 7, 8
- **Valid Categories:** fruits, vegetables, dairy, meat, bakery, grains
- **Sample Products:** As defined in `microservices/product-service/src/data.ts`

## 📝 Notes

- Tests are designed to be independent and can run in parallel
- Each test cleans up after itself when necessary
- Security tests verify protection mechanisms are in place
- Some tests intentionally send invalid data to verify error handling

## 🐛 Troubleshooting

**Tests failing with connection errors:**
- Ensure Product Service is running on port 3001
- Check `http://localhost:3001/api/health` is accessible

**404 errors on product endpoints:**
- Verify sample data is loaded in the Product Service
- Check product IDs 1-8 exist in the database/data store

**Validation tests failing:**
- Review validation schemas in `microservices/product-service/src/routes.ts`
- Ensure Zod validation is configured correctly

## 📚 Related Documentation

- [Product Service Test Plan](../product-service-comprehensive-test-plan.md)
- [API Documentation](http://localhost:3001/api-docs)
- [Playwright Documentation](https://playwright.dev/docs/api-testing)
