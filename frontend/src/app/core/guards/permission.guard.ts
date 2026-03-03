import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { PermissionService, PermissionAction } from '../services/permission.service';

export function permissionGuard(...actions: PermissionAction[]): CanActivateFn {
  return () => {
    const permissions = inject(PermissionService);
    const router = inject(Router);

    const allowed = actions.every(a => permissions.hasPermission(a));
    if (allowed) return true;
    return router.createUrlTree(['/knowledge']);
  };
}
