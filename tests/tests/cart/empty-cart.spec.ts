import { test, expect } from '@playwright/test';
import { CartPage } from '../../pages/CartPage';
import { HomePage } from '../../pages/HomePage';

test.describe('Empty Cart Functionality', () => {
  let cartPage: CartPage;
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    cartPage = new CartPage(page);
    homePage = new HomePage(page);
  });

  test('should display empty cart message when navigating directly to cart page', async ({ page }) => {
    // Navigate directly to cart page
    await cartPage.goto();
    
    // Wait for cart to load
    await cartPage.waitForCartToLoad();
    
    // Verify cart is empty
    expect(await cartPage.isEmpty()).toBe(true);
    
    // Verify empty cart message is visible
    await expect(cartPage.emptyCartMessage).toBeVisible();
    
    // Verify the exact text
    const emptyMessage = await cartPage.getEmptyMessage();
    expect(emptyMessage).toMatch(/your cart is empty/i);
    
    // Verify empty cart description is visible
    await expect(cartPage.emptyCartDescription).toBeVisible();
    
    // Verify "Start Shopping" button is visible
    await expect(cartPage.startShoppingButton).toBeVisible();
    
    // Verify no cart items are displayed
    expect(await cartPage.getCartItemCount()).toBe(0);
    
    // Verify cart badge shows 0 or is not visible
    const badgeCount = await cartPage.getCartBadgeCount();
    expect(badgeCount).toBe(0);
  });

  test('should display empty cart message when navigating from home via cart icon', async ({ page }) => {
    // Navigate to home page
    await homePage.goto();
    
    // Click cart icon in header
    await homePage.cartIcon.waitFor({ state: 'visible' });
    await homePage.openCart();
    
    // Verify we're on the cart page
    await expect(page).toHaveURL(/.*\/cart/);
    
    // Wait for cart to load
    await cartPage.waitForCartToLoad();
    
    // Verify empty cart message is visible
    await expect(cartPage.emptyCartMessage).toBeVisible();
    
    // Verify the message content
    const message = await cartPage.emptyCartMessage.textContent();
    expect(message).toContain('Your cart is empty');
    
    // Verify empty cart icon is visible
    await expect(cartPage.emptyCartIcon).toBeVisible();
    
    // Verify empty cart description
    await expect(cartPage.emptyCartDescription).toBeVisible();
    const description = await cartPage.emptyCartDescription.textContent();
    expect(description).toMatch(/haven't added anything/i);
  });

  test('should show Start Shopping button and navigate to home', async ({ page }) => {
    // Navigate to cart page
    await cartPage.goto();
    await cartPage.waitForCartToLoad();
    
    // Verify Start Shopping button is visible
    await expect(cartPage.startShoppingButton).toBeVisible();
    
    // Click Start Shopping button
    await cartPage.startShopping();
    
    // Verify navigation to home page
    await expect(page).toHaveURL('http://localhost:9002/');
  });

  test('should not display order summary when cart is empty', async ({ page }) => {
    // Navigate to cart page
    await cartPage.goto();
    await cartPage.waitForCartToLoad();
    
    // Verify cart is empty
    expect(await cartPage.isEmpty()).toBe(true);
    
    // Verify order summary is not visible
    await expect(cartPage.orderSummaryCard).not.toBeVisible();
    
    // Verify checkout button is not visible
    await expect(cartPage.checkoutButton).not.toBeVisible();
  });

  test('should verify page heading is displayed', async ({ page }) => {
    // Navigate to cart page
    await cartPage.goto();
    
    // Verify page heading
    await expect(cartPage.pageHeading).toBeVisible();
    
    const heading = await cartPage.pageHeading.textContent();
    expect(heading).toMatch(/your shopping cart/i);
  });

  test('should verify empty cart state has correct styling', async ({ page }) => {
    // Navigate to cart page
    await cartPage.goto();
    await cartPage.waitForCartToLoad();
    
    // Verify empty cart elements are visible
    await expect(cartPage.emptyCartIcon).toBeVisible();
    await expect(cartPage.emptyCartMessage).toBeVisible();
    await expect(cartPage.emptyCartDescription).toBeVisible();
    await expect(cartPage.startShoppingButton).toBeVisible();
    
    // Take screenshot for visual verification
    await page.screenshot({ 
      path: 'test-results/empty-cart-state.png', 
      fullPage: true 
    });
  });

  test('should verify cart item count is zero when empty', async ({ page }) => {
    // Navigate to cart page
    await cartPage.goto();
    await cartPage.waitForCartToLoad();
    
    // Verify cart item count is 0
    const itemCount = await cartPage.getCartItemCount();
    expect(itemCount).toBe(0);
    
    // Verify isEmpty returns true
    const isEmpty = await cartPage.isEmpty();
    expect(isEmpty).toBe(true);
  });

  test('should not show loading state indefinitely', async ({ page }) => {
    // Navigate to cart page
    await cartPage.goto();
    
    // Wait for loading to complete
    await cartPage.waitForCartToLoad();
    
    // Verify loading spinner is not visible
    await expect(cartPage.loadingSpinner).not.toBeVisible();
    
    // Verify loading message is not visible
    await expect(cartPage.loadingMessage).not.toBeVisible();
  });

  test('should verify cart badge in header shows zero or empty', async ({ page }) => {
    // Navigate to home page first
    await homePage.goto();
    
    // Get cart badge count from home page
    const homeCartCount = await homePage.getCartCount();
    expect(homeCartCount).toBe(0);
    
    // Navigate to cart page
    await cartPage.goto();
    await cartPage.waitForCartToLoad();
    
    // Verify cart is empty
    expect(await cartPage.isEmpty()).toBe(true);
    
    // Verify cart badge count
    const cartBadgeCount = await cartPage.getCartBadgeCount();
    expect(cartBadgeCount).toBe(0);
  });

  test.afterEach(async ({ page }, testInfo) => {
    // Take screenshot on failure
    if (testInfo.status !== testInfo.expectedStatus) {
      await page.screenshot({ 
        path: `test-results/empty-cart-failure-${testInfo.title.replace(/\s+/g, '-')}.png`, 
        fullPage: true 
      });
    }
  });
});

