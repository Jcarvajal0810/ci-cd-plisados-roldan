import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { ConfirmDialogComponent } from '../../shared/ui/confirm-dialog.component';
import { LoginDialogComponent } from '../login/login-dialog.component';

/** Shell for the authenticated admin area; never indexed by search engines. */
@Component({
  selector: 'app-admin-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    ConfirmDialogComponent,
    LoginDialogComponent,
  ],
  template: `
    <header class="admin-header">
      <div class="container bar">
        <strong>Plisados Roldán · Admin</strong>
        <nav aria-label="Administración">
          <a
            routerLink="/admin"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: true }"
            >Panel</a
          >
          <a routerLink="/admin/servicios" routerLinkActive="active">Servicios</a>
          <a routerLink="/admin/casos" routerLinkActive="active">Casos</a>
          <a routerLink="/admin/testimonios" routerLinkActive="active">Testimonios</a>
          <a routerLink="/admin/perfil" routerLinkActive="active">Perfil</a>
          <a href="/" target="_blank" rel="noopener">Ver sitio</a>
          <button type="button" class="btn" (click)="logout()">Cerrar sesión</button>
        </nav>
      </div>
    </header>
    <main class="container admin-main">
      <router-outlet />
    </main>
    <app-confirm-dialog />
    <app-login-dialog />
  `,
  styles: `
    .admin-header {
      background: var(--color-text);
      color: #fff;
    }
    .bar {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-4);
      align-items: center;
      justify-content: space-between;
      padding-block: var(--space-3);
    }
    nav {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-4);
      align-items: center;
    }
    nav a {
      color: #fff;
    }
    nav a.active {
      font-weight: 700;
    }
    .admin-main {
      padding-block: var(--space-8);
    }
  `,
})
export class AdminLayoutComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  constructor() {
    inject(Meta).updateTag({ name: 'robots', content: 'noindex, nofollow' });
  }

  protected logout(): void {
    this.auth.logout().subscribe(() => this.router.navigateByUrl('/admin/login'));
  }
}
