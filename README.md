# 1337B04RD E2E Tests

End-to-end tests for the 1337B04RD application using Playwright.

## Prerequisites

- Node.js (v16 or higher)
- The frontend application running on `http://localhost:3000`
- The backend API running on `http://localhost:8080`

## Setup

1. Install dependencies:
```bash
npm install
```

2. Install Playwright browsers:
```bash
npx playwright install
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests with UI
```bash
npm run test:ui
```

### Run tests in headed mode (see browser)
```bash
npm run test:headed
```

### Debug tests
```bash
npm run test:debug
```

### View test report
```bash
npm run test:report
```

## Test Structure

Tests are organized by feature modules:

- `tests/auth/` - Authentication and session management tests
- `tests/posts/` - Post CRUD operations tests
- `tests/comments/` - Comment functionality tests
- `tests/archive/` - Archive functionality tests
- `tests/shared/` - Shared utilities and helpers

## Test Features

### Authentication Tests
- Session creation and restoration
- Profile management
- User interface interactions

### Posts Tests
- Create, read, update, delete posts
- Post viewing and editing
- Image attachments
- Archive/unarchive functionality

### Comments Tests
- Create, edit, delete comments
- Reply to comments (nested comments)
- Comment form interactions
- Comment count display

### Archive Tests
- Archive and unarchive posts
- View archived posts
- Archive page navigation

## Configuration

The tests are configured in `playwright.config.ts`:
- Base URL: `http://localhost:3000`
- Multiple browsers: Chrome, Firefox, Safari, Mobile
- Automatic frontend server startup
- Parallel test execution

## Test Data

Tests are designed to be isolated and self-contained:
- Each test creates its own test data
- Cleanup is performed after each test
- No shared state between tests

## Debugging

- Use `npm run test:debug` to run tests in debug mode
- Screenshots are automatically taken on failures
- Traces are collected for failed tests
- Use `npm run test:ui` for interactive test running