// frontend/e2e/tests/smoke.spec.ts — pruebas de humo: rapidas y de SOLO LECTURA (seguras en produccion)
import { expect, test } from '@playwright/test';

const EXPECTED_VERSION = process.env['EXPECTED_VERSION'];

test.describe('@smoke', () => {
  test('la pagina de inicio carga con el boton de WhatsApp', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
    await expect(page.locator('a[href*="wa.me"], a[href*="whatsapp"]').first()).toBeVisible();
  });

  test('la API publica y el sitemap responden', async ({ request }) => {
    const offerings = await request.get('/api/public/offerings');
    expect(offerings.status()).toBe(200);
    expect(Array.isArray(await offerings.json())).toBe(true);
    expect((await request.get('/sitemap.xml')).status()).toBe(200);
  });

  test('web y api estan sanos y sirven la version desplegada', async ({ request }) => {
    for (const path of ['/health', '/api/public/health']) {
      const response = await request.get(path);
      expect(response.status(), path).toBe(200);
      const body = await response.json();
      expect(body.status, path).toBe('ok');
      if (EXPECTED_VERSION) {
        expect(body.version, path).toBe(EXPECTED_VERSION);
      }
    }
  });

  test('control de demostracion del rollback (FORCE_SMOKE_FAIL)', () => {
    expect(process.env['FORCE_SMOKE_FAIL'], 'fallo forzado para demostrar el rollback').not.toBe('true');
  });
});