test.describe('Empty Cart - Edge Cases', () => {
  let cartPage: CartPage;

  test.beforeEach(async ({ page }) => {
    cartPage = new CartPage(page);
  });

  test('should handle direct URL navigation to cart when empty', async ({ page }) => {
    // Navigate directly via URL
    await page.goto('http://localhost:9002/cart');
    
    // Wait for cart to load
    await cartPage.waitForCartToLoad();
    
    // Verify empty state
    await expect(cartPage.emptyCartMessage).toBeVisible();
    expect(await cartPage.isEmpty()).toBe(true);
  });

  test('should verify empty cart after page refresh', async ({ page }) => {
    // Navigate to cart
    await cartPage.goto();
    await cartPage.waitForCartToLoad();
    
    // Verify empty state
    expect(await cartPage.isEmpty()).toBe(true);
    
    // Refresh page
    await page.reload();
    await cartPage.waitForCartToLoad();
    
    // Verify still empty
    await expect(cartPage.emptyCartMessage).toBeVisible();
    expect(await cartPage.isEmpty()).toBe(true);
  });

  test('should not display error state when cart is empty', async ({ page }) => {
    // Navigate to cart page
    await cartPage.goto();
    await cartPage.waitForCartToLoad();
    
    // Verify no error message
    expect(await cartPage.hasError()).toBe(false);
    
    // Verify error message is not visible
    await expect(cartPage.errorMessage).not.toBeVisible();
    
    // Verify retry button is not visible
    await expect(cartPage.retryButton).not.toBeVisible();
  });

  test('should verify all empty cart UI elements are present', async ({ page }) => {
    // Navigate to cart page
    await cartPage.goto();
    await cartPage.waitForCartToLoad();
    
    // Check all required empty cart elements
    const elements = [
      { locator: cartPage.emptyCartIcon, name: 'Empty cart icon' },
      { locator: cartPage.emptyCartMessage, name: 'Empty cart message' },
      { locator: cartPage.emptyCartDescription, name: 'Empty cart description' },
      { locator: cartPage.startShoppingButton, name: 'Start shopping button' }
    ];
    
    for (const element of elements) {
      await expect(element.locator).toBeVisible({ timeout: 5000 });
    }
    
    // Take screenshot showing all elements
    await page.screenshot({ 
      path: 'test-results/empty-cart-all-elements.png', 
      fullPage: true 
    });
  });

  test.afterEach(async ({ page }, testInfo) => {
    // Take screenshot on failure
    if (testInfo.status !== testInfo.expectedStatus) {
      await page.screenshot({ 
        path: `test-results/empty-cart-edge-case-failure-${testInfo.title.replace(/\s+/g, '-')}.png`, 
        fullPage: true 
      });
    }
  });
});
