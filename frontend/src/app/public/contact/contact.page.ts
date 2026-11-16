import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { BusinessProfileService } from '../../core/profile/business-profile.service';
import { whatsappLink } from '../../core/whatsapp/whatsapp-link.builder';
import { WhatsAppButtonComponent } from '../../shared/ui/whatsapp-button.component';
import { SeoService } from '../../core/seo/seo.service';

/** Ready-made WhatsApp messages: one tap opens the chat with the text already written. */
const QUICK_MESSAGES = [
  { label: 'Cotizar un plisado', text: 'Hola, quiero cotizar un plisado para mi tela.' },
  { label: 'Falda Plissee a la medida', text: 'Hola, quiero una falda Plissee a la medida.' },
  { label: 'Trillado o craquelado', text: 'Hola, quiero información sobre trillado o craquelado.' },
  { label: 'Corte o grabado láser', text: 'Hola, quiero cotizar corte o grabado láser.' },
  { label: 'Precios y tiempos', text: 'Hola, quiero saber precios y tiempos de entrega.' },
];

@Component({
  selector: 'app-contact-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [WhatsAppButtonComponent],
  template: `
    <section class="section">
      <div class="container">
        <header class="section-head">
          <span class="kicker">hablemos</span>
          <h1>Contacto</h1>
          <p class="lead">
            Cuéntanos qué necesitas y te respondemos por WhatsApp. Elige un tema y el mensaje se
            escribe solo.
          </p>
        </header>

        <div class="top">
          <div class="panel">
            <h2>¿Qué necesitas?</h2>
            <ul class="chips plain" aria-label="Mensajes rápidos por WhatsApp">
              @for (quick of quickLinks(); track quick.label) {
                <li>
                  <a class="chip" [href]="quick.href" target="_blank" rel="noopener">
                    {{ quick.label }} <span aria-hidden="true">→</span>
                  </a>
                </li>
              }
            </ul>
            <p class="or">o escríbenos con tus palabras</p>
            <app-whatsapp-button [href]="profileService.genericWhatsappLink()" />
          </div>
          <figure class="photo">
            <img
              src="galeria/plisado-a-mano.jpg"
              alt="Manos plisando tela en el taller"
              width="290"
              height="330"
            />
            <figcaption>Te esperamos en el taller</figcaption>
          </figure>
        </div>

        @if (profileService.profile(); as profile) {
          <ul class="cards plain" aria-label="Datos de contacto">
            <li class="card">
              <span class="icon" aria-hidden="true">☎</span>
              <h2>Teléfono</h2>
              <p class="value">+{{ profile.whatsappNumber }}</p>
              <div class="row">
                <a class="btn btn-primary" [href]="'tel:+' + profile.whatsappNumber">Llamar</a>
                <button type="button" class="btn" (click)="copy(profile.whatsappNumber)">
                  {{ copied() ? '¡Copiado!' : 'Copiar' }}
                </button>
              </div>
            </li>
            <li class="card">
              <span class="icon" aria-hidden="true">⌖</span>
              <h2>Ubicación</h2>
              <p class="value">{{ profile.locationText }}</p>
              <div class="row">
                <a class="btn" [href]="mapsHref()" target="_blank" rel="noopener">Ver en el mapa</a>
              </div>
            </li>
            <li class="card">
              <span class="icon" aria-hidden="true">◷</span>
              <h2>Horario</h2>
              <p class="value">{{ profile.scheduleText }}</p>
              <p class="hint">Fuera de horario, deja tu mensaje y te respondemos.</p>
            </li>
          </ul>
        }
      </div>
    </section>
  `,
  styles: `
    .lead {
      font-size: 1.15rem;
      font-weight: 300;
    }
    .top {
      display: grid;
      gap: var(--space-8);
      align-items: center;
    }
    .panel {
      padding: var(--space-8) var(--space-6);
      color: #fff;
      background:
        repeating-linear-gradient(90deg, rgb(255 255 255 / 0.06) 0 2px, transparent 2px 24px),
        linear-gradient(140deg, var(--color-brand), var(--color-brand-deep));
      outline: 2px dashed var(--color-thread);
      outline-offset: -12px;
      box-shadow: var(--shadow-lift);
    }
    .panel h2 {
      font-size: 1.8rem;
    }
    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-3);
    }
    .chip {
      display: inline-flex;
      gap: var(--space-2);
      align-items: center;
      min-height: 44px;
      padding: var(--space-2) var(--space-4);
      border: 1px dashed rgb(255 255 255 / 0.7);
      border-radius: 999px;
      color: #fff;
      text-decoration: none;
      background: rgb(255 255 255 / 0.08);
      transition:
        background-color 0.25s ease,
        color 0.25s ease,
        transform 0.25s ease;
    }
    .chip:hover {
      background: #fff;
      color: var(--color-brand-deep);
      transform: translateY(-2px);
    }
    .or {
      margin: var(--space-6) 0 var(--space-3);
      font-family: var(--font-script);
      font-size: 1.7rem;
      color: var(--color-blush);
    }
    .photo {
      margin: 0;
      padding: 10px 10px 0;
      max-width: 22rem;
      justify-self: center;
      background: var(--color-surface);
      box-shadow: var(--shadow-lift);
      rotate: 2.5deg;
    }
    .photo img {
      width: 100%;
      aspect-ratio: 1;
      object-fit: cover;
    }
    figcaption {
      font-family: var(--font-script);
      font-size: 1.6rem;
      text-align: center;
      color: var(--color-brand);
    }
    .cards {
      display: grid;
      gap: var(--space-6);
      margin-top: var(--space-12);
    }
    .card {
      display: flex;
      flex-direction: column;
      padding: var(--space-6);
      background: var(--color-surface);
      outline: var(--stitch);
      outline-offset: -10px;
      box-shadow: var(--shadow);
      transition: transform 0.3s ease;
    }
    .card:hover {
      transform: translateY(-4px);
    }
    .icon {
      display: grid;
      place-items: center;
      width: 2.6rem;
      height: 2.6rem;
      margin-bottom: var(--space-3);
      border-radius: 50%;
      font-size: 1.3rem;
      color: var(--color-brand);
      background: var(--color-brand-soft);
    }
    .card h2 {
      margin-bottom: var(--space-1);
      font-family: var(--font-body);
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--color-muted);
    }
    .value {
      font-family: var(--font-display);
      font-size: 1.25rem;
      color: var(--color-brand-deep);
    }
    .row {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-3);
      margin-top: auto;
    }
    @media (min-width: 56rem) {
      .top {
        grid-template-columns: 1.6fr 1fr;
      }
      .cards {
        grid-template-columns: repeat(3, 1fr);
      }
    }
  `,
})
export class ContactPage {
  protected readonly profileService = inject(BusinessProfileService);
  protected readonly copied = signal(false);

  protected readonly quickLinks = computed(() =>
    QUICK_MESSAGES.map((quick) => ({
      label: quick.label,
      href: whatsappLink(this.profileService.whatsappNumber(), quick.text),
    })),
  );

  protected readonly mapsHref = computed(
    () =>
      'https://www.google.com/maps/search/?api=1&query=' +
      encodeURIComponent(
        `${this.profileService.profile()?.businessName ?? ''} ${this.profileService.profile()?.locationText ?? ''}`.trim(),
      ),
  );

  constructor() {
    const seo = inject(SeoService);
    effect(() => {
      const profile = this.profileService.profile();
      if (profile) {
        seo.update({
          title: 'Contacto · Plisados Roldán',
          description: `Estamos en ${profile.locationText}. ${profile.scheduleText}. Escríbenos por WhatsApp.`,
          path: '/contacto',
        });
      }
    });
  }

  protected copy(number: string): void {
    navigator.clipboard?.writeText(`+${number}`).then(
      () => {
        this.copied.set(true);
        setTimeout(() => this.copied.set(false), 2000);
      },
      () => undefined,
    );
  }
}
