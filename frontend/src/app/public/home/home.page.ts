import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { PublicApiClient } from '../../core/api/public-api.client';
import { BusinessProfileService } from '../../core/profile/business-profile.service';
import { OfferingCardComponent } from '../../shared/ui/offering-card.component';
import { SuccessCaseCardComponent } from '../../shared/ui/success-case-card.component';
import { TestimonialCardComponent } from '../../shared/ui/testimonial-card.component';
import { WhatsAppButtonComponent } from '../../shared/ui/whatsapp-button.component';
import { SeoService } from '../../core/seo/seo.service';
import { PleatedShowcaseComponent } from './pleated-showcase.component';
import { ProcessSwatchesComponent } from './process-swatches.component';
import { TapeRibbonComponent } from './tape-ribbon.component';
import { WorkshopGalleryComponent } from './workshop-gallery.component';

@Component({
  selector: 'app-home-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    OfferingCardComponent,
    SuccessCaseCardComponent,
    TestimonialCardComponent,
    WhatsAppButtonComponent,
    TapeRibbonComponent,
    ProcessSwatchesComponent,
    PleatedShowcaseComponent,
    WorkshopGalleryComponent,
  ],
  template: `
    @if (home.hasValue()) {
      @let view = home.value();
      <section class="hero">
        <div class="container hero-grid">
          <div>
            <p class="eyebrow">Taller de procesos textiles · Itagüí</p>
            @let words = view.profile.businessName.split(' ');
            <h1 class="logo">
              <span class="w1">{{ words[0] }} </span>
              <span class="w2">{{ words.slice(1).join(' ') }}</span>
            </h1>
            <p class="slogan">{{ view.profile.slogan }}</p>
            <p class="lead">
              Plisado, trillado, craquelado y corte y grabado láser para diseñadores, marcas y
              confeccionistas. Hecho a mano en {{ view.profile.locationText }}.
            </p>
            <div class="actions">
              <app-whatsapp-button [href]="profileService.genericWhatsappLink()" />
              <a class="btn" routerLink="/servicios">Ver servicios</a>
            </div>
          </div>
          <app-pleated-showcase />
        </div>
      </section>

      <app-tape-ribbon />

      <section class="section" aria-labelledby="servicios-titulo">
        <div class="container">
          <header class="section-head">
            <span class="kicker">lo que hacemos</span>
            <h2 id="servicios-titulo">Nuestros servicios</h2>
            <p class="muted">Cada tela pasa por manos que conocen el oficio.</p>
          </header>
          <ul class="card-grid plain" aria-label="Servicios">
            @for (offering of view.offerings; track offering.slug; let first = $first) {
              <li><app-offering-card [offering]="offering" [priority]="first" /></li>
            }
          </ul>
          <p class="more"><a class="btn" routerLink="/servicios">Ver todos los servicios</a></p>
        </div>
      </section>

      <section class="section procesos" aria-labelledby="procesos-titulo">
        <div class="container">
          <header class="section-head">
            <span class="kicker">el muestrario</span>
            <h2 id="procesos-titulo">Nuestros procesos</h2>
            <p class="muted">
              Desliza el muestrario: cada técnica le da a la tela una textura y un movimiento
              distintos.
            </p>
          </header>
          <app-process-swatches />
        </div>
      </section>

      <section class="section" aria-labelledby="taller-titulo">
        <div class="container">
          <header class="section-head">
            <span class="kicker">del taller</span>
            <h2 id="taller-titulo">a la pasarela</h2>
          </header>
          <app-workshop-gallery />
        </div>
      </section>

      @if (view.featuredSuccessCases.length) {
        <section class="section" aria-labelledby="casos-titulo">
          <div class="container">
            <header class="section-head">
              <span class="kicker">confían en nosotros</span>
              <h2 id="casos-titulo">Casos de éxito</h2>
            </header>
            <ul class="card-grid plain" aria-label="Casos de éxito destacados">
              @for (item of view.featuredSuccessCases; track item.slug) {
                <li><app-success-case-card [successCase]="item" /></li>
              }
            </ul>
            <p class="more">
              <a class="btn" routerLink="/casos-de-exito">Ver todos los casos</a>
            </p>
          </div>
        </section>
      }

      @if (view.featuredTestimonials.length) {
        <section class="section" aria-labelledby="testimonios-titulo">
          <div class="container">
            <header class="section-head">
              <span class="kicker">con cariño</span>
              <h2 id="testimonios-titulo">Lo que dicen nuestros clientes</h2>
            </header>
            <ul class="card-grid plain" aria-label="Testimonios destacados">
              @for (item of view.featuredTestimonials; track $index) {
                <li><app-testimonial-card [testimonial]="item" /></li>
              }
            </ul>
          </div>
        </section>
      }

      <section class="section">
        <div class="container">
          <div class="cta">
            <span class="kicker">¿tienes una idea?</span>
            <h2>Tráenos tu tela, nosotros le damos movimiento</h2>
            <p>Cuéntanos qué necesitas y te asesoramos sobre el proceso ideal.</p>
            <app-whatsapp-button [href]="profileService.genericWhatsappLink()" />
          </div>
        </div>
      </section>
    } @else if (home.error()) {
      <section class="section">
        <div class="container">
          <h1>Plisados Roldán</h1>
          <p>No pudimos cargar la información en este momento. Escríbenos por WhatsApp.</p>
        </div>
      </section>
    }
  `,
  styles: `
    .hero {
      position: relative;
      overflow: hidden;
      padding-block: var(--space-12) var(--space-8);
    }
    .hero::before {
      content: '';
      position: absolute;
      top: -35%;
      right: -35%;
      width: min(130vw, 70rem);
      aspect-ratio: 1;
      border-radius: 50%;
      background: repeating-conic-gradient(
        rgb(244 198 193 / 0.6) 0 3deg,
        rgb(255 255 255 / 0.35) 3deg 6deg
      );
      -webkit-mask: radial-gradient(closest-side, #000 55%, transparent);
      mask: radial-gradient(closest-side, #000 55%, transparent);
      animation: turn 140s linear infinite;
      pointer-events: none;
    }
    .hero-grid {
      position: relative;
      display: grid;
      gap: var(--space-12);
      align-items: center;
    }
    .eyebrow {
      display: inline-block;
      margin-bottom: var(--space-4);
      padding: var(--space-1) var(--space-3);
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: var(--color-brand-deep);
      border: var(--stitch);
      border-radius: 999px;
      background: rgb(255 255 255 / 0.6);
    }
    .logo {
      display: grid;
      margin-bottom: var(--space-4);
      line-height: 1;
    }
    .w1 {
      font-family: var(--font-display);
      font-size: clamp(2.6rem, 8.5vw, 5.4rem);
      font-weight: 500;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      background: linear-gradient(100deg, var(--color-brand-deep), var(--color-brand) 60%, #a8456f);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
    }
    .w2 {
      justify-self: end;
      margin: -0.28em 6% 0 0;
      font-family: var(--font-script);
      font-size: clamp(3.6rem, 12vw, 7.6rem);
      font-weight: 400;
      line-height: 1;
      color: var(--color-brand);
      text-shadow: 0 3px 0 var(--color-bg);
      rotate: -4deg;
    }
    .slogan {
      font-family: var(--font-display);
      font-style: italic;
      font-size: clamp(1.3rem, 3vw, 1.75rem);
      color: var(--color-brand);
    }
    .lead {
      max-width: 34rem;
      font-size: 1.15rem;
      font-weight: 300;
    }
    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-4);
      align-items: center;
      margin-top: var(--space-6);
    }
    .more {
      margin-top: var(--space-8);
      text-align: center;
    }
    .procesos {
      background: linear-gradient(
        180deg,
        transparent,
        rgb(241 228 239 / 0.85) 18% 82%,
        transparent
      );
    }
    .cta {
      padding: var(--space-12) var(--space-6);
      text-align: center;
      color: #fff;
      background:
        repeating-linear-gradient(
          90deg,
          rgb(255 255 255 / 0.06) 0 2px,
          transparent 2px 22px,
          rgb(0 0 0 / 0.12) 22px 26px
        ),
        linear-gradient(135deg, var(--color-brand), var(--color-brand-deep));
      outline: 2px dashed var(--color-thread);
      outline-offset: -14px;
      box-shadow: var(--shadow-lift);
    }
    .cta .kicker {
      color: var(--color-blush);
      transform-origin: center;
    }
    .cta h2 {
      max-width: 36rem;
      margin-inline: auto;
    }
    @keyframes turn {
      to {
        transform: rotate(360deg);
      }
    }
    @media (min-width: 56rem) {
      .hero {
        padding-block: var(--space-16) var(--space-12);
      }
      .hero-grid {
        grid-template-columns: 1.1fr 1fr;
      }
    }
  `,
})
export class HomePage {
  private readonly api = inject(PublicApiClient);
  protected readonly profileService = inject(BusinessProfileService);

  protected readonly home = rxResource({ stream: () => this.api.home() });

  constructor() {
    const seo = inject(SeoService);
    effect(() => {
      if (this.home.hasValue()) {
        const { profile } = this.home.value();
        const firstSentence = profile.aboutText.split(/(?<=\.)\s/)[0] ?? '';
        seo.update({
          title: 'Plisados Roldán · Plisado, trillado y corte láser en Itagüí',
          description: `${profile.slogan}. ${firstSentence}`,
          path: '/',
        });
      }
    });
  }
}
