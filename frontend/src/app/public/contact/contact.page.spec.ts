import { computed, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BusinessProfile } from '../../core/api/models';
import { BusinessProfileService } from '../../core/profile/business-profile.service';
import { SeoService } from '../../core/seo/seo.service';
import { ContactPage } from './contact.page';

const profile: BusinessProfile = {
  businessName: 'Plisados Roldán',
  slogan: 'Plisados a mano',
  aboutText: 'Desde 1980.',
  whatsappNumber: '573116254705',
  locationText: 'Medellín',
  scheduleText: 'Lunes a viernes',
};

async function render(stored: BusinessProfile | null) {
  const current = signal(stored);
  const profileService = {
    profile: current,
    whatsappNumber: computed(() => current()?.whatsappNumber ?? ''),
    genericWhatsappLink: computed(() => 'https://wa.me/' + (current()?.whatsappNumber ?? '')),
  };
  const seo = { update: vi.fn() };
  await TestBed.configureTestingModule({
    imports: [ContactPage],
    providers: [
      { provide: BusinessProfileService, useValue: profileService },
      { provide: SeoService, useValue: seo },
    ],
  }).compileComponents();
  const fixture = TestBed.createComponent(ContactPage);
  fixture.detectChanges();
  await fixture.whenStable();
  return { fixture, el: fixture.nativeElement as HTMLElement, seo };
}

describe('ContactPage', () => {
  afterEach(() => vi.useRealTimers());

  it('shows phone, location and schedule from the profile', async () => {
    const { el } = await render(profile);

    expect(el.textContent).toContain('+573116254705');
    expect(el.textContent).toContain('Medellín');
    expect(el.textContent).toContain('Lunes a viernes');
    expect(el.querySelector<HTMLAnchorElement>('a[href^="tel:"]')?.href).toContain(
      'tel:+573116254705',
    );
  });

  it('links to the map with the business name and location', async () => {
    const { el } = await render(profile);

    const map = el.querySelector<HTMLAnchorElement>('a[href*="google.com/maps"]')!;
    expect(decodeURIComponent(map.href)).toContain('Plisados Roldán Medellín');
  });

  it('builds the quick WhatsApp messages with the business number', async () => {
    const { el } = await render(profile);

    const links = Array.from(el.querySelectorAll<HTMLAnchorElement>('a[href*="wa.me"]'));
    expect(links.length).toBeGreaterThan(1);
    expect(links.every((a) => a.href.includes('573116254705'))).toBe(true);
  });

  it('updates the SEO tags once the profile is known', async () => {
    const { seo } = await render(profile);

    expect(seo.update).toHaveBeenCalledWith(
      expect.objectContaining({ description: expect.stringContaining('Medellín') }),
    );
  });

  it('hides the contact cards while there is no profile', async () => {
    const { el, seo } = await render(null);

    expect(el.querySelector('[aria-label="Datos de contacto"]')).toBeNull();
    expect(seo.update).not.toHaveBeenCalled();
  });

  it('copies the number and confirms for a moment', async () => {
    const writeText = vi.fn(() => Promise.resolve());
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    const { el, fixture } = await render(profile);
    vi.useFakeTimers();
    const button = Array.from(el.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Copiar'),
    )!;

    button.click();
    await Promise.resolve();
    fixture.detectChanges();

    expect(writeText).toHaveBeenCalledWith('+573116254705');
    expect(button.textContent).toContain('¡Copiado!');

    vi.advanceTimersByTime(2000);
    fixture.detectChanges();
    expect(button.textContent).toContain('Copiar');
  });
});
