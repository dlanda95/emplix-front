import { AbstractControl, ValidationErrors } from '@angular/forms';

const MIN_YEAR = 1900;
const MAX_YEAR = 2100;

export function dateRangeValidator(control: AbstractControl): ValidationErrors | null {
  const val = control.value;
  if (!val) return null;

  const date = new Date(val);
  if (isNaN(date.getTime())) return { invalidDate: { message: 'La fecha no es válida.' } };

  const year = date.getFullYear();
  if (year < MIN_YEAR || year > MAX_YEAR) {
    return { dateOutOfRange: { message: `El año debe estar entre ${MIN_YEAR} y ${MAX_YEAR}.` } };
  }
  return null;
}

export function pastDateValidator(control: AbstractControl): ValidationErrors | null {
  const rangeError = dateRangeValidator(control);
  if (rangeError) return rangeError;

  const val = control.value;
  if (!val) return null;

  const date = new Date(val);
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  if (date > today) {
    return { futureDate: { message: 'La fecha de nacimiento no puede ser una fecha futura.' } };
  }
  return null;
}
