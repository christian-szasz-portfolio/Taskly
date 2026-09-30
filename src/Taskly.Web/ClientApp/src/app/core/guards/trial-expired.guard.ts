import { inject } from '@angular/core';
import type { CanActivateFn } from '@angular/router';
import { Router } from '@angular/router';
import { AuthStore } from '../state/auth.store';

/**
 * Redirects to the "start another trial" splash when the demo data has expired
 * (more than 7 days since the trial started, or no trial started yet).
 */
export const trialExpiredGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  if (authStore.isExpired()) {
    return router.createUrlTree(['/trial-expired']);
  }

  return true;
};
