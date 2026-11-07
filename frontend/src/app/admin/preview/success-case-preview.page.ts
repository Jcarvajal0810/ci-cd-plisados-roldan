import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { AdminApiClient } from '../../core/api/admin-api.client';
import { SuccessCaseDetailViewComponent } from '../../public/success-cases/success-case-detail-view.component';

/** Shows a success case exactly as visitors would see it once published (FR-022). */
@Component({
  selector: 'app-success-case-preview-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, SuccessCaseDetailViewComponent],
  template: `
    @if (successCase.hasValue()) {
      @let item = successCase.value();
      <p class="preview-banner" role="note">
        Vista previa{{ item.published ? '' : ' — borrador, no visible para los visitantes' }}.
        <a [routerLink]="['/admin/casos', item.id]">Volver a editar</a>
      </p>
      <app-success-case-detail-view [successCase]="item" />
    } @else if (successCase.error()) {
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
export class SuccessCasePreviewPage {
  readonly id = input.required<string>();

  private readonly api = inject(AdminApiClient);

  protected readonly successCase = rxResource({
    params: () => Number(this.id()),
    stream: ({ params }) => this.api.successCase(params),
  });
}
