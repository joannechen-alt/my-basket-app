import { Page, Locator } from '@playwright/test';

export class CartPage {
  readonly page: Page;
  readonly url: string = 'http://localhost:9002/cart';
  
  // Page heading
  readonly pageHeading: Locator;
  
  // Empty cart elements
  readonly emptyCartIcon: Locator;
  readonly emptyCartMessage: Locator;
  readonly emptyCartDescription: Locator;
  readonly startShoppingButton: Locator;
  
  // Cart with items elements
  readonly cartItems: Locator;
  readonly cartItemCards: Locator;
  readonly orderSummaryCard: Locator;
  readonly subtotalLabel: Locator;
  readonly subtotalAmount: Locator;
  readonly shippingLabel: Locator;
  readonly shippingAmount: Locator;
  readonly totalLabel: Locator;
  readonly totalAmount: Locator;
  readonly checkoutButton: Locator;
  
  // Loading and error states
  readonly loadingSpinner: Locator;
  readonly loadingMessage: Locator;
  readonly errorMessage: Locator;
  readonly retryButton: Locator;
  
  // Cart Icon in header
  readonly cartIcon: Locator;
  readonly cartBadge: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Page heading
    this.pageHeading = page.getByRole('heading', { name: /your shopping cart/i });
    
    // Empty cart elements
    this.emptyCartIcon = page.locator('svg').filter({ has: page.locator('[class*="ShoppingBag"]') });
    this.emptyCartMessage = page.getByRole('heading', { name: /your cart is empty/i });
    this.emptyCartDescription = page.getByText(/looks like you haven't added anything/i);
    this.startShoppingButton = page.getByRole('link', { name: /start shopping/i });
    
    // Cart with items elements
    this.cartItems = page.locator('div.space-y-4 > div[class*="card"]');
    this.cartItemCards = page.locator('div[class*="Card"]').filter({ has: page.locator('img') });
    this.orderSummaryCard = page.locator('div[class*="Card"]').filter({ 
      has: page.getByRole('heading', { name: /order summary/i }) 
    });
    this.subtotalLabel = page.getByText(/subtotal/i);
    this.subtotalAmount = this.subtotalLabel.locator('..').locator('span').nth(1);
    this.shippingLabel = page.getByText(/shipping/i);
    this.shippingAmount = this.shippingLabel.locator('..').locator('span').nth(1);
    this.totalLabel = page.getByText(/^total$/i);
    this.totalAmount = page.locator('span.text-primary').filter({ hasText: /\$/ }).last();
    this.checkoutButton = page.getByRole('link', { name: /proceed to checkout/i });
    
    // Loading and error states
    this.loadingSpinner = page.locator('svg[class*="animate-spin"]');
    this.loadingMessage = page.getByText(/loading your cart/i);
    this.errorMessage = page.locator('p.text-destructive');
    this.retryButton = page.getByRole('button', { name: /retry/i });
    
    // Cart Icon in header
    this.cartIcon = page.getByRole('button', { name: /shopping cart/i });
    this.cartBadge = this.cartIcon.locator('[class*="badge"]');
  }

