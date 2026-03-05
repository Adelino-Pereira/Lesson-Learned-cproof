/**
 * auth.model.ts — Authentication types for the mock login system.
 * In production DCS, this would be replaced by JWT-based auth with
 * role flags from the User entity.
 */

/** Available roles in the permission system (maps to PERMISSIONS in permission.service.ts) */
export type UserRole = 'admin' | 'power-user' | 'project-leader' | 'manager' | 'user';

/** Mock user stored in sessionStorage during the demo session */
export interface MockUser {
  name: string;
  role: UserRole;
}
