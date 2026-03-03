export type UserRole = 'admin' | 'power-user' | 'project-leader' | 'manager' | 'user';

export interface MockUser {
  name: string;
  role: UserRole;
}
