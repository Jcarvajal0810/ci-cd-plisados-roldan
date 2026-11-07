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
        <a class="brand" routerLink="/">Plisados Roldán</a>
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
      <div class="container">
        @if (profileService.profile(); as profile) {
          <p class="footer-brand">{{ profile.businessName }}</p>
          <p>{{ profile.locationText }}</p>
          <p>{{ profile.scheduleText }}</p>
        }
        <app-whatsapp-button [href]="profileService.genericWhatsappLink()" />
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
      z-index: 20;
      background: var(--color-surface);
      padding: var(--space-2) var(--space-4);
    }
    .header {
      background: var(--color-surface);
      border-bottom: 1px solid var(--color-border);
    }
    .bar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-2);
      padding-block: var(--space-3);
    }
    .brand {
      font-family: var(--font-display);
      font-size: 1.25rem;
      color: var(--color-text);
      text-decoration: none;
    }
    nav ul {
      display: flex;
      gap: var(--space-4);
      list-style: none;
      margin: 0;
      padding: 0;
      overflow-x: auto;
    }
    nav a {
      display: inline-block;
      padding-block: var(--space-2);
      color: var(--color-muted);
      text-decoration: none;
      white-space: nowrap;
    }
    nav a.active {
      color: var(--color-brand);
      font-weight: 600;
    }
    .footer {
      margin-top: var(--space-12);
      padding-block: var(--space-8) var(--space-12);
      background: var(--color-surface);
      border-top: 1px solid var(--color-border);
    }
    .footer-brand {
      font-family: var(--font-display);
      font-size: 1.25rem;
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
