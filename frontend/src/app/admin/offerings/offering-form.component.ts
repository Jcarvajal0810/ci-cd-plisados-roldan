import { ChangeDetectionStrategy, Component, effect, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { OfferingInput } from '../../core/api/models';
import { errorMessage, requiredText } from '../forms/form-errors';

const PRICE_MESSAGE = 'El precio debe ser un número entero mayor que cero';

/** Offering fields with the data-model limits (name 80, summary 200, description 5000). */
@Component({
  selector: 'app-offering-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <form class="admin-form" [formGroup]="form" (submit)="submit($event)" novalidate>
      <div class="field">
        <label for="offering-name">Nombre</label>
        <input id="offering-name" name="name" formControlName="name" />
        <p class="error">{{ error('name') }}</p>
      </div>
      <div class="field">
        <label for="offering-summary">Resumen</label>
        <input id="offering-summary" name="summary" formControlName="summary" />
        <p class="hint">Aparece en las tarjetas y en Google (máximo 200 caracteres).</p>
        <p class="error">{{ error('summary') }}</p>
      </div>
      <div class="field">
        <label for="offering-description">Descripción</label>
        <textarea
          id="offering-description"
          name="description"
          rows="8"
          formControlName="description"
        ></textarea>
        <p class="error">{{ error('description') }}</p>
      </div>
      <div class="field">
        <label for="offering-price">Precio de referencia (COP, opcional)</label>
        <input
          id="offering-price"
          name="referencePriceCop"
          inputmode="numeric"
          formControlName="referencePriceCop"
        />
        <p class="hint">Se muestra como "Desde $ X COP". Déjalo vacío para no mostrar precio.</p>
        <p class="error">{{ error('referencePriceCop') }}</p>
      </div>
      <button type="submit" class="btn btn-primary">Guardar</button>
    </form>
  `,
})
export class OfferingFormComponent {
  readonly value = input<OfferingInput | null>(null);
  readonly serverErrors = input<Record<string, string>>({});
  readonly save = output<OfferingInput>();

  protected readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: requiredText(80) }),
    summary: new FormControl('', { nonNullable: true, validators: requiredText(200) }),
    description: new FormControl('', { nonNullable: true, validators: requiredText(5000) }),
    referencePriceCop: new FormControl('', {
      nonNullable: true,
      validators: [Validators.pattern(/^\s*([1-9][0-9]*)?\s*$/)],
    }),
  });

  constructor() {
    effect(() => {
      const value = this.value();
      if (value) {
        this.form.setValue({
          name: value.name,
          summary: value.summary,
          description: value.description,
          referencePriceCop: value.referencePriceCop?.toString() ?? '',
        });
      }
    });
  }

  protected error(field: keyof typeof this.form.controls): string {
    return errorMessage(
      this.form.controls[field],
      field === 'referencePriceCop'
        ? { pattern: PRICE_MESSAGE }
        : { pattern: 'Este campo es obligatorio' },
      this.serverErrors()[field],
    );
  }

  protected submit(event: Event): void {
    event.preventDefault();
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }
    const { name, summary, description, referencePriceCop } = this.form.getRawValue();
    const price = referencePriceCop.trim();
    this.save.emit({
      name: name.trim(),
      summary: summary.trim(),
      description: description.trim(),
      referencePriceCop: price ? Number(price) : null,
    });
  }
}