  /**
   * Navigate to the cart page
   */
  async goto() {
    await this.page.goto(this.url);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Maps to the cart page URL
   */
  mapsTo(): string {
    return this.url;
  }

  /**
   * Check if the cart is empty
   */
  async isEmpty(): Promise<boolean> {
    return await this.emptyCartMessage.isVisible();
  }

  /**
   * Get the empty cart message text
   */
  async getEmptyMessage(): Promise<string> {
    return await this.emptyCartMessage.textContent() || '';
  }

  /**
   * Click the "Start Shopping" button from empty cart view
   */
  async startShopping() {
    await this.startShoppingButton.click();
    await this.page.waitForURL('**/');
  }

  /**
   * Get the count of items in the cart
   */
  async getCartItemCount(): Promise<number> {
    if (await this.isEmpty()) {
      return 0;
    }
    return await this.cartItemCards.count();
  }

  /**
   * Get all cart item names
   */
  async getCartItemNames(): Promise<string[]> {
    const items = await this.cartItemCards.all();
    const names: string[] = [];
    
    for (const item of items) {
      const heading = item.locator('h3');
      const name = await heading.textContent();
      if (name) names.push(name);
    }
    
    return names;
  }

  /**
   * Get a cart item card by product name
   */
  private getCartItemCard(productName: string): Locator {
    return this.page.locator('div[class*="Card"]').filter({ 
      has: this.page.getByRole('heading', { name: productName, exact: true }) 
    });
  }

  /**
   * Remove an item from the cart by product name
   */
  async removeItem(productName: string) {
    const itemCard = this.getCartItemCard(productName);
    const removeButton = itemCard.getByRole('button', { name: /remove item/i });
    
    await removeButton.click();
    
    // Wait for removal toast
    await this.page.getByText(/item removed/i).waitFor({ state: 'visible', timeout: 5000 });
  }

  /**
   * Get the quantity of a specific item
   */
  async getItemQuantity(productName: string): Promise<number> {
    const itemCard = this.getCartItemCard(productName);
    const quantityText = await itemCard.getByText(/quantity:/i).textContent();
    
    if (quantityText) {
      const match = quantityText.match(/quantity:\s*(\d+)/i);
      return match ? parseInt(match[1], 10) : 0;
    }
    
    return 0;
  }

  /**
   * Get the price of a specific item (total for quantity)
   */
  async getItemTotalPrice(productName: string): Promise<string> {
    const itemCard = this.getCartItemCard(productName);
    const priceElement = itemCard.locator('p.text-primary').filter({ hasText: /\$/ });
    return await priceElement.textContent() || '$0.00';
  }

  /**
   * Get the subtotal amount
   */
  async getSubtotal(): Promise<string> {
    const subtotal = await this.orderSummaryCard.locator('div:has-text("Subtotal")').locator('span').last().textContent();
    return subtotal || '$0.00';
  }

  /**
   * Get the shipping amount
   */
  async getShipping(): Promise<string> {
    const shipping = await this.orderSummaryCard.locator('div:has-text("Shipping")').locator('span').last().textContent();
    return shipping || 'Free';
  }

  /**
   * Get the total amount
   */
  async getTotal(): Promise<string> {
    return await this.totalAmount.textContent() || '$0.00';
  }

  /**
   * Proceed to checkout
   */
  async proceedToCheckout() {
    await this.checkoutButton.click();
    await this.page.waitForURL('**/checkout');
  }

  /**
   * Check if the cart is in loading state
   */
  async isLoading(): Promise<boolean> {
    return await this.loadingSpinner.isVisible();
  }

  /**
   * Check if there's an error
   */
  async hasError(): Promise<boolean> {
    return await this.errorMessage.isVisible();
  }

  /**
   * Get error message text
   */
  async getErrorMessage(): Promise<string> {
    return await this.errorMessage.textContent() || '';
  }

  /**
   * Click retry button when error occurs
   */
  async retry() {
    await this.retryButton.click();
  }

  /**
   * Get the cart count from the header badge
   */
  async getCartBadgeCount(): Promise<number> {
    try {
      const count = await this.cartBadge.textContent();
      return count ? parseInt(count, 10) : 0;
    } catch {
      return 0;
    }
  }

  /**
   * Open the cart from the header (navigate to cart page)
   */
  async openCart() {
    await this.cartIcon.click();
    await this.page.waitForURL('**/cart');
  }

  /**
   * Check if a specific product is in the cart
   */
  async hasProduct(productName: string): Promise<boolean> {
    if (await this.isEmpty()) {
      return false;
    }
    return await this.getCartItemCard(productName).isVisible();
  }

  /**
   * Wait for cart to finish loading
   */
  async waitForCartToLoad() {
    // Wait for loading spinner to disappear
    await this.loadingSpinner.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
    
    // Wait for either empty cart message or cart items to appear
    await Promise.race([
      this.emptyCartMessage.waitFor({ state: 'visible' }),
      this.orderSummaryCard.waitFor({ state: 'visible' })
    ]);
  }
}
