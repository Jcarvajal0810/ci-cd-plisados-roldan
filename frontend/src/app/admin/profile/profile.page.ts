import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminApiClient } from '../../core/api/admin-api.client';
import { BusinessProfile } from '../../core/api/models';
import { errorMessage, requiredText } from '../forms/form-errors';

const WHATSAPP_MESSAGE = 'Solo números, con indicativo de país (10 a 15 dígitos)';

/** Business information shown on Nosotros, Contacto and every WhatsApp button (FR-019). */
@Component({
  selector: 'app-profile-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <h1>Perfil del negocio</h1>
    <p class="status" role="status">{{ status() }}</p>
    @if (error()) {
      <p class="error" role="alert">{{ error() }}</p>
    }
    <form class="admin-form" [formGroup]="form" (submit)="save($event)" novalidate>
      @for (field of fields; track field.name) {
        <div class="field">
          <label [for]="'profile-' + field.name">{{ field.label }}</label>
          @if (field.multiline) {
            <textarea
              [id]="'profile-' + field.name"
              [name]="field.name"
              rows="12"
              [formControlName]="field.name"
            ></textarea>
          } @else {
            <input
              [id]="'profile-' + field.name"
              [name]="field.name"
              [formControlName]="field.name"
              [attr.inputmode]="field.name === 'whatsappNumber' ? 'numeric' : null"
            />
          }
          @if (field.hint) {
            <p class="hint">{{ field.hint }}</p>
          }
          <p class="error">{{ fieldError(field.name) }}</p>
        </div>
      }
      <button type="submit" class="btn btn-primary">Guardar</button>
    </form>
  `,
})
export class ProfilePage {
  private readonly api = inject(AdminApiClient);

  protected readonly status = signal('');
  protected readonly error = signal('');
  private readonly serverErrors = signal<Record<string, string>>({});

  protected readonly form = new FormGroup({
    businessName: new FormControl('', { nonNullable: true, validators: requiredText(80) }),
    slogan: new FormControl('', { nonNullable: true, validators: requiredText(120) }),
    aboutText: new FormControl('', { nonNullable: true, validators: requiredText(8000) }),
    whatsappNumber: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^[0-9]{10,15}$/)],
    }),
    locationText: new FormControl('', { nonNullable: true, validators: requiredText(200) }),
    scheduleText: new FormControl('', { nonNullable: true, validators: requiredText(300) }),
  });

  protected readonly fields: {
    name: keyof BusinessProfile;
    label: string;
    hint?: string;
    multiline?: boolean;
  }[] = [
    { name: 'businessName', label: 'Nombre del negocio' },
    { name: 'slogan', label: 'Eslogan' },
    {
      name: 'aboutText',
      label: 'Nosotros',
      multiline: true,
      hint: 'Separa párrafos con una línea en blanco.',
    },
    { name: 'whatsappNumber', label: 'Número de WhatsApp', hint: 'Ejemplo: 573116254705' },
    { name: 'locationText', label: 'Ubicación' },
    { name: 'scheduleText', label: 'Horario' },
  ];

  constructor() {
    this.api.profile().subscribe({
      next: (profile) => this.form.setValue(profile),
      error: () => this.error.set('No pudimos cargar el perfil.'),
    });
  }

  protected fieldError(field: keyof BusinessProfile): string {
    return errorMessage(
      this.form.controls[field],
      field === 'whatsappNumber'
        ? { pattern: WHATSAPP_MESSAGE }
        : { pattern: 'Este campo es obligatorio' },
      this.serverErrors()[field],
    );
  }

  protected save(event: Event): void {
    event.preventDefault();
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }
    this.serverErrors.set({});
    this.error.set('');
    this.api.saveProfile(this.form.getRawValue()).subscribe({
      next: (profile) => {
        this.form.setValue(profile);
        this.status.set('Guardado');
      },
      error: (error: unknown) => {
        if (error instanceof HttpErrorResponse && error.status === 400 && error.error?.errors) {
          this.serverErrors.set(error.error.errors);
        }
        this.error.set('No pudimos guardar. Revisa los campos.');
      },
    });
  }
}
