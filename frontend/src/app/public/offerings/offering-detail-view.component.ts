import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OfferingDetail } from '../../core/api/models';
import { BusinessProfileService } from '../../core/profile/business-profile.service';
import { WhatsAppMessages, whatsappLink } from '../../core/whatsapp/whatsapp-link.builder';
import { ReferencePricePipe } from '../../shared/format/reference-price.pipe';
import { ImagePlaceholderComponent } from '../../shared/ui/image-placeholder.component';
import { ResponsiveImageComponent } from '../../shared/ui/responsive-image.component';
import { WhatsAppButtonComponent } from '../../shared/ui/whatsapp-button.component';

/** How an offering looks to visitors; shared by the public page and the admin draft preview. */
@Component({
  selector: 'app-offering-detail-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    ReferencePricePipe,
    ResponsiveImageComponent,
    ImagePlaceholderComponent,
    WhatsAppButtonComponent,
  ],
  template: `
    <article class="section">
      <div class="container layout">
        <div class="gallery">
          @for (image of offering().images; track image.id; let first = $first) {
            <app-responsive-image
              [image]="image"
              [priority]="first"
              sizes="(min-width: 64rem) 50vw, 100vw"
            />
          } @empty {
            <app-image-placeholder [label]="offering().name" />
          }
        </div>
        <div class="info">
          <p class="breadcrumb"><a routerLink="/servicios">Servicios</a></p>
          <h1>{{ offering().name }}</h1>
          <p class="summary">{{ offering().summary }}</p>
          @if (offering().referencePriceCop) {
            <p class="price" data-testid="price">
              {{ offering().referencePriceCop | referencePrice }}
            </p>
          }
          <p class="description">{{ offering().description }}</p>
          <app-whatsapp-button
            label="Cotizar por WhatsApp"
            testId="offering-whatsapp"
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
    .summary {
      font-size: 1.125rem;
    }
    .price {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--color-brand);
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
export class OfferingDetailViewComponent {
  readonly offering = input.required<OfferingDetail>();

  private readonly profileService = inject(BusinessProfileService);

  protected readonly whatsappHref = computed(() =>
    whatsappLink(
      this.profileService.whatsappNumber(),
      WhatsAppMessages.offering(this.offering().name),
    ),
  );
}
