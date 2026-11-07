import { ChangeDetectionStrategy, Component, OnInit, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { ConfirmService } from '../../shared/ui/confirm.service';
import { confirmPublication } from './publication';

export interface AdminListItem {
  id: number;
  title: string;
  published: boolean;
  featured?: boolean;
  /** Number of photos; when set, publishing without photos asks first. */
  photoCount?: number;
  editLink: (string | number)[];
}

/** What a list page plugs in: how to load and change its kind of item. */
export interface AdminListSource {
  load(): Observable<AdminListItem[]>;
  reorder(ids: number[]): Observable<void>;
  setPublished(id: number, published: boolean): Observable<void>;
  remove(id: number): Observable<void>;
  deleteQuestion(item: AdminListItem): string;
}

/**
 * Ordered list of owner content with publish, reorder and confirmed delete (FR-015, FR-020).
 * Shared by services, success cases and testimonials.
 */
@Component({
  selector: 'app-admin-content-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="page-head">
      <h1>{{ heading() }}</h1>
      <a class="btn btn-primary" [routerLink]="newLink()">{{ newLabel() }}</a>
    </div>
    @if (message()) {
      <p class="error" role="alert">{{ message() }}</p>
    }
    <ul class="admin-list">
      @for (item of items(); track item.id; let first = $first; let last = $last) {
        <li>
          <div class="item-main">
            <a [routerLink]="item.editLink">{{ item.title }}</a>
            <span class="badge" [class.badge-live]="item.published">
              {{ item.published ? 'Publicado' : 'Borrador' }}
            </span>
            @if (item.featured) {
              <span class="badge">Destacado</span>
            }
            @if (item.photoCount !== undefined) {
              <span class="muted">{{ item.photoCount }} fotos</span>
            }
          </div>
          <div class="item-actions">
            <button
              type="button"
              class="btn"
              [attr.aria-label]="'Subir ' + item.title"
              [disabled]="first"
              (click)="move(item, -1)"
            >
              ↑
            </button>
            <button
              type="button"
              class="btn"
              [attr.aria-label]="'Bajar ' + item.title"
              [disabled]="last"
              (click)="move(item, 1)"
            >
              ↓
            </button>
            <button
              type="button"
              class="btn"
              [attr.aria-label]="(item.published ? 'Despublicar ' : 'Publicar ') + item.title"
              (click)="togglePublished(item)"
            >
              {{ item.published ? 'Despublicar' : 'Publicar' }}
            </button>
            <button
              type="button"
              class="btn btn-danger"
              [attr.aria-label]="'Eliminar ' + item.title"
              (click)="remove(item)"
            >
              Eliminar
            </button>
          </div>
        </li>
      } @empty {
        <li class="muted">Todavía no hay elementos.</li>
      }
    </ul>
  `,
})
export class AdminContentListComponent implements OnInit {
  readonly source = input.required<AdminListSource>();
  readonly heading = input.required<string>();
  readonly newLabel = input.required<string>();
  readonly newLink = input.required<string>();

  private readonly confirm = inject(ConfirmService);

  protected readonly items = signal<AdminListItem[]>([]);
  protected readonly message = signal('');

  ngOnInit(): void {
    this.load();
  }

  protected move(item: AdminListItem, offset: -1 | 1): void {
    const ids = this.items().map((i) => i.id);
    const from = ids.indexOf(item.id);
    [ids[from], ids[from + offset]] = [ids[from + offset], ids[from]];
    this.run(this.source().reorder(ids));
  }

  protected async togglePublished(item: AdminListItem): Promise<void> {
    const publishing = !item.published;
    if (await confirmPublication(this.confirm, item.title, publishing, item.photoCount)) {
      this.run(this.source().setPublished(item.id, publishing));
    }
  }

  protected async remove(item: AdminListItem): Promise<void> {
    if (await this.confirm.ask(this.source().deleteQuestion(item))) {
      this.run(this.source().remove(item.id));
    }
  }

  private run(request: Observable<void>): void {
    request.subscribe({
      next: () => this.load(),
      error: () => this.message.set('No pudimos guardar el cambio. Inténtalo de nuevo.'),
    });
  }

  private load(): void {
    this.source()
      .load()
      .subscribe({
        next: (items) => this.items.set(items),
        error: () => this.message.set('No pudimos cargar la lista.'),
      });
  }
}
