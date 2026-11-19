import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BusinessProfile } from '../../core/api/models';
import { BusinessProfileService } from '../../core/profile/business-profile.service';
import { SeoService } from '../../core/seo/seo.service';
import { AboutPage } from './about.page';

async function render(aboutText: string | null) {
  const profile = signal<BusinessProfile | null>(
    aboutText === null
      ? null
      : {
          businessName: 'Plisados Roldán',
          slogan: 's',
          aboutText,
          whatsappNumber: '573116254705',
          locationText: 'Medellín',
          scheduleText: 'L-V',
        },
  );
  const seo = { update: vi.fn() };
  await TestBed.configureTestingModule({
    imports: [AboutPage],
    providers: [
      { provide: BusinessProfileService, useValue: { profile } },
      { provide: SeoService, useValue: seo },
    ],
  }).compileComponents();
  const fixture = TestBed.createComponent(AboutPage);
  fixture.detectChanges();
  await fixture.whenStable();
  return { el: fixture.nativeElement as HTMLElement, seo };
}

describe('AboutPage', () => {
  it('splits the owner text into paragraphs on blank lines', async () => {
    const { el } = await render('Primer párrafo.\n\n  Segundo párrafo.  \n \n\n');

    const texts = Array.from(el.querySelectorAll('p')).map((p) => p.textContent?.trim());
    expect(texts).toContain('Primer párrafo.');
    expect(texts).toContain('Segundo párrafo.');
  });

  it('updates the SEO tags with the about text', async () => {
    const { seo } = await render('Desde 1980.');

    expect(seo.update).toHaveBeenCalledWith(
      expect.objectContaining({ path: '/nosotros', description: 'Desde 1980.' }),
    );
  });

  it('does not touch the SEO tags while the profile is loading', async () => {
    const { seo } = await render(null);

    expect(seo.update).not.toHaveBeenCalled();
  });
});
