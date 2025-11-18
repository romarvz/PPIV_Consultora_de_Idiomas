import { test, expect } from '@playwright/test';

test.describe('Simple Tests', () => {
  test('La aplicación carga correctamente', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Lingua Academy')).toBeVisible();
  });

  test('Página de login es accesible', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Iniciar Sesión');
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
  });

  test('Backend está conectado', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Iniciar Sesión');
    
    // Verificar que NO aparezca "Error de conexión"
    const errorMessage = page.locator('text=Error de conexión');
    await expect(errorMessage).not.toBeVisible();
  });
});