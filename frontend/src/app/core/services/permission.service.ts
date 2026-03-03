import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { UserRole } from '../models/auth.model';

export type PermissionAction =
  | 'knowledge:read'
  | 'knowledge:edit'
  | 'knowledge:submit'
  | 'knowledge:validate'
  | 'documents-used:read'
  | 'documents-used:edit'
  | 'stats:read';

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

  hasPermission(action: PermissionAction): boolean {
    const user = this.auth.currentUser;
    if (!user) return false;
    return PERMISSIONS[user.role]?.has(action) ?? false;
  }
}
