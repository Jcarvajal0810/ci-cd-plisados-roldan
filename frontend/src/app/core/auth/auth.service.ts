import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, map, of, switchMap, tap } from 'rxjs';
import { AdminMe } from '../api/models';

export type LoginResult = 'ok' | 'invalid' | 'throttled' | 'error';

/** Messages shown on the login form (contracts/ui-routes.md). */
export const LOGIN_MESSAGES: Record<Exclude<LoginResult, 'ok'>, string> = {
  invalid: 'Correo o contraseña incorrectos',
  throttled: 'Demasiados intentos, intenta en 15 minutos',
  error: 'No pudimos iniciar sesión. Inténtalo de nuevo.',
};

/** Admin session (server-side cookie session + CSRF, research R6). */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private checked = false;

  readonly currentAdmin = signal<AdminMe | null>(null);

  /** The logged-in admin, or `null`; asks the server once and then uses the cached answer. */
  me(): Observable<AdminMe | null> {
    return this.checked ? of(this.currentAdmin()) : this.refresh();
  }

  /**
   * The first GET makes sure the XSRF-TOKEN cookie exists before the POST, because the
   * server rejects unsafe requests without it.
   */
  login(email: string, password: string): Observable<LoginResult> {
    return this.http.get('/api/auth/me').pipe(
      catchError(() => of(null)),
      switchMap(() => this.http.post<void>('/api/auth/login', { email, password })),
      switchMap(() => this.refresh()),
      map((): LoginResult => 'ok'),
      catchError((error: unknown) => of(toLoginResult(error))),
    );
  }

  logout(): Observable<void> {
    return this.http.post<void>('/api/auth/logout', {}).pipe(
      catchError(() => of(undefined)),
      tap(() => {
        this.currentAdmin.set(null);
        this.checked = true;
      }),
    );
  }

  private refresh(): Observable<AdminMe | null> {
    return this.http.get<AdminMe>('/api/auth/me').pipe(
      catchError(() => of(null)),
      tap((admin) => {
        this.currentAdmin.set(admin);
        this.checked = true;
      }),
    );
  }
}

function toLoginResult(error: unknown): LoginResult {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 401) return 'invalid';
    if (error.status === 429) return 'throttled';
  }
  return 'error';
}
