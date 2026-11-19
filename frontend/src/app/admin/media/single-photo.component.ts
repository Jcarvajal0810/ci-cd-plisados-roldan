import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { AdminApiClient } from '../../core/api/admin-api.client';
import { Image } from '../../core/api/models';
import { ConfirmService } from '../../shared/ui/confirm.service';
import { ACCEPT_ATTRIBUTE, imageFileProblem } from './image-file';

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
export class SinglePhotoComponent {
  readonly testimonialId = input.required<number>();
  readonly photo = input<Image | null | undefined>(null);
  readonly changed = output<void>();

  private readonly api = inject(AdminApiClient);
  private readonly confirm = inject(ConfirmService);

  protected readonly accept = ACCEPT_ATTRIBUTE;
  protected readonly busy = signal(false);
  protected readonly message = signal('');

  protected upload(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }
    const problem = imageFileProblem(file);
    this.message.set(problem);
    if (problem) {
      return;
    }
    this.busy.set(true);
    this.api.setTestimonialPhoto(this.testimonialId(), file).subscribe({
      next: () => {
        this.busy.set(false);
        input.value = '';
        this.changed.emit();
      },
      error: (error: { error?: { detail?: string } }) => {
        this.busy.set(false);
        this.message.set(error?.error?.detail ?? 'No pudimos subir la foto');
      },
    });
  }

  protected async remove(): Promise<void> {
    if (!(await this.confirm.ask('¿Quitar la foto de este testimonio?', 'Quitar'))) {
      return;
    }
    this.api.deleteTestimonialPhoto(this.testimonialId()).subscribe({
      next: () => this.changed.emit(),
      error: () => this.message.set('No pudimos quitar la foto'),
    });
  }
}
