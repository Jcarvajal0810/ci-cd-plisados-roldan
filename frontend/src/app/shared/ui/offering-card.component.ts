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
        <span class="eyelet" aria-hidden="true"></span>
      </div>
      <div class="body">
        <h3>
          <a [routerLink]="['/servicios', offering().slug]">{{ offering().name }}</a>
        </h3>
        <p class="muted">{{ offering().summary }}</p>
        @if (offering().referencePriceCop) {
          <p class="price">{{ offering().referencePriceCop | referencePrice }}</p>
        }
        <span class="more" aria-hidden="true">Ver proceso →</span>
      </div>
    </article>
  `,
  styles: `
    .card {
      position: relative;
      height: 100%;
      display: flex;
      flex-direction: column;
      padding: var(--space-3) var(--space-3) var(--space-6);
      background: var(--color-surface);
      box-shadow: var(--shadow);
      -webkit-mask:
        var(--pinked) bottom / 14px 14px repeat-x,
        linear-gradient(#000 0 0) top / 100% calc(100% - 7px) no-repeat;
      mask:
        var(--pinked) bottom / 14px 14px repeat-x,
        linear-gradient(#000 0 0) top / 100% calc(100% - 7px) no-repeat;
      transition: transform 0.35s cubic-bezier(0.2, 0.7, 0.3, 1.3);
    }
    .card:hover {
      transform: translateY(-6px) rotate(-0.8deg);
    }
    .media {
      position: relative;
      aspect-ratio: 4 / 3;
      overflow: hidden;
      border-radius: 2px;
    }
    .media :is(app-responsive-image, app-image-placeholder) {
      display: block;
      height: 100%;
      transition: transform 0.6s ease;
    }
    .card:hover .media :is(app-responsive-image, app-image-placeholder) {
      transform: scale(1.06);
    }
    .eyelet {
      position: absolute;
      top: 12px;
      left: 12px;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: var(--color-bg);
      box-shadow:
        inset 0 1px 3px rgb(0 0 0 / 0.35),
        0 0 0 3px var(--color-thread);
    }
    .body {
      flex: 1;
      display: flex;
      flex-direction: column;
      margin: var(--space-3) 0 0;
      padding: var(--space-4) var(--space-3) 0;
      border-top: var(--stitch);
    }
    h3 {
      font-size: 1.6rem;
      margin-bottom: var(--space-2);
    }
    h3 a {
      color: var(--color-brand-deep);
      text-decoration: none;
    }
    h3 a::after {
      content: '';
      position: absolute;
      inset: 0;
    }
    .price {
      font-weight: 600;
      color: var(--color-brand);
      margin: 0;
    }
    .more {
      margin-top: auto;
      padding-top: var(--space-2);
      font-size: 0.8rem;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: var(--color-brand);
    }
  `,
})
export class OfferingCardComponent {
  readonly offering = input.required<OfferingSummary>();
  readonly priority = input(false);
}
