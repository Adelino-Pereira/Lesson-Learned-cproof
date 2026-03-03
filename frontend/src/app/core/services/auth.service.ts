import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { MockUser, UserRole } from '../models/auth.model';

const STORAGE_KEY = 'll_mock_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userSubject = new BehaviorSubject<MockUser | null>(this.restore());
  currentUser$ = this.userSubject.asObservable();

  constructor(private router: Router) {}

  get currentUser(): MockUser | null {
    return this.userSubject.value;
  }

  isLoggedIn(): boolean {
    return this.userSubject.value !== null;
  }

  login(name: string, role: UserRole): void {
    const user: MockUser = { name, role };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    this.userSubject.next(user);
  }

  logout(): void {
    sessionStorage.removeItem(STORAGE_KEY);
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }

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
