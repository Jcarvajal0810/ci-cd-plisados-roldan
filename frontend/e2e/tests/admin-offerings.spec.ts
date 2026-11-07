import { expect, test, type Page } from '@playwright/test';
import { ADMIN_EMAIL, ADMIN_PASSWORD } from './admin-credentials';
import { fileURLToPath } from 'node:url';

/**
 * US2 — the owner manages services and business information. Needs the backend started with
 * ADMIN_EMAIL / ADMIN_PASSWORD (defaults below match the dev .env).
 */

const PHOTO = fileURLToPath(new URL('../fixtures/pliegues.jpg', import.meta.url));

test.describe.configure({ mode: 'serial' });

async function login(page: Page) {
  await page.goto('/admin/login');
  await page.getByLabel('Correo').fill(ADMIN_EMAIL);
  await page.getByLabel('Contraseña').fill(ADMIN_PASSWORD);
  await page.getByRole('button', { name: 'Ingresar' }).click();
  await expect(page.getByRole('heading', { name: 'Panel' })).toBeVisible();
}

test('admin pages redirect to login when not authenticated', async ({ page }) => {
  await page.goto('/admin/servicios');
  await expect(page).toHaveURL(/\/admin\/login\?returnUrl=%2Fadmin%2Fservicios/);
});

test('repeated wrong passwords are throttled', async ({ page }) => {
  await page.goto('/admin/login');
  const email = `intruso-${Date.now()}@example.com`;
  for (let i = 0; i < 5; i++) {
    await page.getByLabel('Correo').fill(email);
    await page.getByLabel('Contraseña').fill('incorrecta');
    await page.getByRole('button', { name: 'Ingresar' }).click();
    await expect(page.getByRole('alert')).toContainText('Correo o contraseña incorrectos');
  }
  await page.getByRole('button', { name: 'Ingresar' }).click();
  await expect(page.getByRole('alert')).toContainText('Demasiados intentos, intenta en 15 minutos');
});

test('the owner creates, publishes and unpublishes a service with photos', async ({ page }) => {
  const name = `Plisado acordeón ${Date.now()}`;
  await login(page);

  await page.getByRole('link', { name: 'Servicios' }).first().click();
  await page.getByRole('link', { name: 'Nuevo servicio' }).click();
  await page.getByLabel('Nombre').fill(name);
  await page.getByLabel('Resumen').fill('Pliegues en abanico');
  await page.getByLabel('Descripción').fill('Plisado tipo acordeón para faldas y vestidos.');
  await page.getByRole('button', { name: 'Guardar' }).click();
  await expect(page.getByRole('status')).toContainText('Guardado');

  const photos = page.getByRole('list', { name: 'Fotos' }).getByRole('listitem');
  for (let count = 1; count <= 3; count++) {
    await page.getByLabel('Agregar foto').setInputFiles(PHOTO);
    await expect(photos).toHaveCount(count);
  }

  await page.getByRole('button', { name: 'Publicar' }).click();
  await expect(page.getByRole('status')).toContainText('Publicado');

  await page.goto('/servicios');
  const cards = page.getByRole('list', { name: 'Servicios' }).getByRole('listitem');
  await expect(cards.last()).toContainText(name);

  await page.goto('/admin/servicios');
  await page.getByRole('button', { name: `Despublicar ${name}` }).click();
  await page.goto('/servicios');
  await expect(page.getByText(name)).toHaveCount(0);

  await page.goto('/admin/servicios');
  await expect(page.getByText(name)).toBeVisible();
  await page.getByRole('button', { name: `Eliminar ${name}` }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Eliminar' }).click();
  await expect(page.getByText(name)).toHaveCount(0);
});

test('profile edits reach the public site and every WhatsApp link', async ({ page }) => {
  await login(page);
  await page.getByRole('link', { name: 'Perfil', exact: true }).click();

  const number = page.getByLabel('Número de WhatsApp');
  const about = page.getByLabel('Nosotros');
  // The form fills in asynchronously; read the originals only once they are there.
  await expect(number).not.toHaveValue('');
  const originalNumber = await number.inputValue();
  const originalAbout = await about.inputValue();

  await number.fill('573001112233');
  await about.fill('Texto de prueba e2e.');
  await page.getByRole('button', { name: 'Guardar' }).click();
  await expect(page.getByRole('status')).toContainText('Guardado');

  await page.goto('/nosotros');
  await expect(page.getByText('Texto de prueba e2e.')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Escríbenos por WhatsApp' }).first()).toHaveAttribute(
    'href',
    /wa\.me\/573001112233/,
  );

  // Restore the seed values so other suites keep working.
  await page.goto('/admin/perfil');
  await expect(page.getByLabel('Número de WhatsApp')).toHaveValue('573001112233');
  await page.getByLabel('Número de WhatsApp').fill(originalNumber);
  await page.getByLabel('Nosotros').fill(originalAbout);
  await page.getByRole('button', { name: 'Guardar' }).click();
  await expect(page.getByRole('status')).toContainText('Guardado');
});
