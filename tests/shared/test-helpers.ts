import { Page, expect } from '@playwright/test';

export class TestHelpers {
  constructor(private page: Page) {}

  /**
   * Wait for the page to be fully loaded
   */
  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForSelector('[data-testid="header"]');
  }

  /**
   * Navigate to a specific page
   */
  async navigateTo(path: string) {
    await this.page.goto(path);
    await this.waitForPageLoad();
  }

  /**
   * Wait for a specific element to be visible
   */
  async waitForElement(selector: string) {
    await this.page.waitForSelector(selector, { state: 'visible' });
  }

  /**
   * Wait for a specific element to be hidden
   */
  async waitForElementHidden(selector: string) {
    await this.page.waitForSelector(selector, { state: 'hidden' });
  }

  /**
   * Click on an element by test id
   */
  async clickByTestId(testId: string) {
    await this.page.click(`[data-testid="${testId}"]`);
  }

  /**
   * Fill input by test id
   */
  async fillByTestId(testId: string, value: string) {
    await this.page.fill(`[data-testid="${testId}"]`, value);
  }

  /**
   * Get text content by test id
   */
  async getTextByTestId(testId: string): Promise<string> {
    return await this.page.textContent(`[data-testid="${testId}"]`) || '';
  }

  /**
   * Check if element exists by test id
   */
  async elementExists(testId: string): Promise<boolean> {
    return await this.page.locator(`[data-testid="${testId}"]`).count() > 0;
  }

  /**
   * Wait for element to exist by test id
   */
  async waitForElementByTestId(testId: string) {
    await this.page.waitForSelector(`[data-testid="${testId}"]`);
  }

  /**
   * Get element by test id
   */
  getElementByTestId(testId: string) {
    return this.page.locator(`[data-testid="${testId}"]`);
  }

  /**
   * Take a screenshot for debugging
   */
  async takeScreenshot(name: string) {
    await this.page.screenshot({ path: `screenshots/${name}.png`, fullPage: true });
  }

  /**
   * Wait for API response
   */
  async waitForApiResponse(urlPattern: string) {
    return await this.page.waitForResponse(response => 
      response.url().includes(urlPattern) && response.status() === 200
    );
  }

  /**
   * Clear all cookies and local storage
   */
  async clearSession() {
    await this.page.context().clearCookies();
    await this.page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  }

  /**
   * Wait for loading to complete
   */
  async waitForLoading() {
    // Wait for any loading indicators to disappear
    await this.page.waitForFunction(() => {
      const loadingElements = document.querySelectorAll('[data-testid*="loading"]');
      return loadingElements.length === 0;
    });
  }
}
