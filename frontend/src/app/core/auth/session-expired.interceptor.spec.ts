import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Subject, firstValueFrom } from 'rxjs';
import { LoginDialogService } from './login-dialog.service';
import { sessionExpiredInterceptor } from './session-expired.interceptor';

describe('sessionExpiredInterceptor', () => {
  let http: HttpClient;
  let backend: HttpTestingController;
  let dialogResult: Subject<boolean>;
  let dialogOpened: number;

  beforeEach(() => {
    dialogOpened = 0;
    dialogResult = new Subject<boolean>();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([sessionExpiredInterceptor])),
        provideHttpClientTesting(),
        {
          provide: LoginDialogService,
          useValue: {
            requestLogin: () => {
              dialogOpened++;
              return dialogResult.asObservable();
            },
          },
        },
      ],
    });
    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => backend.verify());

  it('opens the login dialog on a 401 from the admin API and retries after login', async () => {
    const result = firstValueFrom(http.put('/api/admin/profile', { slogan: 'x' }));
    backend.expectOne('/api/admin/profile').flush({}, { status: 401, statusText: 'Unauthorized' });
    expect(dialogOpened).toBe(1);

    dialogResult.next(true);
    dialogResult.complete();
    const retry = backend.expectOne('/api/admin/profile');
    expect(retry.request.body).toEqual({ slogan: 'x' });
    retry.flush({ slogan: 'x' });

    expect(await result).toEqual({ slogan: 'x' });
  });

  it('surfaces the error when the owner cancels the dialog', async () => {
    const result = firstValueFrom(http.get('/api/admin/offerings'));
    backend
      .expectOne('/api/admin/offerings')
      .flush({}, { status: 401, statusText: 'Unauthorized' });

    dialogResult.next(false);
    dialogResult.complete();

    await expect(result).rejects.toMatchObject({ status: 401 });
  });

  it('ignores 401s from the login endpoint and public API', async () => {
    const login = firstValueFrom(http.post('/api/auth/login', {}));
    backend.expectOne('/api/auth/login').flush({}, { status: 401, statusText: 'Unauthorized' });
    await expect(login).rejects.toMatchObject({ status: 401 });
    expect(dialogOpened).toBe(0);
  });
});
