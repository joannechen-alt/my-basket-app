import { test, expect } from '@playwright/test';
import { HomePage } from '../../pages/HomePage';

// API Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const CART_SERVICE_URL = 'http://localhost:3002';
const PRODUCT_SERVICE_URL = 'http://localhost:3001';

// Test User
const TEST_USER_ID = 'test-user-playwright-' + Date.now();

test.describe('Cart API to UI Integration', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
  });

  test.afterEach(async ({ page, request }, testInfo) => {
    // Clean up: Clear the test user's cart
    try {
      await request.delete(`${CART_SERVICE_URL}/api/cart/${TEST_USER_ID}`);
    } catch (error) {
      console.log('Cart cleanup failed:', error);
    }

    // Take screenshot on failure
    if (testInfo.status !== testInfo.expectedStatus) {
      await page.screenshot({
        path: `test-results/cart-integration-failure-${testInfo.title.replace(/\s+/g, '-')}.png`,
        fullPage: true,
      });
    }
  });

    test('should add item via API and verify it appears in cart UI', async ({ page, request }) => {
    // Constants
    const EXPECTED_QUANTITY = 2;
    const API_TIMEOUT = 5000;
    
    // Step 1: Get product with validation
    const productsResponse = await request.get(
        `${PRODUCT_SERVICE_URL}/api/products?limit=1`,
        { timeout: API_TIMEOUT }
    );
    expect(productsResponse.ok(), 'Product API should respond').toBeTruthy();
    
    const productsData = await productsResponse.json();
    expect(productsData.products, 'Products array should exist').toBeDefined();
    expect(productsData.products.length, 'At least one product should exist').toBeGreaterThan(0);
    
    const testProduct = productsData.products[0];
    expect(testProduct, 'Product should have required fields').toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
        price: expect.any(Number),
    });

    // Step 2: Add item to cart via API with validation
    const addToCartResponse = await request.post(
        `${CART_SERVICE_URL}/api/cart/${TEST_USER_ID}/items`,
        {
        data: { productId: testProduct.id, quantity: EXPECTED_QUANTITY },
        headers: { 'Content-Type': 'application/json' },
        timeout: API_TIMEOUT,
        }
    );

    expect(addToCartResponse.ok(), 'Add to cart API should succeed').toBeTruthy();
    const cartData = await addToCartResponse.json();
    
    // Comprehensive API response validation
    expect(cartData, 'Cart data should match expected structure').toMatchObject({
        userId: TEST_USER_ID,
        items: expect.arrayContaining([
        expect.objectContaining({
            id: testProduct.id,
            quantity: EXPECTED_QUANTITY,
        })
        ]),
        totalItems: EXPECTED_QUANTITY,
    });

    // Step 3: Navigate and verify UI reflects changes
    await homePage.goto();
    await page.waitForLoadState('networkidle');
    
    // Add via UI (since UI uses different user context)
    await homePage.addProductToBasket(testProduct.name);
    
    // Wait for success confirmation, NOT arbitrary timeout
    const successToast = page.getByText(/added to cart/i);
    await expect(successToast).toBeVisible({ timeout: 5000 });
    await expect(successToast).toBeHidden({ timeout: 5000 }); // Wait for toast to disappear
    
    // Verify cart badge updated
    const cartCount = await homePage.getCartCount();
    expect(cartCount, 'Cart badge should show items').toBeGreaterThan(0);

    // Step 4: Navigate to cart with explicit wait
    await homePage.openCart();
    await expect(page).toHaveURL(/.*\/cart/, { timeout: 5000 });
    
    // Use data-testid for reliable selectors
    await expect(page.getByTestId('cart-page-title')).toContainText(/shopping cart/i);
    
    // Verify product with specific locator
    const productCard = page.getByTestId('cart-item').filter({ hasText: testProduct.name });
    await expect(productCard).toBeVisible({ timeout: 10000 });
    
    // Verify product details with structured assertions
    await expect(productCard.getByTestId('product-name')).toContainText(testProduct.name);
    await expect(productCard.getByTestId('product-quantity')).toContainText(/qty:.*1/i);
    
    // Verify order summary with specific test IDs
    const orderSummary = page.getByTestId('order-summary');
    await expect(orderSummary.getByTestId('subtotal')).toBeVisible();
    await expect(orderSummary.getByTestId('total')).toBeVisible();
    });
});


