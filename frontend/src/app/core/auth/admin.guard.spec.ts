import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  provideRouter,
} from '@angular/router';
import { Observable, firstValueFrom, of } from 'rxjs';
import { adminGuard } from './admin.guard';
import { AuthService } from './auth.service';

function run(me: { email: string } | null, url = '/admin/servicios') {
  TestBed.configureTestingModule({
    providers: [provideRouter([]), { provide: AuthService, useValue: { me: () => of(me) } }],
  });
  return TestBed.runInInjectionContext(() =>
    adminGuard({} as ActivatedRouteSnapshot, { url } as RouterStateSnapshot),
  ) as Observable<boolean | UrlTree>;
}

describe('adminGuard', () => {
  it('lets a logged-in admin through', async () => {
    expect(await firstValueFrom(run({ email: 'owner@example.com' }))).toBe(true);
  });

  it('redirects to the login page with the requested URL', async () => {
    const result = await firstValueFrom(run(null, '/admin/servicios'));
    expect(result instanceof UrlTree).toBe(true);
    expect((result as UrlTree).toString()).toBe('/admin/login?returnUrl=%2Fadmin%2Fservicios');
  });
});
