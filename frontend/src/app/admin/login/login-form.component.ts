import { ChangeDetectionStrategy, Component, inject, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService, LOGIN_MESSAGES } from '../../core/auth/auth.service';

/** Email + password form shared by the login page and the session-expired dialog. */
@Component({
  selector: 'app-login-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <form class="admin-form" [formGroup]="form" (submit)="submit($event)" novalidate>
      <div class="field">
        <label for="login-email">Correo</label>
        <input id="login-email" type="email" autocomplete="username" formControlName="email" />
      </div>
      <div class="field">
        <label for="login-password">Contraseña</label>
        <input
          id="login-password"
          type="password"
          autocomplete="current-password"
          formControlName="password"
        />
      </div>
      @if (error()) {
        <p class="error" role="alert">{{ error() }}</p>
      }
      <button type="submit" class="btn btn-primary" [disabled]="busy()">Ingresar</button>
    </form>
  `,
})
export class LoginFormComponent {
  readonly loggedIn = output<void>();

  private readonly auth = inject(AuthService);

  protected readonly busy = signal(false);
  protected readonly error = signal('');
  protected readonly form = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  protected submit(event: Event): void {
    event.preventDefault();
    if (this.form.invalid) {
      this.error.set('Escribe tu correo y tu contraseña');
      return;
    }
    const { email, password } = this.form.getRawValue();
    this.busy.set(true);
    this.auth.login(email.trim(), password).subscribe((result) => {
      this.busy.set(false);
      if (result === 'ok') {
        this.error.set('');
        this.loggedIn.emit();
      } else {
        this.error.set(LOGIN_MESSAGES[result]);
      }
    });
  }
}
