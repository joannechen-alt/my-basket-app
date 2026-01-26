import { test, expect } from '@playwright/test';
import { HomePage } from '../../pages/HomePage';
import { CartPage } from '../../pages/CartPage';

// Test configuration constants
const TEST_TIMEOUT = {
  DEFAULT: 5000,
  PAGE_LOAD: 10000,
  TOAST: 10000,
} as const;

const CART_SERVICE_URL = 'http://localhost:3002';
const TEST_USER_ID = 'test-user-checkout-' + Date.now();

test.describe('Checkout Process - End to End', () => {
  let homePage: HomePage;
  let cartPage: CartPage;

  test.beforeEach(async ({ page, request }) => {
    // Initialize page objects
    homePage = new HomePage(page);
    cartPage = new CartPage(page);

    // Clear the cart before each test to ensure clean state
    try {
      await request.delete(`${CART_SERVICE_URL}/api/cart/${TEST_USER_ID}`);
    } catch (error) {
      console.log('Cart cleanup failed (may be expected if cart empty):', error);
    }
  });

  test('should complete checkout process and display order success message', async ({ page }) => {
    // Step 1: Navigate to Home page
    await homePage.goto();
    await homePage.waitForProductsToLoad();
    
    await page.screenshot({ 
      path: 'test-results/checkout-01-home-page.png', 
      fullPage: true 
    });

    // Step 2: Add a product to cart
    const productName = await homePage.addFirstProductToBasket();
    
    // Wait for success toast
    const addedToast = page.getByText(/added to cart/i);
    await expect(addedToast).toBeVisible({ timeout: TEST_TIMEOUT.TOAST });
    
    await page.screenshot({ 
      path: 'test-results/checkout-02-product-added.png', 
      fullPage: true 
    });
    
    console.log(`Added product: ${productName}`);

    // Verify cart badge shows item count
    const cartCount = await homePage.getCartCount();
    expect(cartCount, 'Cart should contain at least 1 item').toBeGreaterThan(0);

    // Step 3: Click basket icon to navigate to cart
    await homePage.openCart();
    await expect(page).toHaveURL(/.*\/cart/, { timeout: TEST_TIMEOUT.DEFAULT });
    
    await cartPage.waitForCartToLoad();
    
    await page.screenshot({ 
      path: 'test-results/checkout-03-cart-page.png', 
      fullPage: true 
    });

    // Verify cart is not empty
    expect(await cartPage.isEmpty()).toBe(false);
    expect(await cartPage.getCartItemCount()).toBeGreaterThan(0);

    // Verify the product is in the cart
    const cartItems = await cartPage.getCartItemNames();
    expect(cartItems).toContain(productName);

    // Step 4: Click "Proceed to Checkout" button
    await cartPage.proceedToCheckout();
    await expect(page).toHaveURL(/.*\/checkout/, { timeout: TEST_TIMEOUT.DEFAULT });
    
    await page.screenshot({ 
      path: 'test-results/checkout-04-checkout-page.png', 
      fullPage: true 
    });

    // Verify checkout page heading
    const checkoutHeading = page.getByRole('heading', { name: /checkout/i }).first();
    await expect(checkoutHeading).toBeVisible({ timeout: TEST_TIMEOUT.DEFAULT });

    // Verify order review section is visible
    const orderReviewHeading = page.getByRole('heading', { name: /review your order/i });
    await expect(orderReviewHeading).toBeVisible({ timeout: TEST_TIMEOUT.DEFAULT });

    // Step 5: Click "Place Order" button
    const placeOrderButton = page.getByRole('button', { name: /place order/i });
    await expect(placeOrderButton).toBeVisible({ timeout: TEST_TIMEOUT.DEFAULT });
    await expect(placeOrderButton).toBeEnabled();
    
    await placeOrderButton.click();
    
    // Wait for order processing (button shows loading state)
    await expect(placeOrderButton).toBeDisabled({ timeout: TEST_TIMEOUT.DEFAULT });

    // Step 6: Verify "Order Placed Successfully" message
    const successMessage = page.getByRole('heading', { name: /order placed successfully/i });
    await expect(successMessage).toBeVisible({ timeout: TEST_TIMEOUT.PAGE_LOAD });
    
    await page.screenshot({ 
      path: 'test-results/checkout-05-order-success.png', 
      fullPage: true 
    });

    // Additional verifications on success page
    const successIcon = page.locator('svg').filter({ hasText: '' }).first(); // CheckCircle icon
    await expect(successIcon).toBeVisible();

    const thankYouMessage = page.getByText(/thank you for your purchase/i);
    await expect(thankYouMessage).toBeVisible();

    // Verify "View My Orders" button is present
    const viewOrdersButton = page.getByRole('link', { name: /view my orders/i });
    await expect(viewOrdersButton).toBeVisible();
  });

  test('should verify cart is cleared after successful checkout', async ({ page }) => {
    // Step 1: Add product and navigate to checkout
    await homePage.goto();
    await homePage.waitForProductsToLoad();
    
    await homePage.addFirstProductToBasket();
    await page.getByText(/added to cart/i).waitFor({ state: 'visible', timeout: TEST_TIMEOUT.TOAST });
    
    await homePage.openCart();
    await cartPage.waitForCartToLoad();
    
    // Verify cart has items
    expect(await cartPage.isEmpty()).toBe(false);
    
    // Step 2: Complete checkout
    await cartPage.proceedToCheckout();
    await page.waitForURL(/.*\/checkout/);
    
    const placeOrderButton = page.getByRole('button', { name: /place order/i });
    await placeOrderButton.click();
    
    // Wait for success message
    const successMessage = page.getByRole('heading', { name: /order placed successfully/i });
    await expect(successMessage).toBeVisible({ timeout: TEST_TIMEOUT.PAGE_LOAD });
    
    // Step 3: Navigate back to cart and verify it's empty
    await page.goto('http://localhost:9002/cart');
    await cartPage.waitForCartToLoad();
    
    expect(await cartPage.isEmpty()).toBe(true);
    await expect(cartPage.emptyCartMessage).toBeVisible();
    
    // Verify cart badge shows 0
    expect(await cartPage.getCartBadgeCount()).toBe(0);
    
    await page.screenshot({ 
      path: 'test-results/checkout-cart-cleared.png', 
      fullPage: true 
    });
  });

  test('should handle empty cart checkout attempt', async ({ page }) => {
    // Navigate directly to checkout with empty cart
    await page.goto('http://localhost:9002/checkout');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ 
      path: 'test-results/checkout-empty-cart.png', 
      fullPage: true 
    });
    
    // Verify empty cart message or redirection
    const emptyMessage = page.getByText(/your cart is empty/i);
    const continueShoppingButton = page.getByRole('link', { name: /continue shopping/i });
    
    await expect(emptyMessage).toBeVisible({ timeout: TEST_TIMEOUT.DEFAULT });
    await expect(continueShoppingButton).toBeVisible();
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
        path: `test-results/checkout-failure-${testInfo.title.replace(/\s+/g, '-')}.png`, 
        fullPage: true 
    });
    }
  });
});