import { ChangeDetectionStrategy, Component, RESPONSE_INIT, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BusinessProfileService } from '../../core/profile/business-profile.service';
import { SeoService } from '../../core/seo/seo.service';
import { WhatsAppButtonComponent } from '../../shared/ui/whatsapp-button.component';

/**
 * Friendly 404 (also shown inline for unknown or unpublished slugs). On the server it sets the
 * real HTTP status 404 so search engines drop the address (contracts/ui-routes.md).
 */
@Component({
  selector: 'app-not-found-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, WhatsAppButtonComponent],
  template: `
    <section class="section">
      <div class="container narrow">
        <h1>Página no encontrada</h1>
        <p>Lo que buscas no existe o ya no está disponible.</p>
        <p><a routerLink="/servicios">Ver servicios</a></p>
        <app-whatsapp-button [href]="profileService.genericWhatsappLink()" />
      </div>
    </section>
  `,
  styles: `
    .narrow {
      max-width: 46rem;
    }
  `,
})
export class NotFoundPage {
  protected readonly profileService = inject(BusinessProfileService);

  constructor() {
    const response = inject(RESPONSE_INIT, { optional: true });
    if (response) {
      response.status = 404;
    }
    inject(SeoService).update({
      title: 'Página no encontrada',
      description: 'La página que buscas no existe o ya no está disponible en Plisados Roldán.',
      path: '/',
      noindex: true,
    });
  }
}
