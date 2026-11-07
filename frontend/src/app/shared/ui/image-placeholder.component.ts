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
      aspect-ratio: 4 / 3;
      border-radius: var(--radius);
      background:
        repeating-linear-gradient(90deg, transparent 0 14px, rgb(122 46 58 / 0.06) 14px 16px),
        var(--color-brand-soft);
      color: var(--color-brand);
      font-family: var(--font-display);
      font-size: 3rem;
    }
  `,
})
export class ImagePlaceholderComponent {
  readonly label = input.required<string>();

  protected initial(): string {
    return this.label().trim().charAt(0).toUpperCase();
  }
}
