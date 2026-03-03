import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { permissionGuard } from './core/guards/permission.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: '',
    loadComponent: () =>
      import('./layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [authGuard],
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
        canActivate: [permissionGuard('stats:read')],
      },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
