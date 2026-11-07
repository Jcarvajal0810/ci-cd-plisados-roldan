import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { OfferingDetail } from '../../core/api/models';
import { PublicApiClient } from '../../core/api/public-api.client';
import { BusinessProfileService } from '../../core/profile/business-profile.service';
import { OfferingDetailPage } from './offering-detail.page';

const PLISADO: OfferingDetail = {
  slug: 'plisado',
  name: 'Plisado',
  summary: 'Pliegues precisos',
  description: 'Realizamos plisado.',
  images: [],
};

async function render(
  offering: OfferingDetail | null,
): Promise<ComponentFixture<OfferingDetailPage>> {
  await TestBed.configureTestingModule({
    imports: [OfferingDetailPage],
    providers: [
      provideRouter([]),
      { provide: PublicApiClient, useValue: { offering: () => of(offering) } },
      {
        provide: BusinessProfileService,
        useValue: {
          whatsappNumber: () => '573116254705',
          genericWhatsappLink: () => 'https://wa.me/573116254705?text=hola',
        },
      },
    ],
  }).compileComponents();
  const fixture = TestBed.createComponent(OfferingDetailPage);
  fixture.componentRef.setInput('slug', 'plisado');
  await fixture.whenStable();
  fixture.detectChanges();
  return fixture;
}

const text = (fixture: ComponentFixture<unknown>) =>
  (fixture.nativeElement as HTMLElement).textContent?.replace(/\s/g, ' ') ?? '';

describe('OfferingDetailPage', () => {
  it('shows name and description', async () => {
    const fixture = await render(PLISADO);
    expect(text(fixture)).toContain('Plisado');
    expect(text(fixture)).toContain('Realizamos plisado.');
  });

  it('shows no price element when no reference price is set', async () => {
    const fixture = await render(PLISADO);
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('[data-testid="price"]'),
    ).toBeNull();
  });

  it('shows the reference price when set', async () => {
    const fixture = await render({ ...PLISADO, referencePriceCop: 120000 });
    const price = (fixture.nativeElement as HTMLElement).querySelector('[data-testid="price"]');
    expect(price?.textContent?.replace(/\s/g, ' ').trim()).toBe('Desde $ 120.000 COP');
  });

  it('links to WhatsApp with the offering message', async () => {
    const fixture = await render(PLISADO);
    const link = (fixture.nativeElement as HTMLElement).querySelector<HTMLAnchorElement>(
      'a[data-testid="offering-whatsapp"]',
    );
    expect(link?.getAttribute('href')).toBe(
      'https://wa.me/573116254705?text=' +
        encodeURIComponent('Hola, quiero cotizar el servicio de Plisado.'),
    );
    expect(link?.textContent).toContain('Cotizar por WhatsApp');
  });

  it('shows a placeholder named after the offering when there are no images', async () => {
    const fixture = await render(PLISADO);
    const placeholder = (fixture.nativeElement as HTMLElement).querySelector('[role="img"]');
    expect(placeholder?.getAttribute('aria-label')).toBe('Plisado');
  });

  it('shows the not-found content when the offering does not exist', async () => {
    const fixture = await render(null);
    expect(text(fixture)).toContain('Página no encontrada');
  });
});
