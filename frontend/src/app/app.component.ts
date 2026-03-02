import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
  ],
  template: `
    <mat-sidenav-container class="app-container">
      <mat-sidenav mode="side" opened class="sidenav">
        <div class="sidenav-header">
          <mat-icon class="logo-icon">school</mat-icon>
          <span class="logo-text">Knowledge DB</span>
        </div>
        <mat-nav-list>
          <a mat-list-item routerLink="/knowledge" routerLinkActive="active-link" [routerLinkActiveOptions]="{exact: true}">
            <mat-icon matListItemIcon>list</mat-icon>
            <span matListItemTitle>Listing</span>
          </a>
          <a mat-list-item routerLink="/knowledge/new" routerLinkActive="active-link">
            <mat-icon matListItemIcon>add_circle</mat-icon>
            <span matListItemTitle>Submit New</span>
          </a>
          <a mat-list-item routerLink="/documents-used" routerLinkActive="active-link">
            <mat-icon matListItemIcon>folder_shared</mat-icon>
            <span matListItemTitle>Documents Used</span>
          </a>
          <a mat-list-item routerLink="/stats" routerLinkActive="active-link">
            <mat-icon matListItemIcon>bar_chart</mat-icon>
            <span matListItemTitle>Statistics</span>
          </a>
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content class="content">
        <mat-toolbar color="primary" class="toolbar">
          <span>Knowledge Database — Lessons Learned</span>
        </mat-toolbar>
        <div class="page-content">
          <router-outlet />
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .app-container {
      height: 100vh;
    }
    .sidenav {
      width: 240px;
      background: #fafafa;
    }
    .sidenav-header {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 16px 16px 8px;
      font-size: 18px;
      font-weight: 500;
    }
    .logo-icon {
      color: #3f51b5;
      font-size: 28px;
      width: 28px;
      height: 28px;
    }
    .active-link {
      background: rgba(63, 81, 181, 0.08) !important;
      color: #3f51b5;
    }
    .content {
      display: flex;
      flex-direction: column;
    }
    .toolbar {
      position: sticky;
      top: 0;
      z-index: 10;
    }
    .page-content {
      padding: 24px;
      flex: 1;
    }
  `],
})
export class AppComponent {}
