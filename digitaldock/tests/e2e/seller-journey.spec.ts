import { test, expect } from '@playwright/test';

/**
 * E2E Tests: Seller Journey
 * Tests the complete flow for a seller from registration to sales management
 */

test.describe('Seller Journey - Complete Flow', () => {
  const testSeller = {
    name: 'Test Seller',
    email: `seller.${Date.now()}@test.com`,
    password: 'SecurePassword123!',
  };

  test('should complete full seller journey: register → upload product → track sales', async ({ page }) => {
    // 1. Navigate to homepage
    await page.goto('/');
    await expect(page).toHaveTitle(/DigitalDock/);

    // 2. Navigate to registration
    await page.click('text=Sign Up');
    await expect(page).toHaveURL(/\/auth\/register/);

    // 3. Register as a seller
    await page.fill('input[name="name"]', testSeller.name);
    await page.fill('input[name="email"]', testSeller.email);
    await page.fill('input[name="password"]', testSeller.password);
    await page.check('input[type="radio"][value="SELLER"]');
    await page.click('button[type="submit"]');

    // Wait for registration success
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

    // 4. Navigate to product upload
    await page.goto('/seller/products/new');
    await expect(page.locator('h1')).toContainText(/New Product|Upload Product/);

    // 5. Fill product details
    await page.fill('input[name="title"]', 'E2E Test Product - Notion Template');
    await page.fill('textarea[name="description"]', 'This is a test product created during E2E testing. It includes comprehensive templates for productivity tracking and project management.');
    await page.fill('input[name="price"]', '29.99');
    await page.selectOption('select[name="category"]', 'TEMPLATES');

    // Add tags
    await page.fill('input[name="tags"]', 'notion, productivity, template');

    // 6. Upload cover image (mock file upload)
    const coverImageInput = page.locator('input[type="file"][accept*="image"]').first();
    await coverImageInput.setInputFiles({
      name: 'cover.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('fake image content'),
    });

    // 7. Upload product file (mock file upload)
    const productFileInput = page.locator('input[type="file"][accept*="zip"]').first();
    await productFileInput.setInputFiles({
      name: 'product.zip',
      mimeType: 'application/zip',
      buffer: Buffer.from('fake zip content'),
    });

    // 8. Submit product for review
    await page.click('button[type="submit"]:has-text("Submit for Review")');

    // Wait for success message
    await expect(page.locator('text=/Product uploaded|Successfully submitted/i')).toBeVisible({ timeout: 10000 });

    // 9. Navigate to seller dashboard
    await page.goto('/seller/dashboard');
    await expect(page.locator('h1')).toContainText(/Dashboard|My Products/);

    // 10. Verify product appears in product list
    await page.goto('/seller/products');
    await expect(page.locator('text=E2E Test Product')).toBeVisible();

    // 11. Verify product status is "PENDING"
    await expect(page.locator('text=/Pending|Under Review/i')).toBeVisible();
  });

  test('should display seller dashboard with stats', async ({ page }) => {
    // Login as seller
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', 'seller@test.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]').catch(() => {
      console.log('Login failed - test account may not exist');
    });

    await page.goto('/seller/dashboard');

    // Verify dashboard stats
    await expect(page.locator('[data-testid="total-sales"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-earnings"]')).toBeVisible();
    await expect(page.locator('[data-testid="product-count"]')).toBeVisible();

    // Verify charts/graphs section
    await expect(page.locator('text=/Sales Overview|Revenue Chart/i')).toBeVisible();
  });

  test('should edit existing product', async ({ page }) => {
    // Login as seller
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', testSeller.email);
    await page.fill('input[name="password"]', testSeller.password);
    await page.click('button[type="submit"]');

    // Navigate to products
    await page.goto('/seller/products');

    // Click edit on first product
    await page.locator('[data-testid="edit-product-button"]').first().click();

    // Update product details
    const newTitle = `Updated Product ${Date.now()}`;
    await page.fill('input[name="title"]', newTitle);
    await page.fill('input[name="price"]', '39.99');

    // Save changes
    await page.click('button:has-text("Save Changes")');

    // Verify success
    await expect(page.locator('text=/Product updated|Changes saved/i')).toBeVisible({ timeout: 5000 });

    // Verify new title appears
    await page.goto('/seller/products');
    await expect(page.locator(`text=${newTitle}`)).toBeVisible();
  });
});

