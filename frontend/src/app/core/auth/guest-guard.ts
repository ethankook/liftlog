import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { inject } from '@angular/core';

export const guestGuard: CanActivateFn = async (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  await auth.waitForRestoration();

  if (auth.currentUser()) {
    return router.createUrlTree(['/dashboard']);
  }

  return true;
};
