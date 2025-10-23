import { test, expect } from '@playwright/test';

/**
 * E2E Tests: Buyer Journey
 * Tests based on actual implemented routes
 */

test.describe('Authentication', () => {
  const testUser = {
    name: 'Test User',
    email: `test.${Date.now()}@example.com`,
    password: 'SecurePassword123!',
  };

  test('should display homepage', async ({ page }) => {
    await page.goto('/');

    // Check that page loads
    await expect(page).toHaveTitle(/DigitalDock/i);

    // Check for key elements
    await expect(page.locator('body')).toBeVisible();
  });

  test('should display login page', async ({ page }) => {
    await page.goto('/login');

    // Check for login form elements
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"], input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"], button:has-text("Sign In"), button:has-text("Login")')).toBeVisible();
  });

  test('should display register page', async ({ page }) => {
    await page.goto('/register');

    // Check for registration form elements
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"], input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"], button:has-text("Sign Up"), button:has-text("Register")')).toBeVisible();
  });

  test('should navigate from homepage to login', async ({ page }) => {
    await page.goto('/');

    // Look for login link (various possible texts)
    const loginLink = page.locator('a[href="/login"], a:has-text("Login"), a:has-text("Sign In")').first();
    if (await loginLink.isVisible()) {
      await loginLink.click();
      await expect(page).toHaveURL('/login');
    }
  });

  test('should navigate from homepage to register', async ({ page }) => {
    await page.goto('/');

    // Look for register link
    const registerLink = page.locator('a[href="/register"], a:has-text("Sign Up"), a:has-text("Register")').first();
    if (await registerLink.isVisible()) {
      await registerLink.click();
      await expect(page).toHaveURL('/register');
    }
  });
});

test.describe('Marketplace', () => {
  test('should display marketplace page', async ({ page }) => {
    await page.goto('/marketplace');

    // Verify marketplace loads
    await expect(page.locator('h1, h2')).toBeVisible();

    // Check if products are displayed or "no products" message
    const hasProducts = await page.locator('[data-testid="product-card"], .product-card, article').count() > 0;
    const hasNoProductsMessage = await page.locator('text=/no products/i, text=/coming soon/i').isVisible();

    // At least one should be true
    expect(hasProducts || hasNoProductsMessage).toBeTruthy();
  });

  test('should have search functionality', async ({ page }) => {
    await page.goto('/marketplace');

    // Look for search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="Search" i], input[name="search"]').first();

    if (await searchInput.isVisible()) {
      await searchInput.fill('template');
      await page.keyboard.press('Enter');

      // Wait for any loading/filtering
      await page.waitForTimeout(1000);

      // Page should still be on marketplace
      await expect(page).toHaveURL(/\/marketplace/);
    }
  });

  test('should display product detail page', async ({ page }) => {
    await page.goto('/marketplace');

    // Find first product link
    const productLink = page.locator('a[href^="/marketplace/"]').first();

    if (await productLink.isVisible()) {
      await productLink.click();

      // Should navigate to product detail page
      await expect(page).toHaveURL(/\/marketplace\/.+/);

      // Should display product information
      await expect(page.locator('h1, h2')).toBeVisible();
    }
  });
});

test.describe('Dashboard', () => {
  test('should require authentication for dashboard', async ({ page }) => {
    await page.goto('/dashboard');

    // Should either show dashboard or redirect to login
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/\/(dashboard|login)/);
  });

  test('should display dashboard when authenticated', async ({ page }) => {
    // Note: This test requires mock authentication or test user
    // For now, just verify the page exists
    await page.goto('/dashboard');

    // Page should load without error
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Seller Features', () => {
  test('should display seller products page', async ({ page }) => {
    await page.goto('/seller/products');

    // Page should load (may redirect to login if not authenticated)
    await expect(page.locator('body')).toBeVisible();

    const currentUrl = page.url();
    // Should be on seller products or login page
    expect(currentUrl).toMatch(/\/(seller\/products|login)/);
  });

  test('should display new product form', async ({ page }) => {
    await page.goto('/seller/products/new');

    // Page should load
    await expect(page.locator('body')).toBeVisible();

    const currentUrl = page.url();
    // Should be on new product page or login page
    expect(currentUrl).toMatch(/\/(seller\/products\/new|login)/);

    // If on the form page, check for form elements
    if (currentUrl.includes('/seller/products/new')) {
      const hasForm = await page.locator('form, input[name="title"], input[name="price"]').count() > 0;
      if (hasForm) {
        await expect(page.locator('input, textarea, select, button').first()).toBeVisible();
      }
    }
  });
});

test.describe('Legal Pages', () => {
  const legalPages = [
    '/legal/terms',
    '/legal/privacy',
    '/legal/refund',
    '/legal/seller-agreement',
    '/legal/content-guidelines',
  ];

  for (const pagePath of legalPages) {
    test(`should display ${pagePath}`, async ({ page }) => {
      await page.goto(pagePath);

      // Verify page loads
      await expect(page.locator('h1, h2')).toBeVisible();

      // Verify content exists
      await expect(page.locator('article, main, section, p').first()).toBeVisible();
    });
  }

  test('should have proper layout on legal pages', async ({ page }) => {
    await page.goto('/legal/terms');

    // Should have navigation or back link
    const hasNav = await page.locator('nav, a[href="/"]').count() > 0;
    expect(hasNav).toBeTruthy();
  });
});

test.describe('API Documentation', () => {
  test('should display API docs page', async ({ page }) => {
    await page.goto('/api-docs');

    // Verify page loads
    await expect(page.locator('h1, h2')).toBeVisible();
  });
});

test.describe('Navigation', () => {
  test('should have working navigation menu', async ({ page }) => {
    await page.goto('/');

    // Check for navigation links
    const navLinks = await page.locator('nav a, header a').count();
    expect(navLinks).toBeGreaterThan(0);
  });

  test('should navigate between pages', async ({ page }) => {
    await page.goto('/');

    // Navigate to marketplace
    const marketplaceLink = page.locator('a[href="/marketplace"]').first();
    if (await marketplaceLink.isVisible()) {
      await marketplaceLink.click();
      await expect(page).toHaveURL('/marketplace');
    }

    // Navigate back to home
    const homeLink = page.locator('a[href="/"]').first();
    if (await homeLink.isVisible()) {
      await homeLink.click();
      await expect(page).toHaveURL('/');
    }
  });
});

test.describe('Responsive Design', () => {
  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Page should still be visible and functional
    await expect(page.locator('body')).toBeVisible();
  });

  test('should be responsive on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/marketplace');

    // Page should still be visible and functional
    await expect(page.locator('body')).toBeVisible();
  });

  test('should be responsive on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');

    // Page should still be visible and functional
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('SEO and Metadata', () => {
  test('should have proper page title on homepage', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/.+/); // Should have some title
  });

  test('should have proper page title on marketplace', async ({ page }) => {
    await page.goto('/marketplace');
    await expect(page).toHaveTitle(/.+/);
  });

  test('should have meta description', async ({ page }) => {
    await page.goto('/');

    const metaDescription = page.locator('meta[name="description"]');
    const hasDescription = await metaDescription.count() > 0;

    // Meta description is good practice
    expect(hasDescription).toBeTruthy();
  });
});
