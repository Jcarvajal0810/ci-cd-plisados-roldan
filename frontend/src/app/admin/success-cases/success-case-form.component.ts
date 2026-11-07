import { ChangeDetectionStrategy, Component, effect, input, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SuccessCaseInput } from '../../core/api/models';
import { errorMessage, requiredText } from '../forms/form-errors';

export interface OfferingOption {
  id: number;
  name: string;
}

/** Success case fields with the data-model limits (title/client/event 120, description 5000). */
@Component({
  selector: 'app-success-case-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <form class="admin-form" [formGroup]="form" (submit)="submit($event)" novalidate>
      <div class="field">
        <label for="case-title">Título</label>
        <input id="case-title" name="title" formControlName="title" />
        <p class="error">{{ error('title') }}</p>
      </div>
      <div class="field">
        <label for="case-client">Cliente o marca</label>
        <input id="case-client" name="clientName" formControlName="clientName" />
        <p class="error">{{ error('clientName') }}</p>
      </div>
      <div class="field">
        <label for="case-description">Descripción</label>
        <textarea
          id="case-description"
          name="description"
          rows="8"
          formControlName="description"
        ></textarea>
        <p class="error">{{ error('description') }}</p>
      </div>
      <div class="field">
        <label for="case-event">Evento (opcional)</label>
        <input id="case-event" name="eventLabel" formControlName="eventLabel" />
        <p class="hint">Por ejemplo: "Pasarela Colombiamoda".</p>
        <p class="error">{{ error('eventLabel') }}</p>
      </div>
      <div class="field">
        <label for="case-date">Fecha (opcional)</label>
        <input id="case-date" name="eventDate" type="date" formControlName="eventDate" />
      </div>
      <div class="check">
        <input id="case-featured" name="featured" type="checkbox" formControlName="featured" />
        <label for="case-featured">Destacar en la página de inicio</label>
      </div>
      @if (offerings().length) {
        <fieldset>
          <legend>Servicios relacionados</legend>
          @for (offering of offerings(); track offering.id) {
            <div class="check">
              <input
                type="checkbox"
                [id]="'offering-' + offering.id"
                [name]="'offering-' + offering.id"
                [checked]="selected().has(offering.id)"
                (change)="toggle(offering.id)"
              />
              <label [for]="'offering-' + offering.id">{{ offering.name }}</label>
            </div>
          }
        </fieldset>
      }
      <button type="submit" class="btn btn-primary">Guardar</button>
    </form>
  `,
  styles: `
    .check {
      display: flex;
      gap: var(--space-2);
      align-items: center;
    }
    fieldset {
      border: 1px solid var(--color-border);
      border-radius: var(--radius);
      padding: var(--space-4);
    }
  `,
})
export class SuccessCaseFormComponent {
  readonly value = input<SuccessCaseInput | null>(null);
  readonly offerings = input<OfferingOption[]>([]);
  readonly serverErrors = input<Record<string, string>>({});
  readonly save = output<SuccessCaseInput>();

  protected readonly selected = signal(new Set<number>());
  protected readonly form = new FormGroup({
    title: new FormControl('', { nonNullable: true, validators: requiredText(120) }),
    clientName: new FormControl('', { nonNullable: true, validators: requiredText(120) }),
    description: new FormControl('', { nonNullable: true, validators: requiredText(5000) }),
    eventLabel: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(120)] }),
    eventDate: new FormControl('', { nonNullable: true }),
    featured: new FormControl(false, { nonNullable: true }),
  });

  constructor() {
    effect(() => {
      const value = this.value();
      if (value) {
        this.form.setValue({
          title: value.title,
          clientName: value.clientName,
          description: value.description,
          eventLabel: value.eventLabel ?? '',
          eventDate: value.eventDate ?? '',
          featured: value.featured ?? false,
        });
        this.selected.set(new Set(value.offeringIds ?? []));
      }
    });
  }

  protected toggle(id: number): void {
    const next = new Set(this.selected());
    if (!next.delete(id)) {
      next.add(id);
    }
    this.selected.set(next);
  }

  protected error(field: keyof typeof this.form.controls): string {
    return errorMessage(
      this.form.controls[field],
      { pattern: 'Este campo es obligatorio' },
      this.serverErrors()[field],
    );
  }

  protected submit(event: Event): void {
    event.preventDefault();
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }
    const v = this.form.getRawValue();
    this.save.emit({
      title: v.title.trim(),
      clientName: v.clientName.trim(),
      description: v.description.trim(),
      eventLabel: v.eventLabel.trim() || null,
      eventDate: v.eventDate || null,
      featured: v.featured,
      offeringIds: this.offerings()
        .map((o) => o.id)
        .filter((id) => this.selected().has(id)),
    });
  }
}
