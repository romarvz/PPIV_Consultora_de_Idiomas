import { test, expect } from '@playwright/test';

test.describe('Debug Login', () => {
  test('Debug login step by step', async ({ page }) => {
    // Ir a la página de login
    await page.goto('/');
    await page.click('text=Iniciar Sesión');
    
    // Verificar que NO hay error de conexión
    await expect(page.locator('text=Error de conexión')).not.toBeVisible();
    
    // Llenar credenciales
    await page.fill('#email', 'admin@consultora.com');
    await page.fill('#password', 'Admin123!');
    
    // Hacer click en ingresar
    await page.click('button:has-text("Ingresar")');
    
    // Esperar a que cambie el botón
    await expect(page.locator('button:has-text("Ingresando...")')).toBeVisible();
    
    // Esperar a que termine el loading
    await expect(page.locator('button:has-text("Ingresando...")')).not.toBeVisible({ timeout: 10000 });
    
    // Verificar URL actual después del login
    console.log('URL después del login:', page.url());
    
    // Verificar localStorage
    const token = await page.evaluate(() => localStorage.getItem('token'));
    const user = await page.evaluate(() => localStorage.getItem('user'));
    
    console.log('Token guardado:', !!token);
    console.log('User guardado:', !!user);
    
    if (user) {
      const userData = await page.evaluate(() => JSON.parse(localStorage.getItem('user')));
      console.log('User role:', userData?.role);
    }
    
    // Verificar si hay redirección al dashboard
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 5000 });
  });
});