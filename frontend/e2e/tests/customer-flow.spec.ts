import { expect, test } from '@playwright/test';
import { ADMIN_EMAIL, ADMIN_PASSWORD } from './admin-credentials';

/**
 * US1 — a prospective client understands the business and contacts it on WhatsApp.
 * Acceptance scenarios 1–5 (spec.md). Runs against seed content.
 */
const WHATSAPP = 'https://wa.me/573116254705?text=';

test('home shows who the business is, its services and a WhatsApp button', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1 })).toContainText('Plisados Roldán');
  await expect(page.getByText('Creando ando, soñando alto')).toBeVisible();
  const services = page.getByRole('list', { name: 'Servicios' }).getByRole('listitem');
  await expect(services).toHaveCount(6);
  await expect(page.getByRole('link', { name: /WhatsApp/ }).first()).toBeVisible();
});

test('a visitor reaches WhatsApp about a specific service in three taps', async ({ page }) => {
  await page.goto('/');

  // Tap 1: open the service from the home page.
  await page.getByRole('link', { name: 'Plisado', exact: true }).click();
  await expect(page).toHaveURL(/\/servicios\/plisado$/);

  await expect(page.getByRole('heading', { level: 1, name: 'Plisado' })).toBeVisible();
  await expect(page.getByText('Desde $')).toHaveCount(0);

  // Tap 2: the "Cotizar por WhatsApp" link carries the service name.
  const cta = page.getByRole('link', { name: 'Cotizar por WhatsApp' });
  await expect(cta).toHaveAttribute(
    'href',
    WHATSAPP + encodeURIComponent('Hola, quiero cotizar el servicio de Plisado.'),
  );
  await expect(cta).toHaveAttribute('target', '_blank');
});

test('a service without photos shows a placeholder', async ({ page }) => {
  // Seed services have photos, so publish a temporary one without any (deleted at the end).
  const name = `Sin fotos ${Date.now()}`;
  await page.goto('/admin/login');
  await page.getByLabel('Correo').fill(ADMIN_EMAIL);
  await page.getByLabel('Contraseña').fill(ADMIN_PASSWORD);
  await page.getByRole('button', { name: 'Ingresar' }).click();
  await expect(page.getByRole('heading', { name: 'Panel' })).toBeVisible();
  await page.getByRole('link', { name: 'Servicios' }).first().click();
  await page.getByRole('link', { name: 'Nuevo servicio' }).click();
  await page.getByLabel('Nombre').fill(name);
  await page.getByLabel('Resumen').fill('Servicio temporal de prueba');
  await page.getByLabel('Descripción').fill('Servicio temporal sin fotos.');
  await page.getByRole('button', { name: 'Guardar' }).click();
  await expect(page.getByRole('status')).toContainText('Guardado');
  await page.getByRole('button', { name: 'Publicar' }).click();
  // Publishing without photos asks first.
  await page.getByRole('alertdialog').getByRole('button', { name: 'Publicar' }).click();
  await expect(page.getByRole('status')).toContainText('Publicado');

  await page.goto('/servicios');
  await page.getByRole('link', { name, exact: true }).click();
  await expect(page.getByRole('img', { name })).toBeVisible();

  await page.goto('/admin/servicios');
  await page.getByRole('button', { name: `Eliminar ${name}` }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Eliminar' }).click();
  await expect(page.getByText(name)).toHaveCount(0);
});

for (const path of ['/', '/servicios', '/servicios/plisado', '/nosotros', '/contacto']) {
  test(`floating WhatsApp button stays reachable on ${path}`, async ({ page }) => {
    await page.goto(path);
    await page.mouse.wheel(0, 4000);
    const floating = page.getByRole('link', { name: 'Escríbenos por WhatsApp' }).last();
    await expect(floating).toBeVisible();
    await expect(floating).toHaveAttribute(
      'href',
      WHATSAPP +
        encodeURIComponent('Hola, Plisados Roldán. Quiero más información sobre sus servicios.'),
    );
  });
}

test('an unknown address shows the not-found page', async ({ page }) => {
  await page.goto('/esto-no-existe');
  await expect(page.getByRole('heading', { name: 'Página no encontrada' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Ver servicios' })).toHaveAttribute('href', '/servicios');
});
