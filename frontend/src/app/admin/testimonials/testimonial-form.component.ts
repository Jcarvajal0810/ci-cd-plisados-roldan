import { ChangeDetectionStrategy, Component, effect, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TestimonialInput } from '../../core/api/models';
import { errorMessage, requiredText } from '../forms/form-errors';

/** Testimonial fields with the data-model limits (name/company 120, quote 600). */
@Component({
  selector: 'app-testimonial-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <form class="admin-form" [formGroup]="form" (submit)="submit($event)" novalidate>
      <div class="field">
        <label for="testimonial-client">Nombre del cliente</label>
        <input id="testimonial-client" name="clientName" formControlName="clientName" />
        <p class="error">{{ error('clientName') }}</p>
      </div>
      <div class="field">
        <label for="testimonial-company">Empresa o marca (opcional)</label>
        <input id="testimonial-company" name="company" formControlName="company" />
        <p class="error">{{ error('company') }}</p>
      </div>
      <div class="field">
        <label for="testimonial-quote">Testimonio</label>
        <textarea id="testimonial-quote" name="quote" rows="5" formControlName="quote"></textarea>
        <p class="error">{{ error('quote') }}</p>
      </div>
      <div class="check">
        <input
          id="testimonial-featured"
          name="featured"
          type="checkbox"
          formControlName="featured"
        />
        <label for="testimonial-featured">Destacar en la página de inicio</label>
      </div>
      <button type="submit" class="btn btn-primary">Guardar</button>
    </form>
  `,
  styles: `
    .check {
      display: flex;
      gap: var(--space-2);
      align-items: center;
    }
  `,
})
export class TestimonialFormComponent {
  readonly value = input<TestimonialInput | null>(null);
  readonly serverErrors = input<Record<string, string>>({});
  readonly save = output<TestimonialInput>();

  protected readonly form = new FormGroup({
    clientName: new FormControl('', { nonNullable: true, validators: requiredText(120) }),
    company: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(120)] }),
    quote: new FormControl('', { nonNullable: true, validators: requiredText(600) }),
    featured: new FormControl(false, { nonNullable: true }),
  });

  constructor() {
    effect(() => {
      const value = this.value();
      if (value) {
        this.form.setValue({
          clientName: value.clientName,
          company: value.company ?? '',
          quote: value.quote,
          featured: value.featured ?? false,
        });
      }
    });
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
      clientName: v.clientName.trim(),
      company: v.company.trim() || null,
      quote: v.quote.trim(),
      featured: v.featured,
    });
  }
}
