import { test, expect } from '@playwright/test';
import { TestHelpers } from '../shared/test-helpers';

test.describe('Session Management', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    await helpers.navigateTo('/');
  });

  test('should create new session on page load', async ({ page }) => {
    // Wait for profile section to be visible (indicates session is created)
    await helpers.waitForElementByTestId('profile-section');
    
    // Check that username is displayed
    const username = await helpers.getTextByTestId('username-compact');
    expect(username).toBeTruthy();
    expect(username.length).toBeGreaterThan(0);
  });

  test('should display profile information', async ({ page }) => {
    await helpers.waitForElementByTestId('profile-section');
    
    // Click on profile to expand
    await helpers.clickByTestId('profile-compact');
    
    // Wait for dropdown to appear
    await helpers.waitForElementByTestId('profile-dropdown');
    
    // Check profile details
    const username = await helpers.getTextByTestId('username');
    expect(username).toBeTruthy();
    
    // Check if gender and age are displayed
    const genderExists = await helpers.elementExists('gender');
    const ageExists = await helpers.elementExists('age');
    
    // At least one should exist
    expect(genderExists || ageExists).toBeTruthy();
  });

  test('should create new session when dice button is clicked', async ({ page }) => {
    await helpers.waitForElementByTestId('profile-section');
    
    // Get initial username
    const initialUsername = await helpers.getTextByTestId('username-compact');
    
    // Click dice button to create new session
    await helpers.clickByTestId('dice-button');
    
    // Wait for new session to load
    await page.waitForTimeout(2000);
    
    // Get new username
    const newUsername = await helpers.getTextByTestId('username-compact');
    
    // Username should be different (very high probability)
    expect(newUsername).toBeTruthy();
    expect(newUsername).not.toBe(initialUsername);
  });

  test('should persist session across page reloads', async ({ page }) => {
    await helpers.waitForElementByTestId('profile-section');
    
    // Get initial username
    const initialUsername = await helpers.getTextByTestId('username-compact');
    
    // Reload page
    await page.reload();
    await helpers.waitForPageLoad();
    
    // Username should be the same
    const reloadedUsername = await helpers.getTextByTestId('username-compact');
    expect(reloadedUsername).toBe(initialUsername);
  });

  test('should handle session restoration', async ({ page }) => {
    // Clear session first
    await helpers.clearSession();
    
    // Navigate to page
    await helpers.navigateTo('/');
    
    // Wait for session to be created
    await helpers.waitForElementByTestId('profile-section');
    
    // Session should be created automatically
    const username = await helpers.getTextByTestId('username-compact');
    expect(username).toBeTruthy();
  });
});
