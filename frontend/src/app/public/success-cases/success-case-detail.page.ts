import { ChangeDetectionStrategy, Component, effect, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { PublicApiClient } from '../../core/api/public-api.client';
import { NotFoundPage } from '../not-found/not-found.page';
import { SuccessCaseDetailViewComponent } from './success-case-detail-view.component';
import { SeoService, shareImage } from '../../core/seo/seo.service';

@Component({
  selector: 'app-success-case-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SuccessCaseDetailViewComponent, NotFoundPage],
  template: `
    @if (successCase.error()) {
      <section class="section">
        <div class="container"><p>No pudimos cargar este caso en este momento.</p></div>
      </section>
    } @else if (successCase.hasValue()) {
      @if (successCase.value(); as item) {
        <app-success-case-detail-view [successCase]="item" />
      } @else {
        <app-not-found-page />
      }
    }
  `,
})
export class SuccessCaseDetailPage {
  readonly slug = input.required<string>();

  private readonly api = inject(PublicApiClient);

  protected readonly successCase = rxResource({
    params: () => this.slug(),
    stream: ({ params }) => this.api.successCase(params),
  });

  constructor() {
    const seo = inject(SeoService);
    effect(() => {
      const item = this.successCase.hasValue() ? this.successCase.value() : null;
      if (item) {
        seo.update({
          title: `${item.title} · ${item.clientName}`,
          description: item.description,
          path: `/casos-de-exito/${item.slug}`,
          image: shareImage(item.coverImage),
        });
      }
    });
  }
}
