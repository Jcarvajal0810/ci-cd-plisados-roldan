import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { SiteSectionsService } from '../../core/content/site-sections.service';
import { BusinessProfileService } from '../../core/profile/business-profile.service';
import { WhatsAppButtonComponent } from '../../shared/ui/whatsapp-button.component';

/** Shell for every public page: header navigation, footer contact and floating WhatsApp. */
@Component({
  selector: 'app-public-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, WhatsAppButtonComponent],
  template: `
    <a class="skip" href="#contenido">Saltar al contenido</a>
    <header class="header">
      <div class="container bar">
        <a class="brand" routerLink="/">
          <svg class="mark" viewBox="0 0 40 40" aria-hidden="true">
            <circle
              cx="20"
              cy="20"
              r="19"
              fill="none"
              stroke="currentColor"
              stroke-dasharray="2 2.4"
            />
            <path
              d="M20 32 6 14M20 32 10 10M20 32 15 8M20 32l5-24M20 32l10-22M20 32l14-18"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
            />
          </svg>
          <span class="brand-text">
            <span class="brand-word">Plisados </span>
            <span class="brand-script">Roldán</span>
          </span>
        </a>
        <nav aria-label="Principal">
          <ul>
            @for (link of links(); track link.path) {
              <li>
                <a
                  [routerLink]="link.path"
                  routerLinkActive="active"
                  [routerLinkActiveOptions]="{ exact: link.path === '/' }"
                  >{{ link.label }}</a
                >
              </li>
            }
          </ul>
        </nav>
      </div>
    </header>

    <main id="contenido">
      <router-outlet />
    </main>

    <footer class="footer">
      <div class="container foot">
        <div>
          <p class="foot-brand">
            <span class="brand-word">Plisados </span><span class="brand-script">Roldán</span>
          </p>
          <p class="foot-slogan">Procesos textiles con alma artesanal.</p>
        </div>
        @if (profileService.profile(); as profile) {
          <div class="foot-info">
            <p><span class="tag">Taller</span>{{ profile.locationText }}</p>
            <p><span class="tag">Horario</span>{{ profile.scheduleText }}</p>
          </div>
        }
        <div class="foot-cta">
          <p class="foot-note">Hecho a mano, con mucho amor.</p>
          <app-whatsapp-button [href]="profileService.genericWhatsappLink()" />
        </div>
      </div>
    </footer>

    <app-whatsapp-button variant="floating" [href]="profileService.genericWhatsappLink()" />
  `,
  styles: `
    .skip {
      position: absolute;
      left: -999px;
    }
    .skip:focus {
      left: var(--space-4);
      top: var(--space-4);
      z-index: 30;
      background: var(--color-surface);
      padding: var(--space-2) var(--space-4);
    }
    .header {
      position: sticky;
      top: 0;
      z-index: 20;
      background: rgb(251 243 241 / 0.86);
      backdrop-filter: blur(10px) saturate(1.2);
      border-bottom: var(--stitch);
      box-shadow: 0 6px 20px -18px rgb(74 22 48 / 0.6);
    }
    .bar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-2) var(--space-6);
      padding-block: var(--space-3);
    }
    .brand {
      display: inline-flex;
      align-items: center;
      gap: 0.6rem;
      color: var(--color-brand-deep);
      text-decoration: none;
    }
    .mark {
      width: 2.6rem;
      height: 2.6rem;
      color: var(--color-brand);
      transition: transform 0.6s ease;
    }
    .brand:hover .mark {
      transform: rotate(-20deg);
    }
    .brand-text {
      display: grid;
      line-height: 1;
    }
    .brand-word {
      font-family: var(--font-display);
      font-size: 0.95rem;
      font-weight: 700;
      letter-spacing: 0.42em;
      text-transform: uppercase;
    }
    .brand-script {
      font-family: var(--font-script);
      font-size: 2.1rem;
      line-height: 0.7;
      margin: -0.05em 0 0 1.4rem;
      color: var(--color-brand);
    }
    .foot-brand .brand-word {
      font-size: 1.3rem;
      letter-spacing: 0.3em;
    }
    nav ul {
      display: flex;
      gap: var(--space-1) var(--space-4);
      list-style: none;
      margin: 0;
      padding: 0;
      overflow-x: auto;
      scrollbar-width: none;
    }
    nav a {
      position: relative;
      display: inline-block;
      padding-block: var(--space-2);
      color: var(--color-muted);
      font-size: 0.85rem;
      font-weight: 500;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      text-decoration: none;
      white-space: nowrap;
    }
    nav a::after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      bottom: 2px;
      border-top: 2px dashed var(--color-brand);
      transform: scaleX(0);
      transform-origin: left;
      transition: transform 0.35s ease;
    }
    nav a:hover,
    nav a.active {
      color: var(--color-brand);
    }
    nav a:hover::after,
    nav a.active::after {
      transform: scaleX(1);
    }
    .footer {
      position: relative;
      margin-top: var(--space-12);
      padding-block: var(--space-12) var(--space-16);
      color: #f7e9ee;
      background:
        repeating-linear-gradient(
          90deg,
          rgb(255 255 255 / 0.05) 0 2px,
          transparent 2px 26px,
          rgb(0 0 0 / 0.12) 26px 30px
        ),
        linear-gradient(160deg, var(--color-brand) 0%, var(--color-brand-deep) 70%);
    }
    .footer::before {
      content: '';
      position: absolute;
      inset: 10px 0 auto;
      border-top: var(--stitch);
    }
    .foot {
      display: grid;
      gap: var(--space-8);
    }
    .foot-brand {
      margin: 0;
      color: #fff;
    }
    .foot-brand .brand-script {
      color: var(--color-blush);
      font-size: 2.4rem;
    }
    .foot-slogan {
      font-family: var(--font-display);
      font-style: italic;
      font-size: 1.15rem;
      margin-top: var(--space-3);
    }
    .tag {
      display: block;
      font-size: 0.72rem;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--color-blush);
    }
    .foot-note {
      font-family: var(--font-script);
      font-size: 1.8rem;
      line-height: 1.2;
      color: #fff;
    }
    @media (min-width: 52rem) {
      .foot {
        grid-template-columns: 1.3fr 1fr 1fr;
        align-items: start;
      }
    }
  `,
})
export class PublicLayoutComponent {
  protected readonly profileService = inject(BusinessProfileService);
  private readonly sections = inject(SiteSectionsService);

  /** Main navigation; optional sections appear only when they have published content. */
  protected readonly links = computed(() => [
    { path: '/', label: 'Inicio' },
    { path: '/nosotros', label: 'Nosotros' },
    { path: '/servicios', label: 'Servicios' },
    ...(this.sections.hasSuccessCases()
      ? [{ path: '/casos-de-exito', label: 'Casos de éxito' }]
      : []),
    ...(this.sections.hasTestimonials() ? [{ path: '/testimonios', label: 'Testimonios' }] : []),
    { path: '/contacto', label: 'Contacto' },
  ]);
}
