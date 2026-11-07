import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

/** SC-007: public pages meet WCAG 2.1 AA (automated audit) and work with the keyboard. */
const PUBLIC_PAGES = [
  '/',
  '/nosotros',
  '/servicios',
  '/servicios/plisado',
  '/contacto',
  '/esto-no-existe',
];

for (const path of PUBLIC_PAGES) {
  test(`${path} has no serious or critical accessibility violations`, async ({ page }) => {
    await page.goto(path);
    await page.getByRole('heading', { level: 1 }).first().waitFor();

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    const blocking = results.violations.filter(
      (v) => v.impact === 'serious' || v.impact === 'critical',
    );

    expect(
      blocking.map((v) => `${v.id}: ${v.help} (${v.nodes.map((n) => n.target).join(', ')})`),
    ).toEqual([]);
  });
}

test('the WhatsApp button is reachable with the keyboard alone', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('heading', { level: 1 }).waitFor();

  for (let i = 0; i < 40; i++) {
    await page.keyboard.press('Tab');
    const focused = await page.evaluate(() => {
      const el = document.activeElement as HTMLAnchorElement | null;
      return el?.href ?? '';
    });
    if (focused.startsWith('https://wa.me/')) {
      return;
    }
  }
  throw new Error('No WhatsApp link received keyboard focus within 40 Tab presses');
});

test('the skip link moves focus to the main content', async ({ page }) => {
  await page.goto('/servicios');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Saltar al contenido' })).toBeFocused();
});
