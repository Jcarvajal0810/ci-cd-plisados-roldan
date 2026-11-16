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
          <p class="breadcrumb"><a routerLink="/servicios">← Servicios</a></p>
          <span class="kicker">hecho en Plisados Roldán</span>
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
      grid-template-columns: repeat(3, 1fr);
      gap: var(--space-3);
    }
    .gallery > * {
      display: block;
      aspect-ratio: 1;
      padding: 6px;
      background: var(--color-surface);
      box-shadow: var(--shadow);
      transition: transform 0.35s ease;
    }
    .gallery > *:hover {
      transform: rotate(-1.5deg) scale(1.03);
    }
    .gallery > :first-child {
      grid-column: 1 / -1;
      aspect-ratio: 4 / 3;
      padding: 10px 10px 26px;
    }
    .info {
      position: relative;
      padding: var(--space-8) var(--space-6);
      background: var(--color-surface);
      outline: var(--stitch);
      outline-offset: -12px;
      box-shadow: var(--shadow);
    }
    .breadcrumb {
      margin-bottom: var(--space-4);
      font-size: 0.8rem;
      letter-spacing: 0.16em;
      text-transform: uppercase;
    }
    .breadcrumb a {
      text-decoration: none;
    }
    h1 {
      font-size: clamp(2.2rem, 5vw, 3.4rem);
      color: var(--color-brand-deep);
    }
    .summary {
      font-family: var(--font-display);
      font-style: italic;
      font-size: 1.25rem;
      color: var(--color-brand);
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
        grid-template-columns: 1.15fr 1fr;
        align-items: start;
      }
      .info {
        position: sticky;
        top: 6rem;
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
