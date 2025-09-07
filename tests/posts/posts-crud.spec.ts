import { test, expect } from '@playwright/test';
import { TestHelpers } from '../shared/test-helpers';

test.describe('Posts CRUD Operations', () => {
  let helpers: TestHelpers;
  let testPostId: number;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    await helpers.navigateTo('/posts');
    await helpers.waitForPageLoad();
  });

  test('should display posts list', async ({ page }) => {
    // Check that posts container exists
    await helpers.waitForElementByTestId('posts-container');
    
    // Check for create post button
    const createButton = helpers.getElementByTestId('create-post-btn');
    await expect(createButton).toBeVisible();
  });

  test('should create a new post', async ({ page }) => {
    // Click create post button
    await helpers.clickByTestId('create-post-btn');
    
    // Wait for post form to appear
    await helpers.waitForElementByTestId('post-form');
    
    // Fill post form
    await helpers.fillByTestId('post-title-input', 'Test Post Title');
    await helpers.fillByTestId('post-content-textarea', 'This is a test post content for E2E testing.');
    
    // Submit form
    await helpers.clickByTestId('submit-post-btn');
    
    // Wait for form to close and post to appear
    await helpers.waitForElementHidden('post-form');
    await helpers.waitForElementByTestId('posts-container');
    
    // Check that post was created
    const postCards = page.locator('[data-testid^="post-card-"]');
    await expect(postCards).toHaveCount(1);
    
    // Get the post ID for cleanup
    const postCard = postCards.first();
    const testId = await postCard.getAttribute('data-testid');
    testPostId = parseInt(testId?.replace('post-card-', '') || '0');
  });

  test('should view post details', async ({ page }) => {
    // First create a post
    await helpers.clickByTestId('create-post-btn');
    await helpers.waitForElementByTestId('post-form');
    await helpers.fillByTestId('post-title-input', 'Test Post for Viewing');
    await helpers.fillByTestId('post-content-textarea', 'This post will be viewed in detail.');
    await helpers.clickByTestId('submit-post-btn');
    await helpers.waitForElementHidden('post-form');
    
    // Click view button
    await helpers.clickByTestId('view-btn');
    
    // Wait for view mode
    await helpers.waitForElementByTestId('post-view-mode');
    
    // Check that post details are displayed
    const postTitle = await helpers.getTextByTestId('post-title');
    expect(postTitle).toBe('Test Post for Viewing');
    
    const postContent = await helpers.getTextByTestId('post-text');
    expect(postContent).toBe('This post will be viewed in detail.');
  });

  test('should edit post', async ({ page }) => {
    // Create a post first
    await helpers.clickByTestId('create-post-btn');
    await helpers.waitForElementByTestId('post-form');
    await helpers.fillByTestId('post-title-input', 'Original Title');
    await helpers.fillByTestId('post-content-textarea', 'Original content');
    await helpers.clickByTestId('submit-post-btn');
    await helpers.waitForElementHidden('post-form');
    
    // Click edit button
    await helpers.clickByTestId('edit-btn');
    
    // Wait for edit form
    await helpers.waitForElementByTestId('post-form');
    
    // Update post
    await helpers.fillByTestId('post-title-input', 'Updated Title');
    await helpers.fillByTestId('post-content-textarea', 'Updated content');
    await helpers.clickByTestId('submit-post-btn');
    
    // Wait for form to close
    await helpers.waitForElementHidden('post-form');
    
    // Check that post was updated
    const postTitle = await helpers.getTextByTestId('post-title');
    expect(postTitle).toBe('Updated Title');
  });

  test('should delete post', async ({ page }) => {
    // Create a post first
    await helpers.clickByTestId('create-post-btn');
    await helpers.waitForElementByTestId('post-form');
    await helpers.fillByTestId('post-title-input', 'Post to Delete');
    await helpers.fillByTestId('post-content-textarea', 'This post will be deleted');
    await helpers.clickByTestId('submit-post-btn');
    await helpers.waitForElementHidden('post-form');
    
    // Click delete button
    await helpers.clickByTestId('delete-btn');
    
    // Confirm deletion in dialog
    page.on('dialog', dialog => dialog.accept());
    
    // Wait for post to be removed
    await helpers.waitForElementHidden('post-card-1');
    
    // Check that no posts remain
    const postCards = page.locator('[data-testid^="post-card-"]');
    await expect(postCards).toHaveCount(0);
  });

  test('should archive post', async ({ page }) => {
    // Create a post first
    await helpers.clickByTestId('create-post-btn');
    await helpers.waitForElementByTestId('post-form');
    await helpers.fillByTestId('post-title-input', 'Post to Archive');
    await helpers.fillByTestId('post-content-textarea', 'This post will be archived');
    await helpers.clickByTestId('submit-post-btn');
    await helpers.waitForElementHidden('post-form');
    
    // Click archive button
    await helpers.clickByTestId('archive-btn');
    
    // Wait for post to be removed from main list
    await helpers.waitForElementHidden('post-card-1');
    
    // Navigate to archive to verify
    await helpers.navigateTo('/archive');
    await helpers.waitForElementByTestId('archive-container');
    
    // Check that archived post is visible
    const archivedPost = page.locator('[data-testid^="post-card-"]');
    await expect(archivedPost).toHaveCount(1);
  });

  test.afterEach(async ({ page }) => {
    // Cleanup: delete any test posts
    if (testPostId) {
      try {
        await page.request.delete(`http://localhost:8080/api/posts/${testPostId}`);
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  });
});
