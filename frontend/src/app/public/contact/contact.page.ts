import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { BusinessProfileService } from '../../core/profile/business-profile.service';
import { WhatsAppButtonComponent } from '../../shared/ui/whatsapp-button.component';
import { SeoService } from '../../core/seo/seo.service';

@Component({
  selector: 'app-contact-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [WhatsAppButtonComponent],
  template: `
    <section class="section">
      <div class="container narrow">
        <h1>Contacto</h1>
        <p>Cuéntanos qué necesitas y te respondemos por WhatsApp.</p>
        <app-whatsapp-button [href]="profileService.genericWhatsappLink()" />
        @if (profileService.profile(); as profile) {
          <dl>
            <dt>WhatsApp</dt>
            <dd>+{{ profile.whatsappNumber }}</dd>
            <dt>Ubicación</dt>
            <dd>{{ profile.locationText }}</dd>
            <dt>Horario</dt>
            <dd>{{ profile.scheduleText }}</dd>
          </dl>
        }
      </div>
    </section>
  `,
  styles: `
    .narrow {
      max-width: 46rem;
    }
    dl {
      margin-top: var(--space-8);
    }
    dt {
      font-weight: 600;
    }
    dd {
      margin: 0 0 var(--space-4);
    }
  `,
})
export class ContactPage {
  protected readonly profileService = inject(BusinessProfileService);

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
}
