import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Decorative tailor's tape measure that scrolls the names of the techniques. */
@Component({
  selector: 'app-tape-ribbon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="tape" aria-hidden="true">
      <div class="track">
        @for (round of rounds; track $index) {
          @for (word of words; track word) {
            <span class="word">{{ word }}</span
            ><span class="dot">✂</span>
          }
        }
      </div>
    </div>
  `,
  styles: `
    .tape {
      position: relative;
      overflow: hidden;
      transform: rotate(-1.5deg);
      margin-block: var(--space-6);
      background:
        repeating-linear-gradient(90deg, rgb(42 23 32 / 0.55) 0 1px, transparent 1px 10px) top /
          100% 9px no-repeat,
        repeating-linear-gradient(90deg, rgb(42 23 32 / 0.7) 0 1.5px, transparent 1.5px 50px) top /
          100% 15px no-repeat,
        repeating-linear-gradient(90deg, rgb(42 23 32 / 0.55) 0 1px, transparent 1px 10px) bottom /
          100% 9px no-repeat,
        linear-gradient(180deg, #f3d77f, #e9c25e);
      box-shadow: 0 10px 24px -14px rgb(74 22 48 / 0.6);
      border-block: 1px solid #c9a03f;
    }
    .track {
      display: flex;
      width: max-content;
      align-items: center;
      gap: var(--space-6);
      padding: 1.35rem var(--space-6);
      animation: slide 40s linear infinite;
    }
    .word {
      font-family: var(--font-display);
      font-style: italic;
      font-size: clamp(1.2rem, 3vw, 1.6rem);
      color: var(--color-text);
      white-space: nowrap;
    }
    .dot {
      color: var(--color-brand);
      font-size: 1.1rem;
    }
    @keyframes slide {
      to {
        transform: translateX(-50%);
      }
    }
  `,
})
export class TapeRibbonComponent {
  protected readonly rounds = [0, 1];
  protected readonly words = [
    'Plisado rotonda',
    'Acordeón',
    'Trillado',
    'Craquelado',
    'Nido de abeja',
    'Corte láser',
    'Grabado láser',
    'Faldas Plissee',
  ];
}
