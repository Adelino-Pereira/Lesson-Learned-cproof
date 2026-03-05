/**
 * auth.guard.ts — Route guard that requires authentication.
 * Redirects unauthenticated users to the login page.
 * Applied to the root layout route to protect all app pages.
 */

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn()) return true;
  return router.createUrlTree(['/login']);
};
