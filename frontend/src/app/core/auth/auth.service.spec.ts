import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { AuthService, LOGIN_MESSAGES } from './auth.service';

describe('AuthService', () => {
  let auth: AuthService;
  let backend: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    auth = TestBed.inject(AuthService);
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => backend.verify());

  it('me() returns the admin and caches it', async () => {
    const first = firstValueFrom(auth.me());
    backend.expectOne('/api/auth/me').flush({ email: 'owner@example.com' });
    expect(await first).toEqual({ email: 'owner@example.com' });

    expect(await firstValueFrom(auth.me())).toEqual({ email: 'owner@example.com' });
    backend.expectNone('/api/auth/me');
    expect(auth.currentAdmin()?.email).toBe('owner@example.com');
  });

  it('me() returns null when not logged in', async () => {
    const result = firstValueFrom(auth.me());
    backend.expectOne('/api/auth/me').flush({}, { status: 401, statusText: 'Unauthorized' });
    expect(await result).toBeNull();
  });

  it('login() fetches the CSRF cookie first, then posts the credentials', async () => {
    const result = firstValueFrom(auth.login('owner@example.com', 'clave'));
    backend.expectOne('/api/auth/me').flush({}, { status: 401, statusText: 'Unauthorized' });
    const post = backend.expectOne('/api/auth/login');
    expect(post.request.method).toBe('POST');
    expect(post.request.body).toEqual({ email: 'owner@example.com', password: 'clave' });
    post.flush(null, { status: 204, statusText: 'No Content' });
    backend.expectOne('/api/auth/me').flush({ email: 'owner@example.com' });

    expect(await result).toBe('ok');
    expect(auth.currentAdmin()?.email).toBe('owner@example.com');
  });

  it('login() reports wrong credentials', async () => {
    const result = firstValueFrom(auth.login('owner@example.com', 'mal'));
    backend.expectOne('/api/auth/me').flush({}, { status: 401, statusText: 'Unauthorized' });
    backend.expectOne('/api/auth/login').flush({}, { status: 401, statusText: 'Unauthorized' });
    expect(await result).toBe('invalid');
  });

  it('login() reports throttling with the Spanish message', async () => {
    const result = firstValueFrom(auth.login('owner@example.com', 'mal'));
    backend.expectOne('/api/auth/me').flush({}, { status: 401, statusText: 'Unauthorized' });
    backend
      .expectOne('/api/auth/login')
      .flush({}, { status: 429, statusText: 'Too Many Requests' });
    expect(await result).toBe('throttled');
    expect(LOGIN_MESSAGES.throttled).toBe('Demasiados intentos, intenta en 15 minutos');
  });

  it('logout() ends the session and forgets the admin', async () => {
    const login = firstValueFrom(auth.me());
    backend.expectOne('/api/auth/me').flush({ email: 'owner@example.com' });
    await login;

    const result = firstValueFrom(auth.logout());
    backend.expectOne('/api/auth/logout').flush(null, { status: 204, statusText: 'No Content' });
    await result;

    expect(auth.currentAdmin()).toBeNull();
  });
});
