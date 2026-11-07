import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { HomeView } from '../../core/api/models';
import { PublicApiClient } from '../../core/api/public-api.client';
import { SiteSectionsService } from '../../core/content/site-sections.service';
import { BusinessProfileService } from '../../core/profile/business-profile.service';
import { HomePage } from '../home/home.page';
import { PublicLayoutComponent } from './public-layout.component';

const profileService = {
  profile: signal(null),
  whatsappNumber: () => '573116254705',
  genericWhatsappLink: () => 'https://wa.me/573116254705?text=hola',
};

function sections(hasSuccessCases: boolean, hasTestimonials: boolean) {
  return {
    hasSuccessCases: signal(hasSuccessCases),
    hasTestimonials: signal(hasTestimonials),
  };
}

const navLabels = (root: HTMLElement) =>
  Array.from(root.querySelectorAll('nav[aria-label="Principal"] a')).map((a) =>
    a.textContent?.trim(),
  );

describe('public navigation (US3)', () => {
  async function renderLayout(hasCases: boolean, hasTestimonials: boolean) {
    await TestBed.configureTestingModule({
      imports: [PublicLayoutComponent],
      providers: [
        provideRouter([]),
        { provide: BusinessProfileService, useValue: profileService },
        { provide: SiteSectionsService, useValue: sections(hasCases, hasTestimonials) },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(PublicLayoutComponent);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('hides "Casos de éxito" and "Testimonios" when there is nothing published', async () => {
    const root = await renderLayout(false, false);
    expect(navLabels(root)).toEqual(['Inicio', 'Nosotros', 'Servicios', 'Contacto']);
  });

  it('shows them when there is published content', async () => {
    const root = await renderLayout(true, true);
    expect(navLabels(root)).toEqual([
      'Inicio',
      'Nosotros',
      'Servicios',
      'Casos de éxito',
      'Testimonios',
      'Contacto',
    ]);
  });
});

describe('home page sections (US3)', () => {
  const baseHome: HomeView = {
    profile: {
      businessName: 'Plisados Roldán',
      slogan: 'Creando ando, soñando alto',
      aboutText: '',
      whatsappNumber: '573116254705',
      locationText: 'Itagüí',
      scheduleText: '',
    },
    offerings: [],
    featuredSuccessCases: [],
    featuredTestimonials: [],
  };

  async function renderHome(home: HomeView) {
    await TestBed.configureTestingModule({
      imports: [HomePage],
      providers: [
        provideRouter([]),
        { provide: PublicApiClient, useValue: { home: () => of(home) } },
        { provide: BusinessProfileService, useValue: profileService },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(HomePage);
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('does not render empty featured sections', async () => {
    const root = await renderHome(baseHome);
    expect(root.textContent).not.toContain('Casos de éxito');
    expect(root.textContent).not.toContain('Lo que dicen nuestros clientes');
  });

  it('renders featured success cases and testimonials', async () => {
    const root = await renderHome({
      ...baseHome,
      featuredSuccessCases: [{ slug: 'pasarela', title: 'Pasarela 2026', clientName: 'Marca' }],
      featuredTestimonials: [{ clientName: 'Laura', quote: 'Excelente trabajo.' }],
    });
    expect(root.textContent).toContain('Pasarela 2026');
    expect(root.textContent).toContain('Excelente trabajo.');
  });
});
