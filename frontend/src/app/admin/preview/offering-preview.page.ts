import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { AdminApiClient } from '../../core/api/admin-api.client';
import { OfferingDetailViewComponent } from '../../public/offerings/offering-detail-view.component';

/** Shows a draft exactly as visitors would see it once published (FR-022). */
@Component({
  selector: 'app-offering-preview-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, OfferingDetailViewComponent],
  template: `
    @if (offering.hasValue()) {
      @let item = offering.value();
      <p class="preview-banner" role="note">
        Vista previa{{ item.published ? '' : ' — borrador, no visible para los visitantes' }}.
        <a [routerLink]="['/admin/servicios', item.id]">Volver a editar</a>
      </p>
      <app-offering-detail-view [offering]="item" />
    } @else if (offering.error()) {
      <p class="error" role="alert">No pudimos cargar la vista previa.</p>
    }
  `,
  styles: `
    .preview-banner {
      padding: var(--space-3) var(--space-4);
      background: var(--color-brand-soft);
      border-radius: var(--radius);
    }
  `,
})
export class OfferingPreviewPage {
  readonly id = input.required<string>();

  private readonly api = inject(AdminApiClient);

  protected readonly offering = rxResource({
    params: () => Number(this.id()),
    stream: ({ params }) => this.api.offering(params),
  });
}
