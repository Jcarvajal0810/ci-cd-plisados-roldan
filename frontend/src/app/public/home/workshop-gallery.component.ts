import { ChangeDetectionStrategy, Component } from '@angular/core';

interface Shot {
  readonly src: string;
  readonly alt: string;
  readonly caption: string;
  readonly shape?: 'tall' | 'wide';
}

/** Mosaic of workshop, runway and finished-piece photos. */
@Component({
  selector: 'app-workshop-gallery',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ul class="mosaic plain" aria-label="Fotos del taller">
      @for (shot of shots; track shot.src) {
        <li [class]="shot.shape ?? ''">
          <figure>
            <img
              [src]="shot.src"
              [alt]="shot.alt"
              width="300"
              height="400"
              loading="lazy"
              decoding="async"
            />
            <figcaption>{{ shot.caption }}</figcaption>
          </figure>
        </li>
      }
    </ul>
  `,
  styles: `
    .mosaic {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      grid-auto-rows: 11rem;
      grid-auto-flow: dense;
      gap: var(--space-3);
    }
    .tall {
      grid-row: span 2;
    }
    .wide {
      grid-column: span 2;
    }
    figure {
      position: relative;
      height: 100%;
      margin: 0;
      overflow: hidden;
      border: 6px solid var(--color-surface);
      box-shadow: var(--shadow);
    }
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition:
        transform 0.8s ease,
        filter 0.8s ease;
    }
    figcaption {
      position: absolute;
      inset: auto 0 0;
      padding: var(--space-6) var(--space-3) var(--space-2);
      color: #fff;
      font-family: var(--font-script);
      font-size: 1.6rem;
      line-height: 1.1;
      background: linear-gradient(transparent, rgb(42 23 32 / 0.8));
      transform: translateY(35%);
      opacity: 0;
      transition:
        transform 0.45s ease,
        opacity 0.45s ease;
    }
    figure:hover img,
    figure:focus-within img {
      transform: scale(1.07);
      filter: saturate(1.15);
    }
    figure:hover figcaption,
    figure:focus-within figcaption {
      transform: none;
      opacity: 1;
    }
    @media (hover: none) {
      figcaption {
        transform: none;
        opacity: 1;
        font-size: 1.3rem;
      }
    }
    @media (min-width: 48rem) {
      .mosaic {
        grid-template-columns: repeat(4, 1fr);
        grid-auto-rows: 13rem;
        gap: var(--space-4);
      }
    }
  `,
})
export class WorkshopGalleryComponent {
  protected readonly shots: readonly Shot[] = [
    {
      src: 'galeria/plisado-a-mano.jpg',
      alt: 'Manos plisando tela beige sobre la mesa del taller',
      caption: 'Hecho a mano',
      shape: 'tall',
    },
    {
      src: 'galeria/pasarela.jpg',
      alt: 'Desfile de moda con prendas plisadas en pasarela',
      caption: 'En pasarela',
      shape: 'wide',
    },
    {
      src: 'galeria/falda-rosa-puesta.jpg',
      alt: 'Falda plisada rosa de la línea Plissee',
      caption: 'Línea Plissee',
      shape: 'tall',
    },
    {
      src: 'galeria/plisado-dorado.jpg',
      alt: 'Tela dorada plisada abierta en abanico',
      caption: 'Plisado dorado',
    },
    {
      src: 'galeria/equipo.jpg',
      alt: 'Equipo de Plisados Roldán en un evento de moda',
      caption: 'Nuestro equipo',
      shape: 'wide',
    },
    {
      src: 'galeria/plisado-estampado-espiral.jpg',
      alt: 'Tela estampada plisada en espiral',
      caption: 'Estampados',
    },
    {
      src: 'galeria/faldas-florales.jpg',
      alt: 'Tres faldas plisadas con estampado floral',
      caption: 'Faldas florales',
      shape: 'tall',
    },
    {
      src: 'galeria/volantes.jpg',
      alt: 'Volantes plisados en tonos oscuros y rosa',
      caption: 'Volantes',
    },
    {
      src: 'galeria/plisado-cuero.jpg',
      alt: 'Material tipo cuero beige con pliegues amplios',
      caption: 'Cuero plisado',
    },
    {
      src: 'galeria/plisado-metalico.jpg',
      alt: 'Tela metalizada con plisado fino',
      caption: 'Metalizados',
      shape: 'wide',
    },
  ];
}
