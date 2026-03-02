import { Routes } from '@angular/router';

export const routes: Routes = [
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
    path: 'knowledge/:id',
    loadComponent: () =>
      import('./features/detail/detail.component').then(m => m.DetailComponent),
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
  },
];
