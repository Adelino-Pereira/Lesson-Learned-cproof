import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatTooltipModule,
  ],
  template: `
    <mat-sidenav-container class="app-container">
      <mat-sidenav mode="side" opened class="sidenav" disableClose>

        <!-- Logo toolbar -->
        <div class="sidenav-toolbar">
          <img src="assets/img/dcs/android-chrome-192x192.png" class="logo-img" alt="DCS">
        </div>

        <!-- Nav items -->
        <div class="sidenav-items">

          <!-- Dashboard (disabled) -->
          <div class="nav-item disabled" matTooltip="Dashboard" matTooltipPosition="right">
            <mat-icon class="nav-icon">layers</mat-icon>
            <span class="nav-label">Dashboard</span>
          </div>

          <!-- Sales Pipeline (disabled) -->
          <div class="nav-item disabled" matTooltip="Sales Pipeline" matTooltipPosition="right">
            <mat-icon class="nav-icon">assessment</mat-icon>
            <span class="nav-label">Sales Pipeline</span>
          </div>

          <!-- ECR Pipeline (disabled) -->
          <div class="nav-item disabled" matTooltip="ECR Pipeline" matTooltipPosition="right">
            <mat-icon class="nav-icon">assessment</mat-icon>
            <span class="nav-label">ECR Pipeline</span>
          </div>

          <!-- Project Management (disabled) -->
          <div class="nav-item disabled" matTooltip="Project Management" matTooltipPosition="right">
            <svg class="nav-svg" xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 512 512">
              <path fill="#ffffff"
                d="M32 32c17.7 0 32 14.3 32 32V400c0 8.8 7.2 16 16 16H480c17.7 0 32 14.3 32 32s-14.3 32-32 32H80c-44.2 0-80-35.8-80-80V64C0 46.3 14.3 32 32 32zm96 96c0-17.7 14.3-32 32-32l96 0c17.7 0 32 14.3 32 32s-14.3 32-32 32H160c-17.7 0-32-14.3-32-32zm96 64H352c17.7 0 32 14.3 32 32s-14.3 32-32 32H224c-17.7 0-32-14.3-32-32s14.3-32 32-32zm160 96h64c17.7 0 32 14.3 32 32s-14.3 32-32 32H384c-17.7 0-32-14.3-32-32s14.3-32 32-32z" />
            </svg>
            <span class="nav-label nav-label-wrap">Project Management</span>
          </div>

          <!-- Reporting (disabled) -->
          <div class="nav-item disabled" matTooltip="Reporting" matTooltipPosition="right">
            <mat-icon class="nav-icon">show_chart</mat-icon>
            <span class="nav-label">Reporting</span>
          </div>

          <!-- Documents (disabled) -->
          <div class="nav-item disabled" matTooltip="Documents" matTooltipPosition="right">
            <mat-icon class="nav-icon">folder_shared</mat-icon>
            <span class="nav-label">Documents</span>
          </div>

          <!-- KNOWLEDGE DATABASE (active — this module) -->
          <a class="nav-item" routerLink="/knowledge" routerLinkActive="active"
             matTooltip="Knowledge Database" matTooltipPosition="right">
            <mat-icon class="nav-icon">school</mat-icon>
            <span class="nav-label nav-label-wrap">Knowledge Database</span>
          </a>

          <!-- Help (disabled) -->
          <div class="nav-item disabled" matTooltip="Help" matTooltipPosition="right">
            <mat-icon class="nav-icon">help_outline</mat-icon>
            <span class="nav-label">Help</span>
          </div>

          <!-- Settings spacer + icon (disabled, pushed to bottom area) -->
          <div class="nav-spacer"></div>
          <div class="nav-item disabled settings-item" matTooltip="Settings" matTooltipPosition="right">
            <mat-icon class="nav-icon">settings</mat-icon>
            <span class="nav-label">Settings</span>
          </div>

        </div>
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
    /* ===== Full-height shell ===== */
    .app-container { height: 100vh; }

    /* ===== Sidenav — matches DCS Vex dark sidebar ===== */
    .sidenav {
      width: 78px;
      background: #1a202e;
      border: none;
    }

    /* Logo toolbar */
    .sidenav-toolbar {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 64px;
      background: #161b27;
      padding: 0;
    }
    .logo-img {
      width: 27px;
      height: 27px;
      user-select: none;
    }

    /* Nav items container */
    .sidenav-items {
      display: flex;
      flex-direction: column;
      padding-top: 8px;
      height: calc(100% - 64px);
      overflow-y: auto;
      overflow-x: hidden;
    }

    /* Individual nav item */
    .nav-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      min-height: 48px;
      padding: 8px 0;
      cursor: pointer;
      text-decoration: none;
      transition: background 0.15s ease;
      user-select: none;
      width: 100%;
    }
    .nav-item:hover {
      background: #141924;
    }
    .nav-item:hover .nav-icon,
    .nav-item:hover .nav-svg path {
      color: #5c6bc0;
      fill: #5c6bc0;
    }
    .nav-item:hover .nav-label {
      color: #5c6bc0;
    }
    .nav-item.active {
      background: #141924;
    }
    .nav-item.active .nav-icon {
      color: #5c6bc0;
    }
    .nav-item.active .nav-label {
      color: #5c6bc0;
    }

    /* Disabled items */
    .nav-item.disabled {
      cursor: default;
      pointer-events: none;
    }

    /* Icon */
    .nav-icon {
      color: #ffffff;
      font-size: 24px;
      width: 24px;
      height: 24px;
    }
    .nav-svg {
      width: 20px;
      height: 20px;
    }
    .nav-svg path {
      fill: #ffffff;
      transition: fill 0.15s ease;
    }

    /* Label under icon */
    .nav-label {
      font-size: 10px;
      color: #a7acc5;
      text-align: center;
      margin-top: 2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      width: 90%;
      pointer-events: none;
    }
    .nav-label-wrap {
      white-space: normal;
      word-break: break-word;
      line-height: 1.1em;
    }

    /* Spacer pushes Settings to bottom */
    .nav-spacer { flex: 1; }
    .settings-item { margin-top: 6px; }

    /* ===== Content area ===== */
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
