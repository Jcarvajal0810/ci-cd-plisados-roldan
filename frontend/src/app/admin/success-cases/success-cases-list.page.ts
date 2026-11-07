import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { map } from 'rxjs';
import { AdminApiClient } from '../../core/api/admin-api.client';
import { AdminContentListComponent, AdminListSource } from '../shared/admin-content-list.component';

/** All success cases, drafts included. */
@Component({
  selector: 'app-success-cases-list-admin-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AdminContentListComponent],
  template: `<app-admin-content-list
    [source]="source"
    heading="Casos de éxito"
    newLabel="Nuevo caso"
    newLink="/admin/casos/nuevo"
  />`,
})
export class SuccessCasesListPage {
  private readonly api = inject(AdminApiClient);

  protected readonly source: AdminListSource = {
    load: () =>
      this.api.successCases().pipe(
        map((cases) =>
          cases.map((c) => ({
            id: c.id,
            title: c.title,
            published: c.published,
            featured: c.featured,
            photoCount: c.images.length,
            editLink: ['/admin/casos', c.id],
          })),
        ),
      ),
    reorder: (ids) => this.api.reorderSuccessCases(ids),
    setPublished: (id, published) => this.api.setSuccessCasePublished(id, published),
    remove: (id) => this.api.deleteSuccessCase(id),
    deleteQuestion: (item) => `¿Eliminar el caso "${item.title}" y sus fotos?`,
  };
}
