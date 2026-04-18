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
    path: 'system',
    loadComponent: () => import('./pages/system/system.component').then(m => m.SystemComponent)
  },
  {
    path: 'plugins',
    loadComponent: () => import('./pages/plugins/plugins.component').then(m => m.PluginsComponent)
  },
  {
    path: 'updates',
    loadComponent: () => import('./pages/updates/updates.component').then(m => m.UpdatesComponent)
  },
  {
    path: 'logs',
    loadComponent: () => import('./pages/logs/logs.component').then(m => m.LogsComponent)
  },
  {
    path: 'system-updater',
    loadComponent: () => import('./pages/system-updater/system-updater.component').then(m => m.SystemUpdaterComponent)
  },
  {
    path: 'modules',
    loadComponent: () => import('./pages/mm-modules/mm-modules.component').then(m => m.MMModulesComponent)
  }
];
