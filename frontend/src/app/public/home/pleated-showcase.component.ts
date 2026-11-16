import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  afterNextRender,
  inject,
  signal,
} from '@angular/core';

interface Piece {
  readonly src: string;
  readonly name: string;
}

const PLEATS = 12;

/**
 * Hero showcase: a photo hanging from a hanger, cut into fabric pleats that ripple. Photos
 * change on their own (pleat by pleat, like a curtain) and visitors can pick one with the
 * swatch buttons. Autoplay pauses on hover/focus and is off with reduced motion.
 */
@Component({
  selector: 'app-pleated-showcase',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="stage"
      (mouseenter)="paused.set(true)"
      (mouseleave)="paused.set(false)"
      (focusin)="paused.set(true)"
      (focusout)="paused.set(false)"
    >
      <div class="hang" aria-hidden="true">
        <svg class="hanger" viewBox="0 0 200 70">
          <path d="M100 30c0-9 13-9 13-18s-8-11-13-11-12 3-12 9" />
          <path d="M100 30 8 66h184L100 30Z" />
        </svg>
        <div class="frame">
          @for (piece of pieces; track piece.src; let p = $index) {
            <div class="layer" [class.on]="p === current()">
              @for (i of slices; track i) {
                <span
                  class="pleat"
                  [style.--i]="i"
                  [style.background-image]="'url(' + piece.src + ')'"
                  [style.background-position-x.%]="(i * 100) / (slices.length - 1)"
                ></span>
              }
            </div>
          }
        </div>
        <div class="tag">
          <span class="num">N.º {{ (current() + 1).toString().padStart(2, '0') }}</span>
          <span class="name">{{ pieces[current()].name }}</span>
        </div>
      </div>
      <ul class="swatches plain" aria-label="Elige una pieza">
        @for (piece of pieces; track piece.src; let p = $index) {
          <li>
            <button
              type="button"
              [attr.aria-label]="'Ver ' + piece.name"
              [attr.aria-pressed]="p === current()"
              [style.background-image]="'url(' + piece.src + ')'"
              (click)="current.set(p)"
            ></button>
          </li>
        }
      </ul>
    </div>
  `,
  styles: `
    .stage {
      display: grid;
      justify-items: center;
      gap: var(--space-6);
    }
    .hang {
      position: relative;
      width: min(100%, 25rem);
      animation: sway 7s ease-in-out infinite;
      transform-origin: 50% 0;
    }
    .hanger {
      display: block;
      width: 78%;
      margin: 0 auto -6px;
      fill: none;
      stroke: var(--color-brand-deep);
      stroke-width: 4;
      stroke-linejoin: round;
      stroke-linecap: round;
    }
    .frame {
      position: relative;
      aspect-ratio: 4 / 5;
      overflow: hidden;
      border-radius: 4px 4px 0 0;
      box-shadow: var(--shadow-lift);
      background: var(--color-lilac);
      -webkit-mask:
        var(--pinked) bottom / 16px 16px repeat-x,
        linear-gradient(#000 0 0) top / 100% calc(100% - 8px) no-repeat;
      mask:
        var(--pinked) bottom / 16px 16px repeat-x,
        linear-gradient(#000 0 0) top / 100% calc(100% - 8px) no-repeat;
    }
    .layer {
      position: absolute;
      inset: 0;
      display: flex;
    }
    .pleat {
      position: relative;
      flex: 1;
      background-size: 1200% 100%;
      background-repeat: no-repeat;
      transform: translateY(-104%);
      transition: transform 0.7s cubic-bezier(0.3, 0.8, 0.3, 1);
      transition-delay: calc((11 - var(--i)) * 25ms);
    }
    .pleat::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(
        90deg,
        rgb(255 255 255 / 0.28),
        rgb(255 255 255 / 0) 35%,
        rgb(42 23 32 / 0.08) 70%,
        rgb(42 23 32 / 0.34)
      );
      transition: opacity 0.6s ease;
    }
    .layer.on {
      z-index: 1;
    }
    .layer.on .pleat {
      transform: none;
      transition-delay: calc(var(--i) * 55ms);
      animation: ripple 5s ease-in-out calc(var(--i) * -0.4s) infinite;
    }
    .stage:hover .pleat::after {
      opacity: 0.35;
    }
    .tag {
      position: absolute;
      right: -0.5rem;
      bottom: 12%;
      z-index: 2;
      display: grid;
      padding: var(--space-2) var(--space-4) var(--space-2) var(--space-6);
      background: var(--color-surface);
      box-shadow: var(--shadow);
      clip-path: polygon(14px 0, 100% 0, 100% 100%, 14px 100%, 0 50%);
      rotate: -4deg;
    }
    .num {
      font-size: 0.7rem;
      letter-spacing: 0.2em;
      color: var(--color-muted);
    }
    .name {
      font-family: var(--font-script);
      font-size: 1.7rem;
      line-height: 1.1;
      color: var(--color-brand);
    }
    .swatches {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: var(--space-3);
    }
    button {
      width: 44px;
      height: 44px;
      padding: 0;
      border: 3px solid var(--color-surface);
      border-radius: 50%;
      background-size: cover;
      background-position: center;
      box-shadow: var(--shadow);
      cursor: pointer;
      transition:
        transform 0.25s ease,
        box-shadow 0.25s ease;
    }
    button:hover {
      transform: translateY(-3px);
    }
    button[aria-pressed='true'] {
      box-shadow:
        0 0 0 2px var(--color-surface),
        0 0 0 4px var(--color-brand);
      transform: scale(1.12);
    }
    @keyframes ripple {
      0%,
      100% {
        translate: 0 0;
        scale: 1 1;
      }
      50% {
        translate: 0 1.2%;
        scale: 0.97 1;
      }
    }
    @keyframes sway {
      0%,
      100% {
        rotate: -1.2deg;
      }
      50% {
        rotate: 1.2deg;
      }
    }
  `,
})
export class PleatedShowcaseComponent {
  protected readonly pieces: readonly Piece[] = [
    { src: 'galeria/falda-verde-larga.jpg', name: 'Falda verde' },
    { src: 'galeria/plisado-estampado.jpg', name: 'Estampado' },
    { src: 'galeria/falda-azul.jpg', name: 'Satín azul' },
    { src: 'galeria/plisado-metalico.jpg', name: 'Metalizado' },
    { src: 'galeria/faldas-florales.jpg', name: 'Flores' },
    { src: 'galeria/falda-rosa.jpg', name: 'Rosa palo' },
  ];
  protected readonly slices = Array.from({ length: PLEATS }, (_, i) => i);
  protected readonly current = signal(0);
  protected readonly paused = signal(false);

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }
      const timer = setInterval(() => {
        if (!this.paused()) {
          this.current.update((index) => (index + 1) % this.pieces.length);
        }
      }, 4500);
      destroyRef.onDestroy(() => clearInterval(timer));
    });
  }
}
