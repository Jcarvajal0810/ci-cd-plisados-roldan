import { AbstractControl, ValidatorFn, Validators } from '@angular/forms';

/** Spanish message for the first validation error of a touched control, or ''. */
export function errorMessage(
  control: AbstractControl,
  custom: Record<string, string> = {},
  serverError?: string,
): string {
  if (serverError) {
    return serverError;
  }
  const errors = control.errors;
  if (!errors || !control.touched) {
    return '';
  }
  const key = Object.keys(errors)[0];
  if (custom[key]) {
    return custom[key];
  }
  switch (key) {
    case 'required':
      return 'Este campo es obligatorio';
    case 'maxlength':
      return `Máximo ${errors['maxlength'].requiredLength} caracteres`;
    default:
      return 'Valor inválido';
  }
}

/** Required text, not only spaces, with a maximum length (data-model.md limits). */
export function requiredText(max: number): ValidatorFn[] {
  return [Validators.required, Validators.pattern(/\S/), Validators.maxLength(max)];
}
