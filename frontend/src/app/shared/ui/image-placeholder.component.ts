import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Neutral stand-in shown when an item has no photo yet; announced with the item's name. */
@Component({
  selector: 'app-image-placeholder',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="placeholder" role="img" [attr.aria-label]="label()">
    <span aria-hidden="true">{{ initial() }}</span>
  </div>`,
  styles: `
    .placeholder {
      display: grid;
      place-items: center;
      width: 100%;
      height: 100%;
      min-height: 100%;
      aspect-ratio: 4 / 3;
      border-radius: var(--radius);
      background: repeating-conic-gradient(
        from 0deg at 50% 115%,
        var(--color-blush) 0 2.5deg,
        var(--color-lilac) 2.5deg 5deg
      );
      color: var(--color-brand);
      font-family: var(--font-script);
      font-size: 4.5rem;
      text-shadow: 0 2px 0 #fff;
    }
  `,
})
export class ImagePlaceholderComponent {
  readonly label = input.required<string>();

  protected initial(): string {
    return this.label().trim().charAt(0).toUpperCase();
  }
}
