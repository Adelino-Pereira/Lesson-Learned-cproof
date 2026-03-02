import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterOutlet, RouterLink, RouterLinkActive } from "@angular/router";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatTooltipModule } from "@angular/material/tooltip";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
  ],
  template: `
    <mat-sidenav-container class="app-container">
      <mat-sidenav mode="side" opened class="sidenav" disableClose>
        <!-- Logo toolbar -->
        <div class="sidenav-toolbar">
          <img
            src="assets/img/dcs/android-chrome-192x192.png"
            class="logo-img"
            alt="DCS"
          />
        </div>

        <!-- Nav items -->
        <div class="sidenav-items">
          <!-- Dashboard (disabled) -->
          <div
            class="nav-item disabled"
            matTooltip="Dashboard"
            matTooltipPosition="right"
          >
            <mat-icon class="nav-icon">layers</mat-icon>
            <span class="nav-label">Dashboard</span>
          </div>

          <!-- Sales Pipeline (disabled) -->
          <div
            class="nav-item disabled"
            matTooltip="Sales Pipeline"
            matTooltipPosition="right"
          >
            <mat-icon class="nav-icon">assessment</mat-icon>
            <span class="nav-label">Sales Pipeline</span>
          </div>

          <!-- ECR Pipeline (disabled) -->
          <div
            class="nav-item disabled"
            matTooltip="ECR Pipeline"
            matTooltipPosition="right"
          >
            <mat-icon class="nav-icon">assessment</mat-icon>
            <span class="nav-label">ECR Pipeline</span>
          </div>

          <!-- Project Management (disabled) -->
          <div
            class="nav-item disabled"
            matTooltip="Project Management"
            matTooltipPosition="right"
          >
            <svg
              class="nav-svg"
              xmlns="http://www.w3.org/2000/svg"
              height="20"
              width="20"
              viewBox="0 0 512 512"
            >
              <path
                fill="#ffffff"
                d="M32 32c17.7 0 32 14.3 32 32V400c0 8.8 7.2 16 16 16H480c17.7 0 32 14.3 32 32s-14.3 32-32 32H80c-44.2 0-80-35.8-80-80V64C0 46.3 14.3 32 32 32zm96 96c0-17.7 14.3-32 32-32l96 0c17.7 0 32 14.3 32 32s-14.3 32-32 32H160c-17.7 0-32-14.3-32-32zm96 64H352c17.7 0 32 14.3 32 32s-14.3 32-32 32H224c-17.7 0-32-14.3-32-32s14.3-32 32-32zm160 96h64c17.7 0 32 14.3 32 32s-14.3 32-32 32H384c-17.7 0-32-14.3-32-32s14.3-32 32-32z"
              />
            </svg>
            <span class="nav-label nav-label-wrap">Project Management</span>
          </div>

          <!-- Reporting (disabled) -->
          <div
            class="nav-item disabled"
            matTooltip="Reporting"
            matTooltipPosition="right"
          >
            <mat-icon class="nav-icon">show_chart</mat-icon>
            <span class="nav-label">Reporting</span>
          </div>

          <!-- Documents (disabled) -->
          <div
            class="nav-item disabled"
            matTooltip="Documents"
            matTooltipPosition="right"
          >
            <mat-icon class="nav-icon">folder_shared</mat-icon>
            <span class="nav-label">Documents</span>
          </div>

          <!-- KNOWLEDGE DATABASE (active — this module) -->
          <a
            class="nav-item"
            routerLink="/knowledge"
            routerLinkActive="active"
            matTooltip="Knowledge Database"
            matTooltipPosition="right"
          >
            <mat-icon class="nav-icon">school</mat-icon>
            <span class="nav-label nav-label-wrap">Knowledge Database</span>
          </a>

          <!-- Help (disabled) -->
          <div
            class="nav-item disabled"
            matTooltip="Help"
            matTooltipPosition="right"
          >
            <mat-icon class="nav-icon">help_outline</mat-icon>
            <span class="nav-label">Help</span>
          </div>

          <!-- Settings (disabled) -->
          <div
            class="nav-item disabled"
            matTooltip="Settings"
            matTooltipPosition="right"
          >
            <mat-icon class="nav-icon">settings</mat-icon>
            <span class="nav-label">Settings</span>
          </div>
        </div>
      </mat-sidenav>

      <mat-sidenav-content class="content">
        <!-- Dark toolbar — matches DCS top bar -->
        <div class="toolbar">
          <span class="toolbar-title">Knowledge Database</span>
          <span class="toolbar-spacer"></span>
          <div class="toolbar-right">
            <select class="lang-select">
              <option value="EN" selected>English</option>
            </select>
            <button mat-icon-button class="toolbar-icon-btn">
              <mat-icon>search</mat-icon>
            </button>
            <div class="toolbar-user">
              <span class="toolbar-username">Mock_User</span>
              <div class="toolbar-avatar">
                <img
                  class="avatar-img"
                  src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%235C77FF'%3E%3Cpath d='M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z'/%3E%3C/svg%3E"
                  alt="avatar"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Top button bar — matches DCS scrumboard style -->
        <div class="top-bar">
          <button
            mat-stroked-button
            class="rounded-full buttontam"
            routerLink="/knowledge"
            routerLinkActive="btn-active"
            [routerLinkActiveOptions]="{ exact: true }"
          >
            <mat-icon class="btn-icon">list</mat-icon> LISTING
          </button>
          <button
            mat-stroked-button
            class="rounded-full buttontam"
            routerLink="/knowledge/new"
            routerLinkActive="btn-active"
          >
            <mat-icon class="btn-icon">add</mat-icon> SUBMIT NEW ITEM
          </button>
          <button
            mat-stroked-button
            class="rounded-full buttontam"
            routerLink="/documents-used"
            routerLinkActive="btn-active"
          >
            <mat-icon class="btn-icon">folder_shared</mat-icon> DOCUMENTS USED
          </button>
          <button
            mat-stroked-button
            class="rounded-full buttontam"
            routerLink="/stats"
            routerLinkActive="btn-active"
          >
            <mat-icon class="btn-icon">bar_chart</mat-icon> STATISTICS
          </button>
        </div>
        <div class="page-content">
          <router-outlet />
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [
    `
      /* ===== Full-height shell ===== */
      .app-container {
        height: 100vh;
      }

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
      }

      /* Individual nav item */
      .nav-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        min-height: 40px;
        padding: 4px 0;
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

      /* ===== Content area ===== */
      .content {
        display: flex;
        flex-direction: column;
      }

      /* ===== Dark toolbar — matches DCS top bar ===== */
      .toolbar {
        display: flex;
        align-items: center;
        height: 64px;
        background: #3c3c3c;
        color: #ffffff;
        padding: 0 24px;
        box-sizing: border-box;
        white-space: nowrap;
        width: 100%;
      }
      .toolbar-title {
        font-weight: 500;
        font-size: 18px;
        line-height: 26px;
      }
      @media (max-width: 1200px) {
        .toolbar-title {
          font-size: 14px;
        }
      }
      .toolbar-spacer {
        flex: 1;
      }
      .toolbar-right {
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .lang-select {
        background: #ffffff;
        color: #000000;
        border-radius: 10px !important;
        border: none;
        font-size: 14px;
        font-family: inherit;
        cursor: pointer;
        outline: none;
        padding: 4px 8px;
      }
      .lang-select option {
        background: #1a202e;
        color: #ffffff;
      }
      .toolbar-icon-btn {
        color: #5c6bc0 !important;
        margin-left: 4px;
      }
      .toolbar-user {
        display: flex;
        align-items: center;
        cursor: pointer;
        padding: 4px 4px 4px 12px;
        border-radius: 4px;
        transition: background 0.15s ease;
      }
      .toolbar-user:hover {
        background: rgba(255, 255, 255, 0.04);
      }
      .toolbar-username {
        font-size: 14px;
        font-weight: 500;
        color: #fffff;
        margin-right: 12px;
      }
      .toolbar-avatar {
        width: 36px;
        height: 36px;
        border-radius: 9999px;
        background: rgba(92, 119, 255, 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .avatar-img {
        height: 2rem;
        position: relative;
        right: 0;
        border-radius: 9999px;
      }

      /* ===== Top button bar — DCS scrumboard style ===== */
      .top-bar {
        display: flex;
        align-items: center;
        padding: 10px 24px;
      }
      .rounded-full {
        border-radius: 9999px !important;
      }
      .buttontam {
        color: #4848ef !important;
        background-color: #dfe7ef !important;
        margin-left: 10px;
        font-weight: 500;
        padding: 0 15px !important;
        display: inline-flex;
        align-items: center;
      }
      .buttontam:first-child {
        margin-left: 0;
      }
      .btn-icon {
        font-size: 19px !important;
        width: 19px !important;
        height: 19px !important;
        margin-right: 4px;
      }
      .btn-active {
        background-color: #4848ef !important;
        color: #ffffff !important;
      }

      @media only screen and (min-width: 2700px) {
        .buttontam {
          font-size: 16px;
          height: 37px;
        }
      }
      @media only screen and (min-width: 1600px) and (max-width: 2699px) {
        .buttontam {
          font-size: 14px;
          height: 37px;
        }
      }
      @media only screen and (max-width: 1599px) {
        .buttontam {
          font-size: 12px;
          height: 33px;
        }
      }

      .page-content {
        padding: 24px;
        flex: 1;
      }
    `,
  ],
})
export class AppComponent {}
