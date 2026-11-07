import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { SuccessCaseDetail } from '../../core/api/models';
import { PublicApiClient } from '../../core/api/public-api.client';
import { BusinessProfileService } from '../../core/profile/business-profile.service';
import { SuccessCaseDetailPage } from './success-case-detail.page';

const CASE: SuccessCaseDetail = {
  slug: 'pasarela-2026',
  title: 'Pasarela 2026',
  clientName: 'Marca Aliada',
  eventLabel: 'Colombiamoda',
  eventDate: '2026-07-20',
  description: 'Faldas plisadas para el desfile.',
  images: [],
  relatedOfferings: [{ slug: 'plisado', name: 'Plisado' }],
};

async function render(successCase: SuccessCaseDetail | null) {
  await TestBed.configureTestingModule({
    imports: [SuccessCaseDetailPage],
    providers: [
      provideRouter([]),
      { provide: PublicApiClient, useValue: { successCase: () => of(successCase) } },
      {
        provide: BusinessProfileService,
        useValue: {
          whatsappNumber: () => '573116254705',
          genericWhatsappLink: () => 'https://wa.me/573116254705?text=hola',
        },
      },
    ],
  }).compileComponents();
  const fixture = TestBed.createComponent(SuccessCaseDetailPage);
  fixture.componentRef.setInput('slug', 'pasarela-2026');
  await fixture.whenStable();
  fixture.detectChanges();
  return fixture.nativeElement as HTMLElement;
}

describe('SuccessCaseDetailPage', () => {
  it('shows title, client, event and description', async () => {
    const root = await render(CASE);
    const text = root.textContent ?? '';
    expect(text).toContain('Pasarela 2026');
    expect(text).toContain('Marca Aliada');
    expect(text).toContain('Colombiamoda');
    expect(text).toContain('Faldas plisadas para el desfile.');
    expect(root.querySelector('time')?.getAttribute('datetime')).toBe('2026-07-20');
  });

  it('links to the related offerings', async () => {
    const root = await render(CASE);
    expect(root.querySelector('a[href="/servicios/plisado"]')?.textContent).toContain('Plisado');
  });

  it('offers WhatsApp with the success case message', async () => {
    const root = await render(CASE);
    const link = root.querySelector('a[data-testid="case-whatsapp"]');
    expect(link?.getAttribute('href')).toBe(
      'https://wa.me/573116254705?text=' +
        encodeURIComponent('Hola, vi el caso "Pasarela 2026" y quiero algo similar.'),
    );
  });

  it('shows a placeholder when there are no photos', async () => {
    const root = await render(CASE);
    expect(root.querySelector('[role="img"]')?.getAttribute('aria-label')).toBe('Pasarela 2026');
  });

  it('shows the not-found content for unknown cases', async () => {
    const root = await render(null);
    expect(root.textContent).toContain('Página no encontrada');
  });
});
