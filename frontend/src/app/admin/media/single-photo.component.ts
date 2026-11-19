import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Image } from '../../core/api/models';
import { MediaEditor } from './media-editor';

/** The single optional photo of a testimonial: set, replace or remove. */
@Component({
  selector: 'app-single-photo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section>
      <h2>Foto (opcional)</h2>
      @if (photo(); as current) {
        <img [src]="current.url" [alt]="current.alt" width="120" height="120" />
        <button
          type="button"
          class="btn btn-danger"
          aria-label="Quitar foto"
          [disabled]="busy()"
          (click)="remove()"
        >
          Quitar
        </button>
      }
      <div class="field">
        <label for="single-photo-upload">{{ photo() ? 'Cambiar foto' : 'Agregar foto' }}</label>
        <input
          id="single-photo-upload"
          type="file"
          [accept]="accept"
          [disabled]="busy()"
          (change)="upload($event)"
        />
        <p class="hint">JPEG, PNG o WebP de hasta 10 MB.</p>
        @if (message()) {
          <p class="error" role="alert">{{ message() }}</p>
        }
      </div>
    </section>
  `,
  styles: `
    img {
      width: 120px;
      height: 120px;
      object-fit: cover;
      border-radius: 50%;
    }
  `,
})
export class SinglePhotoComponent extends MediaEditor {
  readonly testimonialId = input.required<number>();
  readonly photo = input<Image | null | undefined>(null);

  protected async remove(): Promise<void> {
    if (await this.confirm.ask('¿Quitar la foto de este testimonio?', 'Quitar')) {
      this.run(this.api.deleteTestimonialPhoto(this.testimonialId()), 'No pudimos quitar la foto');
    }
  }

  protected upload(event: Event): void {
    this.uploadChosen(event, (file) => this.api.setTestimonialPhoto(this.testimonialId(), file));
  }
}
