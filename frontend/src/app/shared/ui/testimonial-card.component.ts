import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Testimonial } from '../../core/api/models';

/** A client quote with name, optional company and optional photo. */
@Component({
  selector: 'app-testimonial-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <figure class="testimonial">
      <blockquote>“{{ testimonial().quote }}”</blockquote>
      <figcaption>
        @if (testimonial().photo; as photo) {
          <img
            [src]="photo.url"
            [alt]="photo.alt"
            width="56"
            height="56"
            loading="lazy"
            decoding="async"
          />
        }
        <span>
          <strong>{{ testimonial().clientName }}</strong>
          @if (testimonial().company) {
            <span class="muted"> · {{ testimonial().company }}</span>
          }
        </span>
      </figcaption>
    </figure>
  `,
  styles: `
    .testimonial {
      position: relative;
      height: 100%;
      margin: 0;
      padding: var(--space-8) var(--space-6) var(--space-6);
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      outline: var(--stitch);
      outline-offset: -10px;
    }
    .testimonial::before {
      content: '“';
      position: absolute;
      top: -0.3em;
      left: var(--space-4);
      font-family: var(--font-display);
      font-size: 5rem;
      line-height: 1;
      color: var(--color-blush);
    }
    blockquote {
      margin: 0 0 var(--space-4);
      font-family: var(--font-display);
      font-style: italic;
      font-size: 1.15rem;
    }
    figcaption {
      display: flex;
      gap: var(--space-3);
      align-items: center;
    }
    img {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      object-fit: cover;
      box-shadow: 0 0 0 3px var(--color-blush);
    }
  `,
})
export class TestimonialCardComponent {
  readonly testimonial = input.required<Testimonial>();
}
