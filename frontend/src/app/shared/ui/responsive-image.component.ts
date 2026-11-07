import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Image } from '../../core/api/models';

/** Responsive image from the API's srcset; lazy unless it is the above-the-fold image. */
@Component({
  selector: 'app-responsive-image',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <img
      [src]="image().url"
      [attr.srcset]="image().srcset"
      [attr.sizes]="sizes()"
      [width]="image().width"
      [height]="image().height"
      [alt]="image().alt"
      [attr.loading]="priority() ? 'eager' : 'lazy'"
      [attr.fetchpriority]="priority() ? 'high' : null"
      decoding="async"
    />
  `,
  styles: `
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: var(--radius);
    }
  `,
})
export class ResponsiveImageComponent {
  readonly image = input.required<Image>();
  readonly sizes = input('(min-width: 64rem) 33vw, (min-width: 40rem) 50vw, 100vw');
  readonly priority = input(false);
}
