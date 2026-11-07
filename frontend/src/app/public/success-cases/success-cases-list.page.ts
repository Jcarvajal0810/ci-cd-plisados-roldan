import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { PublicApiClient } from '../../core/api/public-api.client';
import { SuccessCaseCardComponent } from '../../shared/ui/success-case-card.component';
import { SeoService } from '../../core/seo/seo.service';

@Component({
  selector: 'app-success-cases-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SuccessCaseCardComponent],
  template: `
    <section class="section">
      <div class="container">
        <h1>Casos de éxito</h1>
        <p class="muted intro">
          Pasarelas y colecciones de marcas que confiaron en nuestros acabados.
        </p>
        @if (cases.hasValue()) {
          <ul class="card-grid plain" aria-label="Casos de éxito">
            @for (item of cases.value(); track item.slug) {
              <li><app-success-case-card [successCase]="item" /></li>
            } @empty {
              <li class="muted">Pronto compartiremos nuestros casos de éxito.</li>
            }
          </ul>
        } @else if (cases.error()) {
          <p>No pudimos cargar los casos en este momento.</p>
        }
      </div>
    </section>
  `,
  styles: `
    .intro {
      max-width: 40rem;
    }
    .plain {
      list-style: none;
      margin: 0;
      padding: 0;
    }
  `,
})
export class SuccessCasesListPage {
  private readonly api = inject(PublicApiClient);

  protected readonly cases = rxResource({ stream: () => this.api.successCases() });

  constructor() {
    inject(SeoService).update({
      title: 'Casos de éxito · Plisados Roldán',
      description:
        'Pasarelas y colecciones de marcas que confiaron en los acabados plisados, trillados y láser de Plisados Roldán.',
      path: '/casos-de-exito',
    });
  }
}
