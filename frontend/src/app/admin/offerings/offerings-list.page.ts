import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { map } from 'rxjs';
import { AdminApiClient } from '../../core/api/admin-api.client';
import { AdminContentListComponent, AdminListSource } from '../shared/admin-content-list.component';

/** All offerings, drafts included. */
@Component({
  selector: 'app-offerings-list-admin-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AdminContentListComponent],
  template: `<app-admin-content-list
    [source]="source"
    heading="Servicios"
    newLabel="Nuevo servicio"
    newLink="/admin/servicios/nuevo"
  />`,
})
export class OfferingsListPage {
  private readonly api = inject(AdminApiClient);

  protected readonly source: AdminListSource = {
    load: () =>
      this.api.offerings().pipe(
        map((offerings) =>
          offerings.map((o) => ({
            id: o.id,
            title: o.name,
            published: o.published,
            photoCount: o.images.length,
            editLink: ['/admin/servicios', o.id],
          })),
        ),
      ),
    reorder: (ids) => this.api.reorderOfferings(ids),
    setPublished: (id, published) => this.api.setOfferingPublished(id, published),
    remove: (id) => this.api.deleteOffering(id),
    deleteQuestion: (item) => `¿Eliminar el servicio "${item.title}" y sus fotos?`,
  };
}
