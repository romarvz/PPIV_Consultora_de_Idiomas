import { test, expect } from '@playwright/test';

test.describe('Profile Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.click('text=Iniciar Sesión');
    await page.fill('#email', 'carlos.rodriguez@email.com');
    await page.fill('#password', '12345678');
    await page.click('button:has-text("Ingresar")');
    await page.waitForURL(/.*dashboard/, { timeout: 10000 });
  });

  test('Ver perfil de usuario logueado', async ({ page }) => {
    const profileLink = page.locator('text=Perfil').or(page.locator('text=Mi Perfil')).or(page.locator('a[href*="profile"]'));
    await profileLink.first().click();
    
    await expect(page.locator('h1').or(page.locator('h2')).filter({ hasText: /perfil/i })).toBeVisible();
    await expect(page.locator('input[name="nombre"]').or(page.locator('input[name="firstName"]'))).toBeVisible();
  });

  test('Editar información del perfil', async ({ page }) => {
    const profileLink = page.locator('text=Perfil').or(page.locator('text=Mi Perfil')).or(page.locator('a[href*="profile"]'));
    await profileLink.first().click();
    
    const nameInput = page.locator('input[name="nombre"]').or(page.locator('input[name="firstName"]'));
    await nameInput.fill('Nombre Actualizado');
    
    await expect(nameInput).toHaveValue('Nombre Actualizado');
  });

  test('Guardar cambios exitosamente', async ({ page }) => {
    const profileLink = page.locator('text=Perfil').or(page.locator('text=Mi Perfil')).or(page.locator('a[href*="profile"]'));
    await profileLink.first().click();
    
    const nameInput = page.locator('input[name="nombre"]').or(page.locator('input[name="firstName"]'));
    await nameInput.fill('Nuevo Nombre');
    
    const saveButton = page.locator('button:has-text("Guardar")').or(page.locator('button[type="submit"]'));
    await saveButton.click();
    
    await expect(page.locator('text=actualizado').or(page.locator('text=guardado')).or(page.locator('text=exitoso'))).toBeVisible();
  });
});