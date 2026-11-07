import { expect, test, type APIRequestContext } from '@playwright/test';

/**
 * US5 — findability. Pages are fetched WITHOUT running JavaScript (Playwright's request API),
 * exactly as a crawler or a link-preview bot sees them (FR-010, FR-011, contracts/ui-routes.md).
 */
const PAGES: { path: string; title: string; text: string }[] = [
  { path: '/', title: 'Plisados Roldán · Plisado, trillado y corte láser en Itagüí', text: 'Creando ando, soñando alto' },
  { path: '/nosotros', title: 'Nosotros · Plisados Roldán', text: 'microempresa de procesos textiles' },
  { path: '/servicios', title: 'Servicios · Plisados Roldán', text: 'Craquelado' },
  { path: '/servicios/plisado', title: 'Plisado · Plisados Roldán', text: 'Pliegues precisos' },
  { path: '/contacto', title: 'Contacto · Plisados Roldán', text: 'Itagüí, Antioquia, Colombia' },
];

async function html(request: APIRequestContext, path: string) {
  const response = await request.get(path);
  return { status: response.status(), body: await response.text() };
}

const metaContent = (body: string, attr: string) =>
  body.match(new RegExp(`<meta[^>]*${attr}[^>]*content="([^"]*)"`))?.[1] ??
  body.match(new RegExp(`<meta[^>]*content="([^"]*)"[^>]*${attr}`))?.[1];

for (const page of PAGES) {
  test(`${page.path} is complete without JavaScript`, async ({ request }) => {
    const { status, body } = await html(request, page.path);

    expect(status).toBe(200);
    expect(body).toContain(page.text);
    expect(body).toContain(`<title>${page.title}</title>`);
    expect(metaContent(body, 'name="description"')?.length).toBeGreaterThan(20);
    expect(body).toMatch(/<link[^>]*rel="canonical"[^>]*href="http[^"]*"/);
    expect(metaContent(body, 'property="og:title"')).toBe(page.title);
    expect(metaContent(body, 'property="og:description"')).toBeTruthy();
    expect(metaContent(body, 'property="og:image"')).toMatch(/^https?:\/\//);
    expect(metaContent(body, 'property="og:url"')).toMatch(new RegExp(`${page.path}$`));
  });
}

test('unknown and unpublished addresses return HTTP 404', async ({ request }) => {
  expect((await html(request, '/servicios/no-existe')).status).toBe(404);
  expect((await html(request, '/casos-de-exito/no-existe')).status).toBe(404);
  expect((await html(request, '/esto-no-existe')).status).toBe(404);
});

test('the sitemap lists every published page', async ({ request }) => {
  const { status, body } = await html(request, '/sitemap.xml');
  expect(status).toBe(200);
  for (const path of ['/', '/nosotros', '/servicios', '/contacto', '/servicios/plisado', '/servicios/linea-plissee']) {
    expect(body).toMatch(new RegExp(`<loc>https?://[^<]*${path.replace('/', '\\/')}</loc>`));
  }
});

test('robots.txt keeps the admin out and points to the sitemap', async ({ request }) => {
  const { status, body } = await html(request, '/robots.txt');
  expect(status).toBe(200);
  expect(body).toContain('Disallow: /admin');
  expect(body).toMatch(/Sitemap: https?:\/\/.*\/sitemap\.xml/);
});
