import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SuccessCaseSummary } from '../../core/api/models';
import { ImagePlaceholderComponent } from './image-placeholder.component';
import { ResponsiveImageComponent } from './responsive-image.component';

/** Success case card used on the home page and the success cases list. */
@Component({
  selector: 'app-success-case-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ResponsiveImageComponent, ImagePlaceholderComponent],
  template: `
    <article class="card">
      <div class="media">
        @if (successCase().coverImage; as cover) {
          <app-responsive-image [image]="cover" />
        } @else {
          <app-image-placeholder [label]="successCase().title" />
        }
      </div>
      <div class="body">
        <h3>
          <a [routerLink]="['/casos-de-exito', successCase().slug]">{{ successCase().title }}</a>
        </h3>
        <p class="muted">
          {{ successCase().clientName
          }}{{ successCase().eventLabel ? ' · ' + successCase().eventLabel : '' }}
        </p>
      </div>
    </article>
  `,
  styles: `
    .card {
      position: relative;
      height: 100%;
      padding: var(--space-3);
      background: var(--color-surface);
      box-shadow: var(--shadow);
      transition: transform 0.35s ease;
    }
    .card:hover {
      transform: translateY(-5px) rotate(0.6deg);
    }
    .media {
      aspect-ratio: 4 / 3;
      overflow: hidden;
    }
    .body {
      padding: var(--space-4) var(--space-2) var(--space-2);
      border-top: var(--stitch);
      margin-top: var(--space-3);
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
  `,
})
export class SuccessCaseCardComponent {
  readonly successCase = input.required<SuccessCaseSummary>();
}
