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
  `,
})
export class SuccessCaseCardComponent {
  readonly successCase = input.required<SuccessCaseSummary>();
}
