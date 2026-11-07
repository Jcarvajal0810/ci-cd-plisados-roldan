import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { LoginDialogService } from './login-dialog.service';

/**
 * A 401 from the admin API means the session expired: open the login dialog and retry the same
 * request once after login, so the form the owner was filling in is not lost.
 */
export const sessionExpiredInterceptor: HttpInterceptorFn = (request, next) => {
  if (!request.url.startsWith('/api/admin/')) {
    return next(request);
  }
  const dialog = inject(LoginDialogService);
  return next(request).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse) || error.status !== 401) {
        return throwError(() => error);
      }
      return dialog
        .requestLogin()
        .pipe(switchMap((loggedIn) => (loggedIn ? next(request) : throwError(() => error))));
    }),
  );
};
