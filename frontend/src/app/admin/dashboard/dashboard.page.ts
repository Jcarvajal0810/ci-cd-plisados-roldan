import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { AdminApiClient } from '../../core/api/admin-api.client';

@Component({
  selector: 'app-dashboard-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <h1>Panel</h1>
    <ul class="card-grid plain">
      <li class="admin-card">
        <h2><a routerLink="/admin/servicios">Servicios</a></h2>
        <p>{{ counts().published }} publicados · {{ counts().drafts }} borradores</p>
      </li>
      <li class="admin-card">
        <h2><a routerLink="/admin/perfil">Perfil del negocio</a></h2>
        <p>Nosotros, WhatsApp, ubicación y horario.</p>
      </li>
    </ul>
  `,
  styles: `
    .plain {
      list-style: none;
      padding: 0;
    }
    .admin-card {
      padding: var(--space-6);
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius);
    }
  `,
})
export class DashboardPage {
  private readonly api = inject(AdminApiClient);
  private readonly offerings = rxResource({ stream: () => this.api.offerings() });

  protected readonly counts = computed(() => {
    const items = this.offerings.hasValue() ? this.offerings.value() : [];
    const published = items.filter((o) => o.published).length;
    return { published, drafts: items.length - published };
  });
}
