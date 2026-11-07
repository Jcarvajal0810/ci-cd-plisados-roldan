import { expect, test, type Page } from '@playwright/test';
import { ADMIN_EMAIL, ADMIN_PASSWORD } from './admin-credentials';
import { fileURLToPath } from 'node:url';

/**
 * US3 + US4 — success cases and testimonials, managed by the owner and shown to visitors.
 * Assumes the database has no published success cases or testimonials when it starts
 * (the suite deletes everything it creates).
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

const mainNav = (page: Page) => page.getByRole('navigation', { name: 'Principal' });

test('empty sections are hidden', async ({ page }) => {
  await page.goto('/');
  await expect(mainNav(page).getByRole('link', { name: 'Servicios' })).toBeVisible();
  await expect(mainNav(page).getByRole('link', { name: 'Casos de éxito' })).toHaveCount(0);
  await expect(mainNav(page).getByRole('link', { name: 'Testimonios' })).toHaveCount(0);
});

test('a featured case and testimonial reach the home page, then go away', async ({ page }) => {
  const stamp = Date.now();
  const title = `Pasarela e2e ${stamp}`;
  const client = `Laura e2e ${stamp}`;
  const quote = `Los plisados quedaron perfectos (${stamp}).`;
  await login(page);

  // Success case with two photos and a related service.
  await page.getByRole('link', { name: 'Casos', exact: true }).click();
  await page.getByRole('link', { name: 'Nuevo caso' }).click();
  await page.getByLabel('Título').fill(title);
  await page.getByLabel('Cliente o marca').fill('Marca Aliada');
  await page.getByLabel('Descripción').fill('Faldas plisadas para el desfile.');
  await page.getByLabel('Destacar en la página de inicio').check();
  await page.getByLabel('Plisado', { exact: true }).check();
  await page.getByRole('button', { name: 'Guardar' }).click();
  await expect(page.getByRole('status')).toContainText('Guardado');
  const photos = page.getByRole('list', { name: 'Fotos' }).getByRole('listitem');
  for (let count = 1; count <= 2; count++) {
    await page.getByLabel('Agregar foto').setInputFiles(PHOTO);
    await expect(photos).toHaveCount(count);
  }
  await page.getByRole('button', { name: 'Publicar' }).click();
  await expect(page.getByRole('status')).toContainText('Publicado');

  // Testimonial.
  await page.getByRole('link', { name: 'Testimonios', exact: true }).click();
  await page.getByRole('link', { name: 'Nuevo testimonio' }).click();
  await page.getByLabel('Nombre del cliente').fill(client);
  await page.getByLabel('Testimonio').fill(quote);
  await page.getByLabel('Destacar en la página de inicio').check();
  await page.getByRole('button', { name: 'Guardar' }).click();
  await expect(page.getByRole('status')).toContainText('Guardado');
  await page.getByRole('button', { name: 'Publicar' }).click();
  await expect(page.getByRole('status')).toContainText('Publicado');

  // Visitors see both, and the case offers WhatsApp with its own message.
  await page.goto('/');
  await expect(page.getByText(title)).toBeVisible();
  await expect(page.getByText(quote)).toBeVisible();
  await expect(mainNav(page).getByRole('link', { name: 'Casos de éxito' })).toBeVisible();
  await page.getByRole('link', { name: title }).click();
  await expect(page.getByRole('link', { name: 'Cotizar por WhatsApp' })).toHaveAttribute(
    'href',
    /wa\.me\/\d+\?text=/,
  );
  const href = await page.getByRole('link', { name: 'Cotizar por WhatsApp' }).getAttribute('href');
  expect(decodeURIComponent(href!.split('text=')[1])).toBe(
    `Hola, vi el caso "${title}" y quiero algo similar.`,
  );
  await expect(page.getByRole('link', { name: 'Plisado' }).last()).toHaveAttribute(
    'href',
    '/servicios/plisado',
  );

  // Delete the testimonial (with confirmation): it disappears everywhere.
  await page.goto('/admin/testimonios');
  await page.getByRole('button', { name: `Eliminar ${client}` }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Eliminar' }).click();
  await expect(page.getByText(client)).toHaveCount(0);
  await page.goto('/');
  await expect(page.getByText(quote)).toHaveCount(0);
  await page.goto('/testimonios');
  await expect(page.getByText(client)).toHaveCount(0);

  // Clean up the case too.
  await page.goto('/admin/casos');
  await page.getByRole('button', { name: `Eliminar ${title}` }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Eliminar' }).click();
  await expect(page.getByText(title)).toHaveCount(0);
});
