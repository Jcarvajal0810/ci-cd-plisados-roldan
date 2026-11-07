import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SuccessCaseDetail } from '../../core/api/models';
import { BusinessProfileService } from '../../core/profile/business-profile.service';
import { WhatsAppMessages, whatsappLink } from '../../core/whatsapp/whatsapp-link.builder';
import { ImagePlaceholderComponent } from '../../shared/ui/image-placeholder.component';
import { ResponsiveImageComponent } from '../../shared/ui/responsive-image.component';
import { WhatsAppButtonComponent } from '../../shared/ui/whatsapp-button.component';

/** How a success case looks to visitors; shared by the public page and the admin preview. */
@Component({
  selector: 'app-success-case-detail-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    RouterLink,
    ResponsiveImageComponent,
    ImagePlaceholderComponent,
    WhatsAppButtonComponent,
  ],
  template: `
    <article class="section">
      <div class="container layout">
        <div class="gallery">
          @for (image of successCase().images; track image.id; let first = $first) {
            <app-responsive-image
              [image]="image"
              [priority]="first"
              sizes="(min-width: 64rem) 50vw, 100vw"
            />
          } @empty {
            <app-image-placeholder [label]="successCase().title" />
          }
        </div>
        <div class="info">
          <p class="breadcrumb"><a routerLink="/casos-de-exito">Casos de éxito</a></p>
          <h1>{{ successCase().title }}</h1>
          <p class="client">{{ successCase().clientName }}</p>
          @if (successCase().eventLabel || successCase().eventDate) {
            <p class="muted">
              {{ successCase().eventLabel }}
              @if (successCase().eventDate; as date) {
                · <time [attr.datetime]="date">{{ date | date: 'longDate' : 'UTC' }}</time>
              }
            </p>
          }
          <p class="description">{{ successCase().description }}</p>
          @if (successCase().relatedOfferings.length) {
            <p>
              Servicios:
              @for (
                offering of successCase().relatedOfferings;
                track offering.slug;
                let last = $last
              ) {
                <a [routerLink]="['/servicios', offering.slug]">{{ offering.name }}</a
                >{{ last ? '' : ', ' }}
              }
            </p>
          }
          <app-whatsapp-button
            label="Cotizar por WhatsApp"
            testId="case-whatsapp"
            [href]="whatsappHref()"
          />
        </div>
      </div>
    </article>
  `,
  styles: `
    .layout {
      display: grid;
      gap: var(--space-8);
    }
    .gallery {
      display: grid;
      gap: var(--space-4);
    }
    .breadcrumb {
      margin-bottom: var(--space-2);
    }
    .client {
      font-size: 1.125rem;
      font-weight: 600;
    }
    .description {
      white-space: pre-line;
    }
    @media (min-width: 64rem) {
      .layout {
        grid-template-columns: 1fr 1fr;
        align-items: start;
      }
    }
  `,
})
export class SuccessCaseDetailViewComponent {
  readonly successCase = input.required<SuccessCaseDetail>();

  private readonly profileService = inject(BusinessProfileService);

  protected readonly whatsappHref = computed(() =>
    whatsappLink(
      this.profileService.whatsappNumber(),
      WhatsAppMessages.successCase(this.successCase().title),
    ),
  );
}
