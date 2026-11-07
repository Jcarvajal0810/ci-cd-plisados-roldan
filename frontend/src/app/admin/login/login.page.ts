import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { LoginFormComponent } from './login-form.component';

@Component({
  selector: 'app-login-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LoginFormComponent],
  template: `
    <main class="login container">
      <h1>Administración</h1>
      <p class="muted">Plisados Roldán</p>
      <app-login-form (loggedIn)="continue()" />
    </main>
  `,
  styles: `
    .login {
      max-width: 24rem;
      padding-block: var(--space-12);
    }
  `,
})
export class LoginPage {
  readonly returnUrl = input<string>();

  private readonly router = inject(Router);

  protected continue(): void {
    const target = this.returnUrl();
    // Only follow in-app admin paths (no open redirects).
    this.router.navigateByUrl(target?.startsWith('/admin') ? target : '/admin');
  }
}
