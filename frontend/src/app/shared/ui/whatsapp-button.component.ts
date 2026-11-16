import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Link that opens a WhatsApp chat in a new tab (FR-006). */
@Component({
  selector: 'app-whatsapp-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a
      class="whatsapp"
      [class.floating]="variant() === 'floating'"
      [href]="href()"
      target="_blank"
      rel="noopener"
      [attr.data-testid]="testId()"
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22">
        <path
          fill="currentColor"
          d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.4a.5.5 0 0 0 0-.4l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3Z"
        />
      </svg>
      <span [class.visually-hidden]="variant() === 'floating'">{{ label() }}</span>
    </a>
  `,
  styles: `
    .whatsapp {
      position: relative;
      isolation: isolate;
      overflow: hidden;
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      min-height: 48px;
      padding: var(--space-3) var(--space-6);
      border-radius: 2px 18px 2px 18px;
      background: var(--color-whatsapp);
      color: #fff;
      font-weight: 500;
      letter-spacing: 0.04em;
      text-decoration: none;
      box-shadow: var(--shadow);
      transition:
        transform 0.25s ease,
        box-shadow 0.25s ease;
    }
    .whatsapp::before {
      content: '';
      position: absolute;
      inset: 4px;
      border: 1px dashed rgb(255 255 255 / 0.55);
      border-radius: inherit;
      pointer-events: none;
    }
    .whatsapp::after {
      content: '';
      position: absolute;
      inset: 0;
      z-index: -1;
      background: linear-gradient(
        105deg,
        transparent 35%,
        rgb(255 255 255 / 0.3) 50%,
        transparent 65%
      );
      transform: translateX(-120%);
      transition: transform 0.7s ease;
    }
    .whatsapp:hover {
      transform: translateY(-2px) rotate(-0.8deg);
      box-shadow: var(--shadow-lift);
    }
    .whatsapp:hover::after {
      transform: translateX(120%);
    }
    .floating {
      position: fixed;
      right: var(--space-4);
      bottom: var(--space-4);
      z-index: 25;
      width: 60px;
      height: 60px;
      padding: 0;
      justify-content: center;
      overflow: visible;
      border-radius: 50%;
    }
    .floating::before {
      inset: -7px;
      border: 2px dashed var(--color-whatsapp);
      border-radius: 50%;
      animation: spin 14s linear infinite;
    }
    .floating::after {
      display: none;
    }
    .floating:hover {
      transform: scale(1.06);
    }
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  `,
})
export class WhatsAppButtonComponent {
  readonly href = input.required<string>();
  readonly label = input('Escríbenos por WhatsApp');
  readonly variant = input<'inline' | 'floating'>('inline');
  readonly testId = input<string | null>(null);
}
