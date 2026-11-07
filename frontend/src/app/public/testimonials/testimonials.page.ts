import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { PublicApiClient } from '../../core/api/public-api.client';
import { TestimonialCardComponent } from '../../shared/ui/testimonial-card.component';
import { SeoService } from '../../core/seo/seo.service';

@Component({
  selector: 'app-testimonials-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TestimonialCardComponent],
  template: `
    <section class="section">
      <div class="container">
        <h1>Testimonios</h1>
        @if (testimonials.hasValue()) {
          <ul class="card-grid plain" aria-label="Testimonios">
            @for (item of testimonials.value(); track $index) {
              <li><app-testimonial-card [testimonial]="item" /></li>
            } @empty {
              <li class="muted">Pronto compartiremos lo que dicen nuestros clientes.</li>
            }
          </ul>
        } @else if (testimonials.error()) {
          <p>No pudimos cargar los testimonios en este momento.</p>
        }
      </div>
    </section>
  `,
  styles: `
    .plain {
      list-style: none;
      margin: 0;
      padding: 0;
    }
  `,
})
export class TestimonialsPage {
  private readonly api = inject(PublicApiClient);

  protected readonly testimonials = rxResource({ stream: () => this.api.testimonials() });

  constructor() {
    inject(SeoService).update({
      title: 'Testimonios · Plisados Roldán',
      description:
        'Lo que dicen los diseñadores, marcas y confeccionistas que trabajan con Plisados Roldán.',
      path: '/testimonios',
    });
  }
}
