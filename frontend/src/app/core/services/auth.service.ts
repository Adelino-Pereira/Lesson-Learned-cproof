/**
 * auth.service.ts — Mock authentication service for the prototype.
 * Stores the logged-in user (name + role) in sessionStorage.
 * In production DCS, this would be replaced by JWT-based auth
 * with token-interceptor.service.ts for automatic token injection.
 */

import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { MockUser, UserRole } from '../models/auth.model';

const STORAGE_KEY = 'll_mock_user';  // sessionStorage key for the mock user

@Injectable({ providedIn: 'root' })
export class AuthService {
  /** Reactive user state — emits null when logged out, MockUser when logged in */
  private userSubject = new BehaviorSubject<MockUser | null>(this.restore());
  currentUser$ = this.userSubject.asObservable();

  constructor(private router: Router) {}

  /** Synchronous access to the current user (or null) */
  get currentUser(): MockUser | null {
    return this.userSubject.value;
  }

  isLoggedIn(): boolean {
    return this.userSubject.value !== null;
  }

  /** Saves user to sessionStorage and updates the reactive subject */
  login(name: string, role: UserRole): void {
    const user: MockUser = { name, role };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    this.userSubject.next(user);
  }

  /** Clears the session and redirects to the login page */
  logout(): void {
    sessionStorage.removeItem(STORAGE_KEY);
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }

  /** Restores user from sessionStorage on page refresh */
  private restore(): MockUser | null {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as MockUser;
    } catch {
      return null;
    }
  }
}
