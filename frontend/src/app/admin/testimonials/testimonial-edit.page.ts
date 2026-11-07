import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminApiClient } from '../../core/api/admin-api.client';
import { AdminTestimonial, TestimonialInput } from '../../core/api/models';
import { SinglePhotoComponent } from '../media/single-photo.component';
import { fieldErrors } from '../shared/server-errors';
import { TestimonialFormComponent } from './testimonial-form.component';

/** Create (route "nuevo") or edit one testimonial, with its optional photo once it exists. */
@Component({
  selector: 'app-testimonial-edit-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TestimonialFormComponent, SinglePhotoComponent],
  template: `
    <p><a routerLink="/admin/testimonios">← Testimonios</a></p>
    <div class="page-head">
      <h1>{{ testimonial()?.clientName ?? 'Nuevo testimonio' }}</h1>
      @if (testimonial(); as current) {
        <button type="button" class="btn btn-primary" (click)="togglePublished(current)">
          {{ current.published ? 'Despublicar' : 'Publicar' }}
        </button>
      }
    </div>
    <p class="status" role="status">{{ status() }}</p>
    @if (error()) {
      <p class="error" role="alert">{{ error() }}</p>
    }

    <app-testimonial-form
      [value]="testimonial()"
      [serverErrors]="serverErrors()"
      (save)="save($event)"
    />

    @if (testimonial(); as current) {
      <app-single-photo
        [testimonialId]="current.id"
        [photo]="current.photo"
        (changed)="reload(current.id)"
      />
    }
  `,
})
export class TestimonialEditPage implements OnInit {
  readonly id = input<string>();

  private readonly api = inject(AdminApiClient);
  private readonly location = inject(Location);

  protected readonly testimonial = signal<AdminTestimonial | null>(null);
  protected readonly status = signal('');
  protected readonly error = signal('');
  protected readonly serverErrors = signal<Record<string, string>>({});

  ngOnInit(): void {
    const id = Number(this.id());
    if (id) {
      this.reload(id);
    }
  }

  protected save(input: TestimonialInput): void {
    const current = this.testimonial();
    const request = current
      ? this.api.updateTestimonial(current.id, input)
      : this.api.createTestimonial(input);
    this.serverErrors.set({});
    this.error.set('');
    request.subscribe({
      next: (saved) => {
        this.testimonial.set(saved);
        this.status.set('Guardado');
        if (!current) {
          this.location.replaceState(`/admin/testimonios/${saved.id}`);
        }
      },
      error: (error: unknown) => this.showError(error),
    });
  }

  protected togglePublished(current: AdminTestimonial): void {
    const publishing = !current.published;
    this.api.setTestimonialPublished(current.id, publishing).subscribe({
      next: () => {
        this.status.set(publishing ? 'Publicado' : 'Despublicado');
        this.reload(current.id);
      },
      error: (error: unknown) => this.showError(error),
    });
  }

  protected reload(id: number): void {
    this.api.testimonial(id).subscribe({
      next: (testimonial) => this.testimonial.set(testimonial),
      error: () => this.error.set('No pudimos cargar el testimonio.'),
    });
  }

  private showError(error: unknown): void {
    const errors = fieldErrors(error);
    this.serverErrors.set(errors ?? {});
    this.error.set(
      errors ? 'Revisa los campos marcados.' : 'No pudimos guardar. Inténtalo de nuevo.',
    );
  }
}
