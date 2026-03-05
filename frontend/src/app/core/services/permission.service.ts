/**
 * permission.service.ts — Role-based access control (RBAC) service.
 * Maps each user role to a set of allowed actions. Used by components
 * to show/hide UI elements and by route guards to protect pages.
 *
 * Roles: admin, power-user, project-leader, manager, user
 * Actions follow the pattern: "module:action" (e.g. 'knowledge:edit')
 */

import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { UserRole } from '../models/auth.model';

/** All available permission actions in the application */
export type PermissionAction =
  | 'knowledge:read'
  | 'knowledge:edit'
  | 'knowledge:submit'
  | 'knowledge:validate'
  | 'documents-used:read'
  | 'documents-used:edit'
  | 'stats:read';

/** Permission matrix: defines which actions each role can perform */
const PERMISSIONS: Record<UserRole, Set<PermissionAction>> = {
  admin: new Set([
    'knowledge:read', 'knowledge:edit', 'knowledge:submit', 'knowledge:validate',
    'documents-used:read', 'documents-used:edit',
    'stats:read',
  ]),
  'power-user': new Set([
    'knowledge:read', 'knowledge:edit', 'knowledge:submit', 'knowledge:validate',
    'documents-used:read', 'documents-used:edit',
  ]),
  'project-leader': new Set([
    'knowledge:read', 'knowledge:submit',
    'documents-used:read', 'documents-used:edit',
  ]),
  manager: new Set([
    'knowledge:read', 'knowledge:submit',
    'documents-used:read',
    'stats:read',
  ]),
  user: new Set([
    'knowledge:read', 'knowledge:submit',
    'documents-used:read',
  ]),
};

@Injectable({ providedIn: 'root' })
export class PermissionService {
  constructor(private auth: AuthService) {}

  /** Checks if the current user's role grants the specified action */
  hasPermission(action: PermissionAction): boolean {
    const user = this.auth.currentUser;
    if (!user) return false;
    return PERMISSIONS[user.role]?.has(action) ?? false;
  }
}
