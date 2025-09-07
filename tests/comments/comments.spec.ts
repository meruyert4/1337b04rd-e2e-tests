import { test, expect } from '@playwright/test';
import { TestHelpers } from '../shared/test-helpers';

test.describe('Comments Functionality', () => {
  let helpers: TestHelpers;
  let testPostId: number;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    
    // Create a test post first
    await helpers.navigateTo('/posts');
    await helpers.waitForPageLoad();
    
    await helpers.clickByTestId('create-post-btn');
    await helpers.waitForElementByTestId('post-form');
    await helpers.fillByTestId('post-title-input', 'Test Post for Comments');
    await helpers.fillByTestId('post-content-textarea', 'This post is for testing comments functionality.');
    await helpers.clickByTestId('submit-post-btn');
    await helpers.waitForElementHidden('post-form');
    
    // Get the post ID
    const postCard = page.locator('[data-testid^="post-card-"]').first();
    const testId = await postCard.getAttribute('data-testid');
    testPostId = parseInt(testId?.replace('post-card-', '') || '0');
    
    // Navigate to post view
    await helpers.clickByTestId('view-btn');
    await helpers.waitForElementByTestId('post-view-mode');
  });

  test('should display comments section', async ({ page }) => {
    // Check that comments section exists
    await helpers.waitForElementByTestId('comment-list');
    
    // Check for comments header
    const commentsHeader = await helpers.getTextByTestId('comment-list');
    expect(commentsHeader).toContain('Comments (0)');
  });

  test('should show add comment button when no comments', async ({ page }) => {
    // Check that add comment button is visible
    const addCommentBtn = helpers.getElementByTestId('add-comment-btn');
    await expect(addCommentBtn).toBeVisible();
    
    const buttonText = await helpers.getTextByTestId('add-comment-btn');
    expect(buttonText).toContain('Add Comment');
  });

  test('should create a new comment', async ({ page }) => {
    // Click add comment button
    await helpers.clickByTestId('add-comment-btn');
    
    // Wait for comment form to appear
    await helpers.waitForElementByTestId('comment-form');
    
    // Fill comment form
    await helpers.fillByTestId('comment-title-input', 'Test Comment');
    await helpers.fillByTestId('comment-content-textarea', 'This is a test comment.');
    
    // Submit comment
    await helpers.clickByTestId('submit-comment-btn');
    
    // Wait for comment to appear
    await helpers.waitForElementByTestId('comment-card-1');
    
    // Check that comment was created
    const commentTitle = await helpers.getTextByTestId('comment-title');
    expect(commentTitle).toBe('Test Comment');
    
    const commentContent = await helpers.getTextByTestId('comment-content');
    expect(commentContent).toBe('This is a test comment.');
  });

  test('should edit comment', async ({ page }) => {
    // Create a comment first
    await helpers.clickByTestId('add-comment-btn');
    await helpers.waitForElementByTestId('comment-form');
    await helpers.fillByTestId('comment-title-input', 'Original Comment');
    await helpers.fillByTestId('comment-content-textarea', 'Original comment content');
    await helpers.clickByTestId('submit-comment-btn');
    await helpers.waitForElementByTestId('comment-card-1');
    
    // Click edit button
    await helpers.clickByTestId('comment-edit-btn');
    
    // Wait for edit form
    await helpers.waitForElementByTestId('comment-form');
    
    // Update comment
    await helpers.fillByTestId('comment-title-input', 'Updated Comment');
    await helpers.fillByTestId('comment-content-textarea', 'Updated comment content');
    await helpers.clickByTestId('submit-comment-btn');
    
    // Check that comment was updated
    const commentTitle = await helpers.getTextByTestId('comment-title');
    expect(commentTitle).toBe('Updated Comment');
  });

  test('should delete comment', async ({ page }) => {
    // Create a comment first
    await helpers.clickByTestId('add-comment-btn');
    await helpers.waitForElementByTestId('comment-form');
    await helpers.fillByTestId('comment-title-input', 'Comment to Delete');
    await helpers.fillByTestId('comment-content-textarea', 'This comment will be deleted');
    await helpers.clickByTestId('submit-comment-btn');
    await helpers.waitForElementByTestId('comment-card-1');
    
    // Click delete button
    await helpers.clickByTestId('comment-delete-btn');
    
    // Confirm deletion in dialog
    page.on('dialog', dialog => dialog.accept());
    
    // Wait for comment to be removed
    await helpers.waitForElementHidden('comment-card-1');
    
    // Check that add comment button is visible again
    const addCommentBtn = helpers.getElementByTestId('add-comment-btn');
    await expect(addCommentBtn).toBeVisible();
  });

  test('should reply to comment', async ({ page }) => {
    // Create a parent comment first
    await helpers.clickByTestId('add-comment-btn');
    await helpers.waitForElementByTestId('comment-form');
    await helpers.fillByTestId('comment-title-input', 'Parent Comment');
    await helpers.fillByTestId('comment-content-textarea', 'This is a parent comment');
    await helpers.clickByTestId('submit-comment-btn');
    await helpers.waitForElementByTestId('comment-card-1');
    
    // Click reply button
    await helpers.clickByTestId('comment-reply-btn');
    
    // Wait for reply form
    await helpers.waitForElementByTestId('comment-form');
    
    // Fill reply form
    await helpers.fillByTestId('comment-title-input', 'Reply Comment');
    await helpers.fillByTestId('comment-content-textarea', 'This is a reply to the parent comment');
    await helpers.clickByTestId('submit-comment-btn');
    
    // Check that reply was created
    await helpers.waitForElementByTestId('comment-card-2');
    
    // Check that reply is nested under parent
    const replyCard = helpers.getElementByTestId('comment-card-2');
    await expect(replyCard).toBeVisible();
  });

  test('should show comment count in post card', async ({ page }) => {
    // Create a comment
    await helpers.clickByTestId('add-comment-btn');
    await helpers.waitForElementByTestId('comment-form');
    await helpers.fillByTestId('comment-title-input', 'Test Comment');
    await helpers.fillByTestId('comment-content-textarea', 'Test comment content');
    await helpers.clickByTestId('submit-comment-btn');
    await helpers.waitForElementByTestId('comment-card-1');
    
    // Go back to posts list
    await helpers.navigateTo('/posts');
    await helpers.waitForPageLoad();
    
    // Check that comment count is displayed
    const commentCount = await helpers.getTextByTestId('post-comment-count');
    expect(commentCount).toContain('💬 1');
  });

  test.afterEach(async ({ page }) => {
    // Cleanup: delete test post and comments
    if (testPostId) {
      try {
        await page.request.delete(`http://localhost:8080/api/posts/${testPostId}`);
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  });
});