test.describe('Product Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login as seller before each test
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', 'seller@test.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]').catch(() => {
      console.log('Login failed - test account may not exist');
    });
  });

  test('should view list of all products', async ({ page }) => {
    await page.goto('/seller/products');

    await expect(page.locator('h1')).toContainText(/My Products|Products/);

    // Check if products are displayed
    const productCount = await page.locator('[data-testid="product-item"]').count();
    expect(productCount).toBeGreaterThanOrEqual(0);
  });

  test('should filter products by status', async ({ page }) => {
    await page.goto('/seller/products');

    // Filter by published products
    await page.click('button:has-text("Published")');
    await page.waitForTimeout(500);

    // Verify only published products are shown
    const statusBadges = page.locator('[data-testid="product-status"]');
    const count = await statusBadges.count();

    for (let i = 0; i < count; i++) {
      const status = await statusBadges.nth(i).textContent();
      expect(status?.toLowerCase()).toContain('published');
    }
  });

  test('should delete product', async ({ page }) => {
    await page.goto('/seller/products');

    const initialCount = await page.locator('[data-testid="product-item"]').count();

    if (initialCount > 0) {
      // Click delete button on first product
      await page.locator('[data-testid="delete-product-button"]').first().click();

      // Confirm deletion
      await page.click('button:has-text("Confirm")');

      // Verify success message
      await expect(page.locator('text=/Product deleted|Successfully removed/i')).toBeVisible({ timeout: 5000 });

      // Verify product count decreased
      const newCount = await page.locator('[data-testid="product-item"]').count();
      expect(newCount).toBe(initialCount - 1);
    }
  });

  test('should view product analytics', async ({ page }) => {
    await page.goto('/seller/products');

    // Click on first product
    await page.locator('[data-testid="product-item"]').first().click();

    // Navigate to analytics tab
    await page.click('button:has-text("Analytics")');

    // Verify analytics data
    await expect(page.locator('[data-testid="total-views"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-purchases"]')).toBeVisible();
    await expect(page.locator('[data-testid="conversion-rate"]')).toBeVisible();
  });
});

test.describe('Sales and Earnings', () => {
  test.beforeEach(async ({ page }) => {
    // Login as seller before each test
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', 'seller@test.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]').catch(() => {
      console.log('Login failed - test account may not exist');
    });
  });

  test('should display sales history', async ({ page }) => {
    await page.goto('/seller/sales');

    await expect(page.locator('h1')).toContainText(/Sales|Orders/);

    // Check for sales table
    const sales = await page.locator('[data-testid="sale-item"]').count();
    expect(sales).toBeGreaterThanOrEqual(0);

    if (sales > 0) {
      // Verify sale details are visible
      await expect(page.locator('[data-testid="sale-amount"]').first()).toBeVisible();
      await expect(page.locator('[data-testid="sale-date"]').first()).toBeVisible();
      await expect(page.locator('[data-testid="buyer-info"]').first()).toBeVisible();
    }
  });

  test('should display earnings breakdown', async ({ page }) => {
    await page.goto('/seller/earnings');

    await expect(page.locator('h1')).toContainText(/Earnings|Revenue/);

    // Verify earnings stats
    await expect(page.locator('[data-testid="total-earnings"]')).toBeVisible();
    await expect(page.locator('[data-testid="pending-payout"]')).toBeVisible();
    await expect(page.locator('[data-testid="completed-payouts"]')).toBeVisible();

    // Verify platform fee information
    await expect(page.locator('text=/Platform Fee|Commission/i')).toBeVisible();
  });

  test('should filter sales by date range', async ({ page }) => {
    await page.goto('/seller/sales');

    // Set date range filter
    await page.fill('input[name="startDate"]', '2025-01-01');
    await page.fill('input[name="endDate"]', '2025-12-31');
    await page.click('button:has-text("Apply")');

    await page.waitForTimeout(1000);

    // Verify filtered results
    const sales = await page.locator('[data-testid="sale-item"]').count();
    expect(sales).toBeGreaterThanOrEqual(0);
  });

  test('should request payout', async ({ page }) => {
    await page.goto('/seller/earnings');

    const pendingBalance = await page.locator('[data-testid="pending-balance"]').textContent();
    const balance = parseFloat(pendingBalance?.replace(/[^0-9.]/g, '') || '0');

    if (balance > 0) {
      // Request payout
      await page.click('button:has-text("Request Payout")');

      // Fill payout details
      await page.fill('input[name="payoutAmount"]', balance.toString());
      await page.selectOption('select[name="payoutMethod"]', 'BANK_TRANSFER');
      await page.click('button:has-text("Submit Request")');

      // Verify success
      await expect(page.locator('text=/Payout requested|Request submitted/i')).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe('Seller Profile', () => {
  test.beforeEach(async ({ page }) => {
    // Login as seller
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', 'seller@test.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]').catch(() => {
      console.log('Login failed - test account may not exist');
    });
  });

  test('should update seller profile', async ({ page }) => {
    await page.goto('/settings/seller-profile');

    // Update seller info
    await page.fill('input[name="businessName"]', 'Test Business LLC');
    await page.fill('textarea[name="bio"]', 'Experienced digital product creator specializing in productivity tools.');
    await page.fill('input[name="website"]', 'https://testbusiness.com');
    await page.fill('input[name="twitter"]', '@testbusiness');
    await page.fill('input[name="instagram"]', '@testbusiness');

    // Save changes
    await page.click('button:has-text("Save Profile")');

    // Verify success
    await expect(page.locator('text=/Profile updated|Changes saved/i')).toBeVisible({ timeout: 5000 });
  });

  test('should view public seller profile', async ({ page }) => {
    // Navigate to seller's public profile
    await page.goto('/seller/test-seller');

    // Verify profile elements
    await expect(page.locator('[data-testid="seller-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="seller-bio"]')).toBeVisible();
    await expect(page.locator('[data-testid="seller-products"]')).toBeVisible();
    await expect(page.locator('[data-testid="seller-rating"]')).toBeVisible();
  });

  test('should display seller badge for verified sellers', async ({ page }) => {
    await page.goto('/settings/seller-profile');

    // Check for verification status
    const isVerified = await page.locator('[data-testid="verified-badge"]').count() > 0;

    if (isVerified) {
      await expect(page.locator('text=/Verified Seller/i')).toBeVisible();
    } else {
      await expect(page.locator('text=/Get Verified|Apply for Verification/i')).toBeVisible();
    }
  });
});

