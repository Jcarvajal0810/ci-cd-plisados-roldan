import { ChangeDetectionStrategy, Component } from '@angular/core';

interface Process {
  readonly name: string;
  readonly note: string;
  readonly image: string;
  readonly alt: string;
}

/** The workshop's techniques shown as a swatch book of fabric samples (scrolls sideways). */
@Component({
  selector: 'app-process-swatches',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ol class="book plain" aria-label="Procesos del taller" tabindex="0">
      @for (process of processes; track process.name; let i = $index) {
        <li class="swatch" [style.--tilt.deg]="i % 2 ? 1.2 : -1.2">
          <figure>
            <div class="photo">
              <img
                [src]="process.image"
                [alt]="process.alt"
                width="420"
                height="420"
                loading="lazy"
                decoding="async"
              />
            </div>
            <figcaption>
              <span class="num">N.º {{ (i + 1).toString().padStart(2, '0') }}</span>
              <h3>{{ process.name }}</h3>
              <p>{{ process.note }}</p>
            </figcaption>
          </figure>
        </li>
      }
    </ol>
  `,
  styles: `
    .book {
      display: grid;
      grid-auto-flow: column;
      grid-auto-columns: min(78%, 19rem);
      gap: var(--space-6);
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      padding: var(--space-6) var(--space-4) var(--space-8);
      margin-inline: calc(var(--space-4) * -1);
      scrollbar-color: var(--color-brand) transparent;
    }
    .swatch {
      scroll-snap-align: center;
      transform: rotate(var(--tilt));
      transition: transform 0.4s ease;
    }
    .swatch:hover {
      transform: rotate(0) translateY(-6px);
    }
    figure {
      position: relative;
      height: 100%;
      margin: 0;
      padding: var(--space-3) var(--space-3) var(--space-6);
      background: var(--color-surface);
      box-shadow: var(--shadow);
      -webkit-mask:
        var(--pinked) bottom / 14px 14px repeat-x,
        linear-gradient(#000 0 0) top / 100% calc(100% - 7px) no-repeat;
      mask:
        var(--pinked) bottom / 14px 14px repeat-x,
        linear-gradient(#000 0 0) top / 100% calc(100% - 7px) no-repeat;
    }
    figure::before {
      content: '';
      position: absolute;
      z-index: 1;
      top: -4px;
      left: 50%;
      width: 64px;
      height: 22px;
      translate: -50% 0;
      rotate: -3deg;
      background: rgb(244 198 193 / 0.75);
      box-shadow: 0 1px 2px rgb(0 0 0 / 0.1);
    }
    .photo {
      aspect-ratio: 1;
      overflow: hidden;
    }
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.7s ease;
    }
    .swatch:hover img {
      transform: scale(1.08) rotate(1deg);
    }
    figcaption {
      padding: var(--space-4) var(--space-2) 0;
    }
    .num {
      font-size: 0.75rem;
      letter-spacing: 0.2em;
      color: var(--color-muted);
    }
    h3 {
      font-family: var(--font-script);
      font-size: 2.3rem;
      font-weight: 400;
      line-height: 1.1;
      color: var(--color-brand);
      margin: var(--space-1) 0 var(--space-2);
    }
    p {
      margin: 0;
      color: var(--color-muted);
    }
    @media (min-width: 64rem) {
      .book {
        grid-auto-columns: 17rem;
        margin-inline: 0;
        padding-inline: var(--space-2);
      }
    }
  `,
})
export class ProcessSwatchesComponent {
  protected readonly processes: readonly Process[] = [
    {
      name: 'Plisado Rotonda',
      note: 'El favorito de todas. Se usa especialmente en faldas, donde se aprecia toda su belleza.',
      image: 'galeria/proc-rotonda.jpg',
      alt: 'Tela verde menta con plisado rotonda abierto en abanico',
    },
    {
      name: 'Plisado Acordeón',
      note: 'De líneas rectas y sencillas. Toda una belleza.',
      image: 'galeria/proc-acordeon.jpg',
      alt: 'Tela estampada con plisado acordeón',
    },
    {
      name: 'Trillado',
      note: 'Delicado y hermoso: pliegues que dan textura y movimiento.',
      image: 'galeria/proc-trillado.jpg',
      alt: 'Tela gris con trillado en diagonal',
    },
    {
      name: 'Trillado Bolero',
      note: 'Pliegue fino que se suelta en la caída y da volumen al borde.',
      image: 'galeria/proc-trillado-bolero.jpg',
      alt: 'Tela gris clara con trillado bolero',
    },
    {
      name: 'Nido de abeja y acordeón',
      note: 'Dos técnicas combinadas en una misma pieza: relieve en zigzag y pliegue recto.',
      image: 'galeria/proc-nido-acordeon.jpg',
      alt: 'Telas fucsia y azul con combinado de nido de abeja y acordeón',
    },
    {
      name: 'Craquelado',
      note: 'Superficie ondulada y quebrada que hace única cada pieza.',
      image: 'galeria/proc-craquelado.jpg',
      alt: 'Tela gris con textura craquelada',
    },
    {
      name: 'Corte Láser',
      note: 'Bordes limpios y formas exactas sobre telas y otros materiales.',
      image: 'galeria/proc-corte-laser.jpg',
      alt: 'Cabezal de corte láser trabajando sobre tela blanca',
    },
  ];
}
