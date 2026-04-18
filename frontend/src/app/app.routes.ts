import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'setup',
    loadComponent: () => import('./pages/setup/setup.component').then(m => m.SetupComponent)
  },
  {
    path: 'modules',
    loadComponent: () => import('./pages/modules/modules.component').then(m => m.ModulesComponent)
  },
  {
    path: 'wlan',
    loadComponent: () => import('./pages/wlan/wlan.component').then(m => m.WlanComponent)
  },
  {
    path: 'system',
    loadComponent: () => import('./pages/system/system.component').then(m => m.SystemComponent)
  }
];
