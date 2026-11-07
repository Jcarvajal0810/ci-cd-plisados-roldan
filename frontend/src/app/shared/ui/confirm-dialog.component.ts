import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterRenderEffect,
  inject,
  viewChild,
} from '@angular/core';
import { ConfirmService } from './confirm.service';

/**
 * Modal confirmation rendered once in the admin layout. Focus moves to "Cancelar" (the safe
 * choice), Tab stays inside the dialog and Escape cancels.
 */
@Component({
  selector: 'app-confirm-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (confirm.pending(); as request) {
      <div class="backdrop">
        <div
          class="dialog"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="confirm-message"
          tabindex="-1"
          (keydown.escape)="confirm.answer(false)"
          (keydown.tab)="trapFocus($event)"
        >
          <p id="confirm-message">{{ request.message }}</p>
          <div class="actions">
            <button #cancel type="button" class="btn" (click)="confirm.answer(false)">
              Cancelar
            </button>
            <button type="button" class="btn btn-danger" (click)="confirm.answer(true)">
              {{ request.confirmLabel }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: `
    .backdrop {
      position: fixed;
      inset: 0;
      z-index: 30;
      display: grid;
      place-items: center;
      padding: var(--space-4);
      background: rgb(31 26 23 / 0.5);
    }
    .dialog {
      max-width: 28rem;
      padding: var(--space-6);
      background: var(--color-surface);
      border-radius: var(--radius);
      box-shadow: var(--shadow);
    }
    .actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--space-2);
    }
  `,
})
export class ConfirmDialogComponent {
  protected readonly confirm = inject(ConfirmService);
  private readonly cancel = viewChild<ElementRef<HTMLButtonElement>>('cancel');
  private readonly host = inject(ElementRef<HTMLElement>);

  constructor() {
    afterRenderEffect(() => this.cancel()?.nativeElement.focus());
  }

  protected trapFocus(event: Event): void {
    const buttons = Array.from(
      (this.host.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>('button'),
    );
    const shift = (event as KeyboardEvent).shiftKey;
    const current = buttons.indexOf(document.activeElement as HTMLButtonElement);
    const next = (current + (shift ? -1 : 1) + buttons.length) % buttons.length;
    buttons[next]?.focus();
    event.preventDefault();
  }
}
