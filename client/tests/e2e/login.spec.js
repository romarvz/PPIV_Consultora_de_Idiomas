import { test, expect } from '@playwright/test';

test.describe('Login Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.click('text=Iniciar Sesión');
  });

  test('Login exitoso con credenciales válidas', async ({ page }) => {
    await page.fill('#email', 'admin@consultora.com');
    await page.fill('#password', 'Admin123!');
    await page.click('button:has-text("Ingresar")');
    
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 });
  });

  test('Login fallido con password incorrecta', async ({ page }) => {
    await page.fill('#email', 'admin@consultora.com');
    await page.fill('#password', 'wrongpassword');
    await page.click('button:has-text("Ingresar")');
    
    await expect(page.locator('div:has-text("Error")')).toBeVisible();
  });

  test('Mensaje de error visible', async ({ page }) => {
    await page.fill('#email', 'invalid@email.com');
    await page.fill('#password', 'wrongpass');
    await page.click('button:has-text("Ingresar")');
    
    await expect(page.locator('div:has-text("Error")')).toBeVisible();
  });

  test('Redirección después de login', async ({ page }) => {
    await page.fill('#email', 'carlos.rodriguez@email.com');
    await page.fill('#password', '12345678');
    await page.click('button:has-text("Ingresar")');
    
    await page.waitForURL(/.*dashboard/, { timeout: 10000 });
    expect(page.url()).toContain('dashboard');
  });
});