import { test, expect } from '@playwright/test';

test.describe('Smoke Test - PLYAZ League Manager', () => {
  test('should load the landing page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/PLYAZ/i);
    await expect(page.getByText('The ultimate platform for league organizers')).toBeVisible();
  });

  test('should navigate to pricing page', async ({ page }) => {
    await page.goto('/pricing');
    await expect(page.getByText('Choose your plan')).toBeVisible();
  });

  test('should show login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /Welcome Back/i })).toBeVisible();
  });
});
