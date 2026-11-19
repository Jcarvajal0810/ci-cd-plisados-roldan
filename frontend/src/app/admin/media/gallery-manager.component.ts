import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { AdminApiClient, GalleryPath } from '../../core/api/admin-api.client';
import { Image } from '../../core/api/models';
import { ConfirmService } from '../../shared/ui/confirm.service';
import { ACCEPT_ATTRIBUTE, imageFileProblem } from './image-file';


/** Upload, order, describe and remove the photos of one gallery (FR-017, FR-018). */
@Component({
  selector: 'app-gallery-manager',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="gallery">
      <h2>Fotos</h2>
      <ul class="photos" aria-label="Fotos">
        @for (image of images(); track image.id; let first = $first; let last = $last) {
          <li class="photo">
            <img [src]="image.url" [alt]="image.alt" width="160" height="120" />
            <label class="visually-hidden" [for]="'alt-' + image.id">Texto alternativo</label>
            <input
              [id]="'alt-' + image.id"
              [name]="'alt-' + image.id"
              [value]="image.alt"
              maxlength="150"
              placeholder="Describe la foto"
              (change)="saveAlt(image, $any($event.target).value)"
            />
            <div class="photo-actions">
              <button
                type="button"
                class="btn"
                [attr.aria-label]="'Subir ' + image.alt"
                [disabled]="first || busy()"
                (click)="move(image, -1)"
              >
                ↑
              </button>
              <button
                type="button"
                class="btn"
                [attr.aria-label]="'Bajar ' + image.alt"
                [disabled]="last || busy()"
                (click)="move(image, 1)"
              >
                ↓
              </button>
              <button
                type="button"
                class="btn btn-danger"
                [attr.aria-label]="'Eliminar ' + image.alt"
                [disabled]="busy()"
                (click)="remove(image)"
              >
                Eliminar
              </button>
            </div>
          </li>
        }
      </ul>
      <div class="field">
        <label for="gallery-upload">Agregar foto</label>
        <input
          id="gallery-upload"
          type="file"
          [accept]="accept"
          [disabled]="busy()"
          (change)="upload($event)"
        />
        <p class="hint">JPEG, PNG o WebP de hasta 10 MB. Máximo 12 fotos.</p>
        @if (message()) {
          <p class="error" role="alert">{{ message() }}</p>
        }
      </div>
    </section>
  `,
  styles: `
    .photos {
      display: grid;
      gap: var(--space-4);
      grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
      list-style: none;
      padding: 0;
    }
    .photo img {
      width: 100%;
      height: auto;
      aspect-ratio: 4 / 3;
      object-fit: cover;
      border-radius: var(--radius);
    }
    .photo input {
      width: 100%;
      margin-block: var(--space-2);
    }
    .photo-actions {
      display: flex;
      gap: var(--space-1);
    }
  `,
})
export class GalleryManagerComponent {
  readonly gallery = input.required<GalleryPath>();
  readonly images = input.required<Image[]>();
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
    this.run(this.api.uploadImage(this.gallery(), file), 'No pudimos subir la foto', () => {
      input.value = '';
    });
  }

  protected move(image: Image, offset: -1 | 1): void {
    const ids = this.images().map((i) => i.id);
    const from = ids.indexOf(image.id);
    [ids[from], ids[from + offset]] = [ids[from + offset], ids[from]];
    this.run(this.api.reorderImages(this.gallery(), ids), 'No pudimos cambiar el orden');
  }

  protected saveAlt(image: Image, altText: string): void {
    this.run(
      this.api.updateImageAlt(this.gallery(), image.id, altText.trim() || null),
      'No pudimos guardar el texto',
    );
  }

  protected async remove(image: Image): Promise<void> {
    if (await this.confirm.ask(`¿Eliminar la foto "${image.alt}"?`)) {
      this.run(this.api.deleteImage(this.gallery(), image.id), 'No pudimos eliminar la foto');
    }
  }

  private run(request: Observable<unknown>, failure: string, done?: () => void): void {
    this.busy.set(true);
    request.subscribe({
      next: () => {
        this.busy.set(false);
        done?.();
        this.changed.emit();
      },
      error: (error: { error?: { detail?: string } }) => {
        this.busy.set(false);
        this.message.set(error?.error?.detail ?? failure);
      },
    });
  }
}
