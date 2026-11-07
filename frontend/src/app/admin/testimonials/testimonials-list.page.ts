import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { map } from 'rxjs';
import { AdminApiClient } from '../../core/api/admin-api.client';
import { AdminContentListComponent, AdminListSource } from '../shared/admin-content-list.component';

/** All testimonials, drafts included. Photos are optional, so no warning on publish. */
@Component({
  selector: 'app-testimonials-list-admin-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AdminContentListComponent],
  template: `<app-admin-content-list
    [source]="source"
    heading="Testimonios"
    newLabel="Nuevo testimonio"
    newLink="/admin/testimonios/nuevo"
  />`,
})
export class TestimonialsListPage {
  private readonly api = inject(AdminApiClient);

  protected readonly source: AdminListSource = {
    load: () =>
      this.api.testimonials().pipe(
        map((testimonials) =>
          testimonials.map((t) => ({
            id: t.id,
            title: t.clientName,
            published: t.published,
            featured: t.featured,
            editLink: ['/admin/testimonios', t.id],
          })),
        ),
      ),
    reorder: (ids) => this.api.reorderTestimonials(ids),
    setPublished: (id, published) => this.api.setTestimonialPublished(id, published),
    remove: (id) => this.api.deleteTestimonial(id),
    deleteQuestion: (item) => `¿Eliminar el testimonio de "${item.title}"?`,
  };
}
