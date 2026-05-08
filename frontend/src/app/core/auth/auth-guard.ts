import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  await auth.waitForRestoration();

  if (auth.currentUser()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};
