import { test, expect } from '@playwright/test';
import { CartPage } from '../../pages/CartPage';
import { HomePage } from '../../pages/HomePage';

// Test configuration constants
const TEST_TIMEOUT = {
  DEFAULT: 5000,
  PAGE_LOAD: 10000,
} as const;

test.describe('Empty Cart Functionality', () => {
  let cartPage: CartPage;
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    cartPage = new CartPage(page);
    homePage = new HomePage(page);
  });

  test('should display empty cart message when navigating directly to cart page', async () => {
    // Navigate directly to cart page using POM method
    await cartPage.goto();
    await cartPage.waitForCartToLoad();
    
    // Verify cart is empty using POM methods
    expect(await cartPage.isEmpty()).toBe(true);
    await expect(cartPage.emptyCartMessage).toBeVisible();
    await expect(cartPage.emptyCartDescription).toBeVisible();
    await expect(cartPage.startShoppingButton).toBeVisible();
    
    // Verify cart state
    expect(await cartPage.getCartItemCount()).toBe(0);
    expect(await cartPage.getCartBadgeCount()).toBe(0);
  });

  test('should display empty cart message when navigating from home via cart icon', async ({ page }) => {
    // Navigate using POM methods
    await homePage.goto();
    await homePage.openCart();
    
    // Verify URL using POM method
    expect(page.url()).toContain(cartPage.mapsTo());
    
    // Verify empty state using CartPage methods
    await cartPage.waitForCartToLoad();
    expect(await cartPage.isEmpty()).toBe(true);
    
    // Verify message content using POM method
    const message = await cartPage.getEmptyMessage();
    expect(message).toMatch(/your cart is empty/i);
  });

  test('should show Start Shopping button and navigate to home', async ({ page }) => {
    await cartPage.goto();
    await cartPage.waitForCartToLoad();
    
    // Use POM method for navigation
    await cartPage.startShopping();
    
    // Verify navigation using POM URL
    expect(page.url()).toBe(homePage.mapsTo());
  });

  test('should not display order summary when cart is empty', async () => {
    await cartPage.goto();
    await cartPage.waitForCartToLoad();
    
    // Use POM method
    expect(await cartPage.isEmpty()).toBe(true);
    
    // Verify UI elements not visible
    await expect(cartPage.orderSummaryCard).not.toBeVisible();
    await expect(cartPage.checkoutButton).not.toBeVisible();
  });

  test('should verify page heading is displayed', async () => {
    await cartPage.goto();
    
    // Verify heading using POM locator
    await expect(cartPage.pageHeading).toBeVisible();
    await expect(cartPage.pageHeading).toContainText(/your shopping cart/i);
  });

  test('should verify empty cart state has correct styling', async ({ page }) => {
    await cartPage.goto();
    await cartPage.waitForCartToLoad();
    
    // Verify all elements using POM locators
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

  test('should verify cart item count is zero when empty', async () => {
    await cartPage.goto();
    await cartPage.waitForCartToLoad();
    
    // Use POM methods for assertions
    expect(await cartPage.getCartItemCount()).toBe(0);
    expect(await cartPage.isEmpty()).toBe(true);
  });

  test('should not show loading state indefinitely', async () => {
    await cartPage.goto();
    await cartPage.waitForCartToLoad();
    
    // Verify loading state using POM locators
    await expect(cartPage.loadingSpinner).not.toBeVisible();
    await expect(cartPage.loadingMessage).not.toBeVisible();
  });

  test('should verify cart badge shows zero when empty', async () => {
    // Verify from home page
    await homePage.goto();
    expect(await homePage.getCartCount()).toBe(0);
    
    // Verify from cart page
    await cartPage.goto();
    await cartPage.waitForCartToLoad();
    
    expect(await cartPage.isEmpty()).toBe(true);
    expect(await cartPage.getCartBadgeCount()).toBe(0);
  });

  test.afterEach(async ({ page }, testInfo) => {
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
    // Use page.goto with POM URL
    await page.goto(cartPage.mapsTo());
    await cartPage.waitForCartToLoad();
    
    expect(await cartPage.isEmpty()).toBe(true);
    await expect(cartPage.emptyCartMessage).toBeVisible();
  });

  test('should verify empty cart after page refresh', async ({ page }) => {
    await cartPage.goto();
    await cartPage.waitForCartToLoad();
    
    expect(await cartPage.isEmpty()).toBe(true);
    
    // Refresh and verify
    await page.reload();
    await cartPage.waitForCartToLoad();
    
    expect(await cartPage.isEmpty()).toBe(true);
    await expect(cartPage.emptyCartMessage).toBeVisible();
  });

  test('should not display error state when cart is empty', async () => {
    await cartPage.goto();
    await cartPage.waitForCartToLoad();
    
    // Use POM method for error checking
    expect(await cartPage.hasError()).toBe(false);
    
    await expect(cartPage.errorMessage).not.toBeVisible();
    await expect(cartPage.retryButton).not.toBeVisible();
  });

  test('should verify all empty cart UI elements are present', async ({ page }) => {
    await cartPage.goto();
    await cartPage.waitForCartToLoad();
    
    // Verify all elements using POM locators
    await expect(cartPage.emptyCartIcon).toBeVisible();
    await expect(cartPage.emptyCartMessage).toBeVisible();
    await expect(cartPage.emptyCartDescription).toBeVisible();
    await expect(cartPage.startShoppingButton).toBeVisible();
    
    await page.screenshot({ 
      path: 'test-results/empty-cart-all-elements.png', 
      fullPage: true 
    });
  });

  test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.status !== testInfo.expectedStatus) {
      await page.screenshot({ 
        path: `test-results/empty-cart-edge-case-failure-${testInfo.title.replace(/\s+/g, '-')}.png`, 
        fullPage: true 
      });
    }
  });
});
