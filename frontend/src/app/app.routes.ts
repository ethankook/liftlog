import { Routes } from '@angular/router';
import { guestGuard } from './core/auth/guest-guard';
import { authGuard } from './core/auth/auth-guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
    canActivate: [guestGuard],
  },
  {
    path: '',
    loadComponent: () => import('./features/shell/app-shell/app-shell').then((m) => m.AppShell),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'activity',
        loadComponent: () =>
          import('./features/activity/activity-tab/activity-tab').then((m) => m.ActivityTab),
      },
      {
        path: 'workouts/:id',
        loadComponent: () =>
          import('./features/workout/workout-page/workout-page').then((m) => m.WorkoutPage),
      },
    ],
  },
];