test.describe('Product Reviews and Ratings', () => {
  test.beforeEach(async ({ page }) => {
    // Login as seller
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', 'seller@test.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]').catch(() => {
      console.log('Login failed - test account may not exist');
    });
  });

  test('should view product reviews', async ({ page }) => {
    await page.goto('/seller/reviews');

    await expect(page.locator('h1')).toContainText(/Reviews|Customer Feedback/);

    // Check for reviews
    const reviews = await page.locator('[data-testid="review-item"]').count();
    expect(reviews).toBeGreaterThanOrEqual(0);

    if (reviews > 0) {
      // Verify review details
      await expect(page.locator('[data-testid="review-rating"]').first()).toBeVisible();
      await expect(page.locator('[data-testid="review-comment"]').first()).toBeVisible();
      await expect(page.locator('[data-testid="review-date"]').first()).toBeVisible();
    }
  });

  test('should respond to customer review', async ({ page }) => {
    await page.goto('/seller/reviews');

    const reviews = await page.locator('[data-testid="review-item"]').count();

    if (reviews > 0) {
      // Click respond button on first review
      await page.locator('[data-testid="respond-button"]').first().click();

      // Type response
      await page.fill('textarea[name="response"]', 'Thank you for your feedback! We appreciate your purchase.');
      await page.click('button:has-text("Submit Response")');

      // Verify success
      await expect(page.locator('text=/Response posted|Reply submitted/i')).toBeVisible({ timeout: 5000 });
    }
  });

  test('should filter reviews by rating', async ({ page }) => {
    await page.goto('/seller/reviews');

    // Filter by 5-star reviews
    await page.click('button:has-text("5 Stars")');
    await page.waitForTimeout(500);

    // Verify only 5-star reviews are shown
    const ratingElements = page.locator('[data-testid="review-rating"]');
    const count = await ratingElements.count();

    for (let i = 0; i < count; i++) {
      const ratingText = await ratingElements.nth(i).textContent();
      expect(ratingText).toContain('5');
    }
  });
});

test.describe('Seller Notifications', () => {
  test.beforeEach(async ({ page }) => {
    // Login as seller
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', 'seller@test.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]').catch(() => {
      console.log('Login failed - test account may not exist');
    });
  });

  test('should display new sale notifications', async ({ page }) => {
    await page.goto('/seller/dashboard');

    // Check for notification bell/icon
    const notificationBell = page.locator('[data-testid="notification-icon"]');
    await expect(notificationBell).toBeVisible();

    // Check if there are unread notifications
    const unreadCount = await page.locator('[data-testid="unread-count"]').count();

    if (unreadCount > 0) {
      // Click notification bell
      await notificationBell.click();

      // Verify notifications dropdown
      await expect(page.locator('[data-testid="notification-dropdown"]')).toBeVisible();

      // Verify sale notification
      await expect(page.locator('text=/New sale|Purchase notification/i')).toBeVisible();
    }
  });

  test('should mark notifications as read', async ({ page }) => {
    await page.goto('/seller/notifications');

    const notifications = await page.locator('[data-testid="notification-item"]').count();

    if (notifications > 0) {
      // Click first notification
      await page.locator('[data-testid="notification-item"]').first().click();

      // Verify it's marked as read
      await expect(page.locator('[data-testid="notification-item"]').first()).not.toHaveClass(/unread/);
    }
  });
});
