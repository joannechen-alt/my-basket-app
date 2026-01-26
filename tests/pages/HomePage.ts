import { Page, Locator } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly url: string = 'http://localhost:9002/';
  
  // Header elements (from Header.tsx)
  readonly cartIcon: Locator;
  readonly cartBadge: Locator;
  readonly homeLink: Locator;
  readonly ordersLink: Locator;
  readonly logoLink: Locator;
  
  // Product grid elements (from ProductList.tsx and ProductCard.tsx)
  readonly productGrid: Locator;
  readonly productCards: Locator;
  
  // Toast notifications (from toaster.tsx)
  readonly toastNotification: Locator;
  readonly toastTitle: Locator;
  readonly toastDescription: Locator;
  
  // Fallback banner
  readonly fallbackBanner: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Header locators based on Header.tsx structure
    this.cartIcon = page.getByRole('button').filter({ has: page.locator('svg.lucide-shopping-cart') });
    this.cartBadge = page.locator('span').filter({ hasText: /^\d+$/ }).last();
    this.homeLink = page.getByRole('button', { name: /products/i });
    this.ordersLink = page.getByRole('button', { name: /my orders/i });
    this.logoLink = page.getByRole('link', { name: /mybasket lite/i });
    
    // Product grid locators based on ProductList.tsx
    this.productGrid = page.locator('div.grid');
    this.productCards = this.productGrid.locator('> div');
    
    // Toast notification locators based on toaster.tsx and toast.tsx
    this.toastNotification = page.locator('[data-state="open"]').filter({ has: page.locator('[role="status"]') });
    this.toastTitle = this.toastNotification.locator('div.font-semibold');
    this.toastDescription = this.toastNotification.locator('div.text-sm');
    
    // Fallback banner
    this.fallbackBanner = page.locator('div.bg-yellow-100, div').filter({ hasText: /using fallback data|microservices may not be running/i });
  }

  /**
   * Navigate to the home page
   */
  async goto(): Promise<void> {
    await this.page.goto(this.url);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Maps to the home page URL
   * @returns The home page URL
   */
  mapsTo(): string {
    return this.url;
  }

  /**
   * Get a product card by product name
   * @param productName - The name of the product
   */
  private getProductCard(productName: string): Locator {
    return this.productCards.filter({ 
      has: this.page.getByRole('heading', { name: productName, exact: true })
    });
  }

  /**
   * Get the "Add to Cart" button for a specific product
   * @param productName - The name of the product
   */
  private getAddToCartButton(productName: string): Locator {
    const productCard = this.getProductCard(productName);
    return productCard.getByRole('button', { name: /add to cart/i });
  }

  /**
   * Add a product to the basket by product name
   * @param productName - The name of the product to add
   */
  async addProductToBasket(productName: string): Promise<void> {
    const addButton = this.getAddToCartButton(productName);
    await addButton.waitFor({ state: 'visible', timeout: 10000 });
    await addButton.click();
    
    // Wait for the toast notification to confirm addition
    await this.page.getByText(/added to cart/i).waitFor({ 
      state: 'visible', 
      timeout: 5000 
    });
  }

  /**
   * Add the first visible product to the basket
   * @returns The name of the product added
   */
  async addFirstProductToBasket(): Promise<string> {
    await this.waitForProductsToLoad();
    const firstCard = this.productCards.first();
    await firstCard.waitFor({ state: 'visible' });
    
    const productName = await firstCard.locator('h3').textContent();
    const addButton = firstCard.getByRole('button', { name: /add to cart/i });
    
    await addButton.click();
    await this.page.getByText(/added to cart/i).waitFor({ state: 'visible', timeout: 5000 });
    
    return productName?.trim() || '';
  }

  /**
   * Open the shopping cart by clicking the cart icon
   */
  async openCart(): Promise<void> {
    await this.cartIcon.click();
    await this.page.waitForURL('**/cart', { timeout: 5000 });
  }

  /**
   * Get the cart item count from the badge
   * @returns The number of items in the cart
   */
  async getCartCount(): Promise<number> {
    try {
      const isVisible = await this.cartBadge.isVisible({ timeout: 2000 });
      if (!isVisible) return 0;
      
      const count = await this.cartBadge.textContent();
      return count ? parseInt(count, 10) : 0;
    } catch {
      return 0;
    }
  }

  /**
   * Get all product names displayed on the page
   * @returns Array of product names
   */
  async getProductNames(): Promise<string[]> {
    await this.waitForProductsToLoad();
    const headings = await this.productCards.locator('h3').allTextContents();
    return headings.map(name => name.trim()).filter(name => name.length > 0);
  }

  /**
   * Check if a product is displayed
   * @param productName - The name of the product
   * @returns True if the product is visible
   */
  async isProductDisplayed(productName: string): Promise<boolean> {
    try {
      return await this.getProductCard(productName).isVisible({ timeout: 3000 });
    } catch {
      return false;
    }
  }

  /**
   * Get the price of a product
   * @param productName - The name of the product
   * @returns The price as a string (e.g., "$3.99")
   */
  async getProductPrice(productName: string): Promise<string> {
    const productCard = this.getProductCard(productName);
    const priceElement = productCard.locator('p.font-bold, p').filter({ hasText: /\$/ }).first();
    return await priceElement.textContent() || '';
  }

  /**
   * Get the description of a product
   * @param productName - The name of the product
   * @returns The product description
   */
  async getProductDescription(productName: string): Promise<string> {
    const productCard = this.getProductCard(productName);
    const descElement = productCard.locator('p.text-muted-foreground').first();
    return await descElement.textContent() || '';
  }

  /**
   * Wait for products to load on the page
   */
  async waitForProductsToLoad(): Promise<void> {
    await this.productGrid.waitFor({ state: 'visible', timeout: 10000 });
    await this.productCards.first().waitFor({ state: 'visible', timeout: 5000 });
  }

  /**
   * Check if fallback data banner is visible
   * @returns True if the fallback data warning is displayed
   */
  async isFallbackDataBannerVisible(): Promise<boolean> {
    try {
      return await this.fallbackBanner.isVisible({ timeout: 2000 });
    } catch {
      return false;
    }
  }

  /**
   * Navigate to orders page
   */
  async goToOrders(): Promise<void> {
    await this.ordersLink.click();
    await this.page.waitForURL('**/orders', { timeout: 5000 });
  }

  /**
   * Navigate back to home page using logo
   */
  async goToHome(): Promise<void> {
    await this.logoLink.click();
    await this.page.waitForURL(this.url, { timeout: 5000 });
  }

  /**
   * Verify toast message appears with specific text
   * @param message - The expected toast message text or regex
   * @returns True if the toast appears
   */
  async verifyToastMessage(message: string | RegExp): Promise<boolean> {
    try {
      const toast = this.page.getByText(message);
      await toast.waitFor({ state: 'visible', timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get the toast notification text
   * @returns The toast message content
   */
  async getToastMessage(): Promise<string> {
    try {
      await this.toastNotification.waitFor({ state: 'visible', timeout: 5000 });
      const title = await this.toastTitle.textContent();
      const description = await this.toastDescription.textContent();
      return `${title || ''} ${description || ''}`.trim();
    } catch {
      return '';
    }
  }

  /**
   * Get the total number of products displayed
   * @returns The count of product cards
   */
  async getProductCount(): Promise<number> {
    await this.waitForProductsToLoad();
    return await this.productCards.count();
  }

  /**
   * Scroll to a specific product by name
   * @param productName - The name of the product to find
   * @returns True if the product is found and scrolled to
   */
  async scrollToProduct(productName: string): Promise<boolean> {
    const productCard = this.getProductCard(productName);
    try {
      await productCard.scrollIntoViewIfNeeded({ timeout: 5000 });
      return await productCard.isVisible();
    } catch {
      return false;
    }
  }

  /**
   * Get product image source URL
   * @param productName - The name of the product
   * @returns The image URL
   */
  async getProductImageUrl(productName: string): Promise<string> {
    const productCard = this.getProductCard(productName);
    const image = productCard.locator('img').first();
    return await image.getAttribute('src') || '';
  }

  /**
   * Check if "Add to Cart" button is enabled for a product
   * @param productName - The name of the product
   * @returns True if the button is enabled
   */
  async isAddToCartButtonEnabled(productName: string): Promise<boolean> {
    const addButton = this.getAddToCartButton(productName);
    return await addButton.isEnabled();
  }

  /**
   * Wait for page to fully load
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    await this.waitForProductsToLoad();
  }

  /**
   * Get the page title
   * @returns The main page heading
   */
  async getPageTitle(): Promise<string> {
    const heading = this.page.getByRole('heading', { name: /welcome to mybasket lite/i });
    return await heading.textContent() || '';
  }

  /**
   * Take a screenshot of the page
   * @param path - The file path to save the screenshot
   */
  async takeScreenshot(path: string): Promise<void> {
    await this.page.screenshot({ path, fullPage: true });
  }
}