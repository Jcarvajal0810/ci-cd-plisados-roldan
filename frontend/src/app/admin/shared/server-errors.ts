import { HttpErrorResponse } from '@angular/common/http';

/** Field errors from a 400 Problem Details response, or `null` for any other failure. */
export function fieldErrors(error: unknown): Record<string, string> | null {
  return error instanceof HttpErrorResponse && error.status === 400 && error.error?.errors
    ? (error.error.errors as Record<string, string>)
    : null;
}
