/**
 * app.routes.ts — Application routing configuration.
 * All feature components are lazy-loaded for optimal bundle splitting.
 * The root path is protected by authGuard (requires login).
 * Individual routes may have additional permission guards.
 */

import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { permissionGuard } from './core/guards/permission.guard';

export const routes: Routes = [
  // Public: login page (no guard)
  {
    path: 'login',
    loadComponent: () =>
      import('./features/login/login.component').then(m => m.LoginComponent),
  },
  // Protected: main app shell with sidebar + toolbar
  {
    path: '',
    loadComponent: () =>
      import('./layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [authGuard],  // Redirect to /login if not authenticated
    children: [
      { path: '', redirectTo: 'knowledge', pathMatch: 'full' },
      {
        path: 'knowledge',
        loadComponent: () =>
          import('./features/listing/listing.component').then(m => m.ListingComponent),
      },
      {
        path: 'knowledge/new',
        loadComponent: () =>
          import('./features/submit/submit.component').then(m => m.SubmitComponent),
      },
      {
        path: 'documents-used',
        loadComponent: () =>
          import('./features/documents-used/documents-used.component').then(m => m.DocumentsUsedComponent),
      },
      {
        path: 'stats',
        loadComponent: () =>
          import('./features/stats/stats.component').then(m => m.StatsComponent),
        canActivate: [permissionGuard('stats:read')],  // Only admin + manager can view stats
      },
    ],
  },
  // Catch-all: redirect unknown routes to login
  { path: '**', redirectTo: 'login' },
];
