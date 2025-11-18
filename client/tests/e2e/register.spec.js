import { test, expect } from '@playwright/test';

test.describe('Register Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Buscar cualquier enlace o botón de registro
    const registerLink = page.locator('text=Registrarse').or(page.locator('text=Registro')).or(page.locator('a[href*="register"]'));
    if (await registerLink.count() > 0) {
      await registerLink.first().click();
    } else {
      // Si no hay enlace directo, ir a la URL de registro
      await page.goto('/register');
    }
  });

  test('Registro completo de nuevo estudiante', async ({ page }) => {
    const timestamp = Date.now();
    
    await page.fill('input[name="nombre"]', 'Juan Pérez');
    await page.fill('input[name="email"]', `test${timestamp}@example.com`);
    await page.fill('input[name="password"]', 'password123');
    await page.selectOption('select[name="rol"]', 'estudiante');
    
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=exitoso')).toBeVisible({ timeout: 10000 });
  });

  test('Validación de campos obligatorios', async ({ page }) => {
    await page.click('button[type="submit"]');
    
    // Verificar que aparezcan mensajes de error o validación
    await expect(page.locator('text=requerido').or(page.locator('text=obligatorio')).or(page.locator('.error'))).toBeVisible();
  });

  test('Email duplicado muestra error', async ({ page }) => {
    await page.fill('input[name="nombre"]', 'Test User');
    await page.fill('input[name="email"]', 'test@example.com'); // Email que ya existe
    await page.fill('input[name="password"]', 'password123');
    await page.selectOption('select[name="rol"]', 'estudiante');
    
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=existe').or(page.locator('text=duplicado')).or(page.locator('.error'))).toBeVisible();
  });
});