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

@Component({
  selector: 'app-home-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    OfferingCardComponent,
    SuccessCaseCardComponent,
    TestimonialCardComponent,
    WhatsAppButtonComponent,
  ],
  template: `
    @if (home.hasValue()) {
      @let view = home.value();
      <section class="hero">
        <div class="container">
          <h1>{{ view.profile.businessName }}</h1>
          <p class="slogan">{{ view.profile.slogan }}</p>
          <p class="lead">
            Plisado, trillado, craquelado y corte y grabado láser para diseñadores, marcas y
            confeccionistas. Hecho a mano en {{ view.profile.locationText }}.
          </p>
          <app-whatsapp-button [href]="profileService.genericWhatsappLink()" />
        </div>
      </section>

      <section class="section" aria-labelledby="servicios-titulo">
        <div class="container">
          <h2 id="servicios-titulo">Nuestros servicios</h2>
          <ul class="card-grid plain" aria-label="Servicios">
            @for (offering of view.offerings; track offering.slug; let first = $first) {
              <li><app-offering-card [offering]="offering" [priority]="first" /></li>
            }
          </ul>
          <p class="more"><a routerLink="/servicios">Ver todos los servicios</a></p>
        </div>
      </section>

      @if (view.featuredSuccessCases.length) {
        <section class="section" aria-labelledby="casos-titulo">
          <div class="container">
            <h2 id="casos-titulo">Casos de éxito</h2>
            <ul class="card-grid plain" aria-label="Casos de éxito destacados">
              @for (item of view.featuredSuccessCases; track item.slug) {
                <li><app-success-case-card [successCase]="item" /></li>
              }
            </ul>
            <p class="more"><a routerLink="/casos-de-exito">Ver todos los casos</a></p>
          </div>
        </section>
      }

      @if (view.featuredTestimonials.length) {
        <section class="section" aria-labelledby="testimonios-titulo">
          <div class="container">
            <h2 id="testimonios-titulo">Lo que dicen nuestros clientes</h2>
            <ul class="card-grid plain" aria-label="Testimonios destacados">
              @for (item of view.featuredTestimonials; track $index) {
                <li><app-testimonial-card [testimonial]="item" /></li>
              }
            </ul>
          </div>
        </section>
      }
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
      padding-block: var(--space-12);
      background: linear-gradient(180deg, var(--color-brand-soft), var(--color-bg));
    }
    .slogan {
      font-family: var(--font-display);
      font-size: 1.5rem;
      font-style: italic;
      color: var(--color-brand);
    }
    .lead {
      max-width: 40rem;
      font-size: 1.125rem;
    }
    .plain {
      list-style: none;
      margin: 0;
      padding: 0;
    }
    .more {
      margin-top: var(--space-6);
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
