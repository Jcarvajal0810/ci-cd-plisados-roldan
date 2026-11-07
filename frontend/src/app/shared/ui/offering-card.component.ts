import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OfferingSummary } from '../../core/api/models';
import { ReferencePricePipe } from '../format/reference-price.pipe';
import { ImagePlaceholderComponent } from './image-placeholder.component';
import { ResponsiveImageComponent } from './responsive-image.component';

/** Offering card used on the home page and the catalog. */
@Component({
  selector: 'app-offering-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ReferencePricePipe, ResponsiveImageComponent, ImagePlaceholderComponent],
  template: `
    <article class="card">
      <div class="media">
        @if (offering().coverImage; as cover) {
          <app-responsive-image [image]="cover" [priority]="priority()" />
        } @else {
          <app-image-placeholder [label]="offering().name" />
        }
      </div>
      <div class="body">
        <h3>
          <a [routerLink]="['/servicios', offering().slug]">{{ offering().name }}</a>
        </h3>
        <p class="muted">{{ offering().summary }}</p>
        @if (offering().referencePriceCop) {
          <p class="price">{{ offering().referencePriceCop | referencePrice }}</p>
        }
      </div>
    </article>
  `,
  styles: `
    .card {
      height: 100%;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius);
      overflow: hidden;
    }
    .media {
      aspect-ratio: 4 / 3;
    }
    .body {
      padding: var(--space-4);
    }
    h3 a {
      color: var(--color-text);
      text-decoration: none;
    }
    h3 a:hover {
      text-decoration: underline;
    }
    .price {
      font-weight: 600;
      color: var(--color-brand);
      margin: 0;
    }
  `,
})
export class OfferingCardComponent {
  readonly offering = input.required<OfferingSummary>();
  readonly priority = input(false);
}
