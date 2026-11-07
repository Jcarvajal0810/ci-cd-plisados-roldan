import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from './auth.service';

/** Admin pages require a session; otherwise go to login and come back afterwards. */
export const adminGuard: CanActivateFn = (_route, state) => {
  const router = inject(Router);
  return inject(AuthService)
    .me()
    .pipe(
      map(
        (admin) =>
          admin !== null ||
          router.createUrlTree(['/admin/login'], { queryParams: { returnUrl: state.url } }),
      ),
    );
};
