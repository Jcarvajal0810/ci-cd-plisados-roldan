import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { BusinessProfileService } from '../../core/profile/business-profile.service';
import { SeoService } from '../../core/seo/seo.service';

@Component({
  selector: 'app-about-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="section">
      <div class="container layout">
        <div class="text">
          <header class="section-head">
            <span class="kicker">nuestra historia</span>
            <h1>Nosotros</h1>
          </header>
          @for (paragraph of paragraphs(); track $index; let first = $first) {
            <p [class.first]="first">{{ paragraph }}</p>
          }
          @if (profileService.profile(); as profile) {
            <p class="place">{{ profile.locationText }}</p>
          }
        </div>
        <div class="photos">
          <figure class="p1">
            <img
              src="galeria/equipo.jpg"
              alt="Equipo de Plisados Roldán en un evento de moda"
              width="290"
              height="330"
            />
            <figcaption>Nuestro equipo</figcaption>
          </figure>
          <figure class="p2">
            <img
              src="galeria/plisado-a-mano.jpg"
              alt="Manos plisando tela beige en el taller"
              width="290"
              height="330"
              loading="lazy"
            />
            <figcaption>Hecho a mano</figcaption>
          </figure>
          <figure class="p3">
            <img
              src="galeria/pasarela.jpg"
              alt="Desfile de moda en pasarela"
              width="290"
              height="330"
              loading="lazy"
            />
            <figcaption>En pasarela</figcaption>
          </figure>
        </div>
      </div>
    </section>
  `,
  styles: `
    .layout {
      display: grid;
      gap: var(--space-12);
    }
    .text {
      max-width: 42rem;
    }
    .first::first-letter {
      float: left;
      font-family: var(--font-display);
      font-size: 4.2rem;
      line-height: 0.85;
      padding: 0.1em 0.12em 0 0;
      color: var(--color-brand);
    }
    .place {
      font-family: var(--font-script);
      font-size: 2rem;
      color: var(--color-brand);
    }
    .photos {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-4);
      align-content: start;
    }
    figure {
      margin: 0;
      padding: 8px 8px 0;
      background: var(--color-surface);
      box-shadow: var(--shadow);
    }
    .p1 {
      grid-column: span 2;
      rotate: -1.5deg;
    }
    .p2 {
      rotate: 2deg;
    }
    .p3 {
      rotate: -2deg;
    }
    img {
      width: 100%;
      aspect-ratio: 4 / 3;
      object-fit: cover;
    }
    figcaption {
      font-family: var(--font-script);
      font-size: 1.5rem;
      text-align: center;
      color: var(--color-brand);
    }
    @media (min-width: 60rem) {
      .layout {
        grid-template-columns: 1.3fr 1fr;
        align-items: start;
      }
      .photos {
        position: sticky;
        top: 6rem;
      }
    }
  `,
})
export class AboutPage {
  protected readonly profileService = inject(BusinessProfileService);

  /** The owner's text, split into paragraphs on blank lines. */
  protected readonly paragraphs = computed(() =>
    (this.profileService.profile()?.aboutText ?? '')
      .split(/\n\s*\n/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean),
  );

  constructor() {
    const seo = inject(SeoService);
    effect(() => {
      const profile = this.profileService.profile();
      if (profile) {
        seo.update({
          title: 'Nosotros · Plisados Roldán',
          description: profile.aboutText,
          path: '/nosotros',
        });
      }
    });
  }
}
