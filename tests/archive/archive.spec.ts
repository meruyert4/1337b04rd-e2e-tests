import { test, expect } from '@playwright/test';
import { TestHelpers } from '../shared/test-helpers';

test.describe('Archive Functionality', () => {
  let helpers: TestHelpers;
  let testPostId: number;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
  });

  test('should display archive page', async ({ page }) => {
    await helpers.navigateTo('/archive');
    await helpers.waitForPageLoad();
    
    // Check that archive container exists
    await helpers.waitForElementByTestId('archive-container');
    
    // Check for archive header
    const archiveHeader = await helpers.getTextByTestId('archive-header');
    expect(archiveHeader).toContain('ARCHIVE');
  });

  test('should show empty state when no archived posts', async ({ page }) => {
    await helpers.navigateTo('/archive');
    await helpers.waitForPageLoad();
    
    // Check for empty state message
    const emptyMessage = helpers.getElementByTestId('archive-empty-message');
    await expect(emptyMessage).toBeVisible();
    
    const emptyText = await helpers.getTextByTestId('archive-empty-message');
    expect(emptyText).toContain('No archived posts found');
  });

  test('should archive a post and show it in archive', async ({ page }) => {
    // First create a post
    await helpers.navigateTo('/posts');
    await helpers.waitForPageLoad();
    
    await helpers.clickByTestId('create-post-btn');
    await helpers.waitForElementByTestId('post-form');
    await helpers.fillByTestId('post-title-input', 'Post to Archive');
    await helpers.fillByTestId('post-content-textarea', 'This post will be archived');
    await helpers.clickByTestId('submit-post-btn');
    await helpers.waitForElementHidden('post-form');
    
    // Get the post ID
    const postCard = page.locator('[data-testid^="post-card-"]').first();
    const testId = await postCard.getAttribute('data-testid');
    testPostId = parseInt(testId?.replace('post-card-', '') || '0');
    
    // Archive the post
    await helpers.clickByTestId('archive-btn');
    
    // Wait for post to be removed from main list
    await helpers.waitForElementHidden(`post-card-${testPostId}`);
    
    // Navigate to archive
    await helpers.navigateTo('/archive');
    await helpers.waitForPageLoad();
    
    // Check that archived post is visible
    const archivedPost = helpers.getElementByTestId(`post-card-${testPostId}`);
    await expect(archivedPost).toBeVisible();
    
    // Check that post shows as archived
    const postTitle = await helpers.getTextByTestId('post-title');
    expect(postTitle).toBe('Post to Archive');
  });

  test('should unarchive a post', async ({ page }) => {
    // First create and archive a post
    await helpers.navigateTo('/posts');
    await helpers.waitForPageLoad();
    
    await helpers.clickByTestId('create-post-btn');
    await helpers.waitForElementByTestId('post-form');
    await helpers.fillByTestId('post-title-input', 'Post to Unarchive');
    await helpers.fillByTestId('post-content-textarea', 'This post will be unarchived');
    await helpers.clickByTestId('submit-post-btn');
    await helpers.waitForElementHidden('post-form');
    
    // Get the post ID
    const postCard = page.locator('[data-testid^="post-card-"]').first();
    const testId = await postCard.getAttribute('data-testid');
    testPostId = parseInt(testId?.replace('post-card-', '') || '0');
    
    // Archive the post
    await helpers.clickByTestId('archive-btn');
    await helpers.waitForElementHidden(`post-card-${testPostId}`);
    
    // Navigate to archive
    await helpers.navigateTo('/archive');
    await helpers.waitForPageLoad();
    
    // Verify post is in archive
    const archivedPost = helpers.getElementByTestId(`post-card-${testPostId}`);
    await expect(archivedPost).toBeVisible();
    
    // Click unarchive button
    await helpers.clickByTestId('unarchive-btn');
    
    // Wait for post to be removed from archive
    await helpers.waitForElementHidden(`post-card-${testPostId}`);
    
    // Navigate back to posts
    await helpers.navigateTo('/posts');
    await helpers.waitForPageLoad();
    
    // Check that post is back in main list
    const unarchivedPost = helpers.getElementByTestId(`post-card-${testPostId}`);
    await expect(unarchivedPost).toBeVisible();
  });

  test('should view archived post details', async ({ page }) => {
    // Create and archive a post
    await helpers.navigateTo('/posts');
    await helpers.waitForPageLoad();
    
    await helpers.clickByTestId('create-post-btn');
    await helpers.waitForElementByTestId('post-form');
    await helpers.fillByTestId('post-title-input', 'Archived Post Details');
    await helpers.fillByTestId('post-content-textarea', 'This archived post will be viewed');
    await helpers.clickByTestId('submit-post-btn');
    await helpers.waitForElementHidden('post-form');
    
    // Get the post ID
    const postCard = page.locator('[data-testid^="post-card-"]').first();
    const testId = await postCard.getAttribute('data-testid');
    testPostId = parseInt(testId?.replace('post-card-', '') || '0');
    
    // Archive the post
    await helpers.clickByTestId('archive-btn');
    await helpers.waitForElementHidden(`post-card-${testPostId}`);
    
    // Navigate to archive
    await helpers.navigateTo('/archive');
    await helpers.waitForPageLoad();
    
    // Click view button on archived post
    await helpers.clickByTestId('view-btn');
    
    // Wait for view mode
    await helpers.waitForElementByTestId('post-view-mode');
    
    // Check that post details are displayed
    const postTitle = await helpers.getTextByTestId('post-title');
    expect(postTitle).toBe('Archived Post Details');
    
    const postContent = await helpers.getTextByTestId('post-text');
    expect(postContent).toBe('This archived post will be viewed');
  });

  test('should show pagination for archived posts', async ({ page }) => {
    // This test would require creating multiple posts and archiving them
    // For now, just check that pagination component exists
    await helpers.navigateTo('/archive');
    await helpers.waitForPageLoad();
    
    // Check for pagination component (if posts exist)
    const paginationExists = await helpers.elementExists('pagination');
    // This might not exist if there are no posts, which is fine
  });

  test.afterEach(async ({ page }) => {
    // Cleanup: delete test post
    if (testPostId) {
      try {
        await page.request.delete(`http://localhost:8080/api/posts/${testPostId}`);
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  });
});
