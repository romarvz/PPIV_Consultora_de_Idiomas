import { test, expect } from '@playwright/test';

test.describe('Connectivity Tests', () => {
  test('Backend está disponible', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Iniciar Sesión');
    
    // Verificar que NO aparezca "Error de conexión"
    const errorMessage = page.locator('text=Error de conexión');
    await expect(errorMessage).not.toBeVisible({ timeout: 5000 });
  });

  test('Login con admin funciona', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Iniciar Sesión');
    
    await page.fill('#email', 'admin@consultora.com');
    await page.fill('#password', 'Admin123!');
    await page.click('button:has-text("Ingresar")');
    
    // Esperar a que desaparezca el botón de "Ingresando..."
    await expect(page.locator('button:has-text("Ingresando...")')).not.toBeVisible({ timeout: 10000 });
    
    // Verificar que estamos en dashboard o que el login fue exitoso
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 });
  });
});