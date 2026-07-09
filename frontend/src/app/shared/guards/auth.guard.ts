import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const roles = (route.data?.['roles'] as UserRole[] | undefined) || [];

  if (!authService.hasValidToken()) {
    return router.createUrlTree(['/login']);
  }

  if (roles.length && !authService.hasAnyRole(roles)) {
    return router.createUrlTree(['/login']);
  }

  return true;
};
