/**
 * permission.guard.ts — Route guard that checks role-based permissions.
 * Factory function that accepts one or more required PermissionActions.
 * If the user lacks any of the required permissions, redirects to /knowledge.
 * Usage: canActivate: [permissionGuard('stats:read')]
 */

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { PermissionService, PermissionAction } from '../services/permission.service';

export function permissionGuard(...actions: PermissionAction[]): CanActivateFn {
  return () => {
    const permissions = inject(PermissionService);
    const router = inject(Router);

    // All specified actions must be allowed for the current user's role
    const allowed = actions.every(a => permissions.hasPermission(a));
    if (allowed) return true;
    return router.createUrlTree(['/knowledge']);
  };
}
