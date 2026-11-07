import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminApiClient, offeringGallery } from '../../core/api/admin-api.client';
import { AdminOffering, OfferingInput } from '../../core/api/models';
import { ConfirmService } from '../../shared/ui/confirm.service';
import { GalleryManagerComponent } from '../media/gallery-manager.component';
import { confirmPublication } from '../shared/publication';
import { fieldErrors } from '../shared/server-errors';
import { OfferingFormComponent } from './offering-form.component';

/** Create (route "nuevo") or edit one offering, with its gallery once it exists. */
@Component({
  selector: 'app-offering-edit-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, OfferingFormComponent, GalleryManagerComponent],
  template: `
    <p><a routerLink="/admin/servicios">← Servicios</a></p>
    <div class="page-head">
      <h1>{{ offering()?.name ?? 'Nuevo servicio' }}</h1>
      @if (offering(); as current) {
        <div class="item-actions">
          <a class="btn" [routerLink]="['/admin/vista-previa/servicios', current.id]">
            Vista previa
          </a>
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

    <app-offering-form [value]="offering()" [serverErrors]="serverErrors()" (save)="save($event)" />

    @if (offering(); as current) {
      <app-gallery-manager
        [gallery]="gallery(current.id)"
        [images]="current.images"
        (changed)="reload(current.id)"
      />
    }
  `,
})
export class OfferingEditPage implements OnInit {
  /** Route parameter; absent on the "nuevo" route. */
  readonly id = input<string>();

  private readonly api = inject(AdminApiClient);
  private readonly confirm = inject(ConfirmService);
  private readonly location = inject(Location);

  protected readonly offering = signal<AdminOffering | null>(null);
  protected readonly status = signal('');
  protected readonly error = signal('');
  protected readonly serverErrors = signal<Record<string, string>>({});
  protected readonly gallery = offeringGallery;

  ngOnInit(): void {
    const id = Number(this.id());
    if (id) {
      this.reload(id);
    }
  }

  protected save(input: OfferingInput): void {
    const current = this.offering();
    const request = current
      ? this.api.updateOffering(current.id, input)
      : this.api.createOffering(input);
    this.serverErrors.set({});
    this.error.set('');
    request.subscribe({
      next: (saved) => {
        this.offering.set(saved);
        this.status.set('Guardado');
        if (!current) {
          this.location.replaceState(`/admin/servicios/${saved.id}`);
        }
      },
      error: (error: unknown) => this.showError(error),
    });
  }

  protected async togglePublished(current: AdminOffering): Promise<void> {
    const publishing = !current.published;
    if (
      !(await confirmPublication(this.confirm, current.name, publishing, current.images.length))
    ) {
      return;
    }
    this.api.setOfferingPublished(current.id, publishing).subscribe({
      next: () => {
        this.status.set(publishing ? 'Publicado' : 'Despublicado');
        this.reload(current.id);
      },
      error: (error: unknown) => this.showError(error),
    });
  }

  protected reload(id: number): void {
    this.api.offering(id).subscribe({
      next: (offering) => this.offering.set(offering),
      error: () => this.error.set('No pudimos cargar el servicio.'),
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
