import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminApiClient, successCaseGallery } from '../../core/api/admin-api.client';
import { AdminSuccessCase, SuccessCaseInput } from '../../core/api/models';
import { ConfirmService } from '../../shared/ui/confirm.service';
import { GalleryManagerComponent } from '../media/gallery-manager.component';
import { confirmPublication } from '../shared/publication';
import { fieldErrors } from '../shared/server-errors';
import { OfferingOption, SuccessCaseFormComponent } from './success-case-form.component';

/** Create (route "nuevo") or edit one success case, with its gallery once it exists. */
@Component({
  selector: 'app-success-case-edit-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, SuccessCaseFormComponent, GalleryManagerComponent],
  template: `
    <p><a routerLink="/admin/casos">← Casos de éxito</a></p>
    <div class="page-head">
      <h1>{{ successCase()?.title ?? 'Nuevo caso de éxito' }}</h1>
      @if (successCase(); as current) {
        <div class="item-actions">
          <a class="btn" [routerLink]="['/admin/vista-previa/casos', current.id]">Vista previa</a>
          <button type="button" class="btn btn-primary" (click)="togglePublished(current)">
            {{ current.published ? 'Despublicar' : 'Publicar' }}
          </button>
        </div>
      }
    </div>
    <p class="status" role="status">{{ status() }}</p>
    @if (error()) {
      <p class="error" role="alert">{{ error() }}</p>
    }

    <app-success-case-form
      [value]="successCase()"
      [offerings]="offerings()"
      [serverErrors]="serverErrors()"
      (save)="save($event)"
    />

    @if (successCase(); as current) {
      <app-gallery-manager
        [gallery]="gallery(current.id)"
        [images]="current.images"
        (changed)="reload(current.id)"
      />
    }
  `,
})
export class SuccessCaseEditPage implements OnInit {
  readonly id = input<string>();

  private readonly api = inject(AdminApiClient);
  private readonly confirm = inject(ConfirmService);
  private readonly location = inject(Location);

  protected readonly successCase = signal<AdminSuccessCase | null>(null);
  protected readonly offerings = signal<OfferingOption[]>([]);
  protected readonly status = signal('');
  protected readonly error = signal('');
  protected readonly serverErrors = signal<Record<string, string>>({});
  protected readonly gallery = successCaseGallery;

  ngOnInit(): void {
    this.api
      .offerings()
      .subscribe((offerings) =>
        this.offerings.set(offerings.map((o) => ({ id: o.id, name: o.name }))),
      );
    const id = Number(this.id());
    if (id) {
      this.reload(id);
    }
  }

  protected save(input: SuccessCaseInput): void {
    const current = this.successCase();
    const request = current
      ? this.api.updateSuccessCase(current.id, input)
      : this.api.createSuccessCase(input);
    this.serverErrors.set({});
    this.error.set('');
    request.subscribe({
      next: (saved) => {
        this.successCase.set(saved);
        this.status.set('Guardado');
        if (!current) {
          this.location.replaceState(`/admin/casos/${saved.id}`);
        }
      },
      error: (error: unknown) => this.showError(error),
    });
  }

  protected async togglePublished(current: AdminSuccessCase): Promise<void> {
    const publishing = !current.published;
    if (
      !(await confirmPublication(this.confirm, current.title, publishing, current.images.length))
    ) {
      return;
    }
    this.api.setSuccessCasePublished(current.id, publishing).subscribe({
      next: () => {
        this.status.set(publishing ? 'Publicado' : 'Despublicado');
        this.reload(current.id);
      },
      error: (error: unknown) => this.showError(error),
    });
  }

  protected reload(id: number): void {
    this.api.successCase(id).subscribe({
      next: (successCase) => this.successCase.set(successCase),
      error: () => this.error.set('No pudimos cargar el caso.'),
    });
  }

  private showError(error: unknown): void {
    const errors = fieldErrors(error);
    this.serverErrors.set(errors ?? {});
    this.error.set(
      errors ? 'Revisa los campos marcados.' : 'No pudimos guardar. Inténtalo de nuevo.',
    );
  }
}
