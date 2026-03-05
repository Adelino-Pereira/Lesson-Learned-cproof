/**
 * login.component.ts — Mock login page for the prototype.
 * Allows the user to enter a name and select a role (admin, power-user, etc.).
 * In production DCS, this would be replaced by JWT-based authentication.
 */

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

import { AuthService } from '../../core/services/auth.service';
import { UserRole } from '../../core/models/auth.model';

interface RoleOption {
  value: UserRole;
  label: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule,
  ],
  template: `
    <div class="login-wrapper">
      <div class="login-card">
        <img src="assets/img/dcs/android-chrome-192x192.png" class="login-logo" alt="DCS" />
        <h2 class="login-title">Knowledge Database</h2>
        <p class="login-subtitle">Lessons Learned — Demo Login</p>

        <mat-form-field appearance="outline" class="login-field">
          <mat-label>Name</mat-label>
          <input matInput [(ngModel)]="name" placeholder="Enter your name">
        </mat-form-field>

        <mat-form-field appearance="outline" class="login-field">
          <mat-label>Role</mat-label>
          <mat-select [(ngModel)]="selectedRole">
            @for (r of roles; track r.value) {
              <mat-option [value]="r.value">{{ r.label }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <button mat-raised-button class="login-btn" (click)="enter()" [disabled]="!name.trim() || !selectedRole">
          ENTER
        </button>
      </div>
    </div>
  `,
  styles: [`
    .login-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      background: #1a202e;
    }
    .login-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      background: #ffffff;
      border-radius: 12px;
      padding: 48px 40px 36px;
      width: 380px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    }
    .login-logo {
      width: 56px;
      height: 56px;
      margin-bottom: 16px;
    }
    .login-title {
      margin: 0 0 4px;
      font-size: 22px;
      font-weight: 600;
      color: #1a202e;
    }
    .login-subtitle {
      margin: 0 0 28px;
      font-size: 14px;
      color: #888;
    }
    .login-field {
      width: 100%;
    }
    .login-btn {
      width: 100%;
      height: 44px;
      margin-top: 8px;
      background-color: #5c6bc0 !important;
      color: #fff !important;
      font-weight: 600;
      font-size: 15px;
      letter-spacing: 0.5px;
    }
  `],
})
export class LoginComponent {
  name = '';
  selectedRole: UserRole | null = null;

  roles: RoleOption[] = [
    { value: 'admin', label: 'Admin' },
    { value: 'power-user', label: 'Power User' },
    { value: 'project-leader', label: 'Project Leader' },
    { value: 'manager', label: 'Manager' },
    { value: 'user', label: 'User' },
  ];

  constructor(private auth: AuthService, private router: Router) {}

  enter() {
    if (!this.name.trim() || !this.selectedRole) return;
    this.auth.login(this.name.trim(), this.selectedRole);
    this.router.navigate(['/knowledge']);
  }
}
