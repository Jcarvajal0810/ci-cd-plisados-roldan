import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LoginDialogService } from '../../core/auth/login-dialog.service';
import { LoginFormComponent } from './login-form.component';

/** Re-login without leaving the page when the session expires (the pending save is retried). */
@Component({
  selector: 'app-login-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LoginFormComponent],
  template: `
    @if (dialog.open()) {
      <div class="backdrop">
        <div
          class="dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="relogin-title"
          (keydown.escape)="dialog.resolve(false)"
        >
          <h2 id="relogin-title">Tu sesión expiró</h2>
          <p>Ingresa de nuevo; tus cambios se guardarán al continuar.</p>
          <app-login-form (loggedIn)="dialog.resolve(true)" />
          <button type="button" class="btn" (click)="dialog.resolve(false)">Cancelar</button>
        </div>
      </div>
    }
  `,
  styles: `
    .backdrop {
      position: fixed;
      inset: 0;
      z-index: 40;
      display: grid;
      place-items: center;
      padding: var(--space-4);
      background: rgb(31 26 23 / 0.5);
    }
    .dialog {
      width: min(26rem, 100%);
      padding: var(--space-6);
      background: var(--color-surface);
      border-radius: var(--radius);
    }
  `,
})
export class LoginDialogComponent {
  protected readonly dialog = inject(LoginDialogService);
}
