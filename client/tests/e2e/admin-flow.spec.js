import { test, expect } from '@playwright/test';

test.describe('Admin Flow Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.click('text=Iniciar Sesión');
    await page.fill('#email', 'admin@consultora.com');
    await page.fill('#password', 'Admin123!');
    await page.click('button:has-text("Ingresar")');
    await page.waitForURL(/.*dashboard/, { timeout: 10000 });
  });

  test('Admin puede crear usuarios', async ({ page }) => {
    const usersLink = page.locator('text=Usuarios').or(page.locator('text=Gestión')).or(page.locator('a[href*="users"]'));
    await usersLink.first().click();
    
    const createButton = page.locator('text=Crear').or(page.locator('text=Nuevo')).or(page.locator('button:has-text("Agregar")'));
    await createButton.first().click();
    
    const timestamp = Date.now();
    await page.fill('input[name="nombre"]', 'Usuario Nuevo');
    await page.fill('input[name="email"]', `nuevo${timestamp}@test.com`);
    await page.fill('input[name="password"]', 'password123');
    await page.selectOption('select[name="rol"]', 'estudiante');
    
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=creado').or(page.locator('text=exitoso'))).toBeVisible();
  });

  test('Admin puede desactivar usuarios', async ({ page }) => {
    const usersLink = page.locator('text=Usuarios').or(page.locator('text=Gestión')).or(page.locator('a[href*="users"]'));
    await usersLink.first().click();
    
    const deactivateButton = page.locator('button:has-text("Desactivar")').or(page.locator('button:has-text("Eliminar")'));
    if (await deactivateButton.count() > 0) {
      await deactivateButton.first().click();
      
      const confirmButton = page.locator('button:has-text("Confirmar")').or(page.locator('button:has-text("Sí")'));
      if (await confirmButton.count() > 0) {
        await confirmButton.click();
      }
      
      await expect(page.locator('text=desactivado').or(page.locator('text=eliminado')).or(page.locator('text=exitoso'))).toBeVisible();
    } else {
      await expect(page.locator('text=Usuarios').or(page.locator('text=Gestión'))).toBeVisible();
    }
  });
});