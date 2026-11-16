import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { PublicApiClient } from '../../core/api/public-api.client';
import { OfferingCardComponent } from '../../shared/ui/offering-card.component';
import { SeoService } from '../../core/seo/seo.service';

@Component({
  selector: 'app-offerings-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [OfferingCardComponent],
  template: `
    <section class="section">
      <div class="container">
        <header class="section-head">
          <span class="kicker">el taller</span>
          <h1>Servicios</h1>
          <p class="muted intro">
            Procesos textiles hechos en gran parte a mano, con la precisión que tu colección
            necesita.
          </p>
        </header>
        @if (offerings.hasValue()) {
          <ul class="card-grid plain" aria-label="Servicios">
            @for (offering of offerings.value(); track offering.slug; let first = $first) {
              <li><app-offering-card [offering]="offering" [priority]="first" /></li>
            }
          </ul>
        } @else if (offerings.error()) {
          <p>No pudimos cargar los servicios en este momento.</p>
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
export class OfferingsListPage {
  private readonly api = inject(PublicApiClient);

  protected readonly offerings = rxResource({ stream: () => this.api.offerings() });

  constructor() {
    inject(SeoService).update({
      title: 'Servicios · Plisados Roldán',
      description:
        'Plisado, trillado, craquelado, corte y grabado láser y faldas plisadas a la medida. Procesos textiles hechos a mano en Itagüí, Antioquia.',
      path: '/servicios',
    });
  }
}
