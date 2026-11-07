import { ChangeDetectionStrategy, Component, effect, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { PublicApiClient } from '../../core/api/public-api.client';
import { NotFoundPage } from '../not-found/not-found.page';
import { OfferingDetailViewComponent } from './offering-detail-view.component';
import { SeoService, shareImage } from '../../core/seo/seo.service';

@Component({
  selector: 'app-offering-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [OfferingDetailViewComponent, NotFoundPage],
  template: `
    @if (offering.error()) {
      <section class="section">
        <div class="container"><p>No pudimos cargar este servicio en este momento.</p></div>
      </section>
    } @else if (offering.hasValue()) {
      @if (offering.value(); as item) {
        <app-offering-detail-view [offering]="item" />
      } @else {
        <app-not-found-page />
      }
    }
  `,
})
export class OfferingDetailPage {
  readonly slug = input.required<string>();

  private readonly api = inject(PublicApiClient);

  protected readonly offering = rxResource({
    params: () => this.slug(),
    stream: ({ params }) => this.api.offering(params),
  });

  constructor() {
    const seo = inject(SeoService);
    effect(() => {
      const item = this.offering.hasValue() ? this.offering.value() : null;
      if (item) {
        seo.update({
          title: `${item.name} · Plisados Roldán`,
          description: item.summary,
          path: `/servicios/${item.slug}`,
          image: shareImage(item.coverImage),
        });
      }
    });
  }
}
