import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule
  ],
  template: `
    <mat-sidenav-container class="h-screen">
      <!-- Sidebar -->
      <mat-sidenav mode="side" opened class="w-64 bg-gray-900 text-white">
        <div class="p-4">
          <h1 class="text-xl font-bold mb-6">MagicMirror Admin</h1>
          
          <mat-nav-list>
            <a mat-list-item routerLink="/dashboard" class="text-white hover:bg-gray-800">
              <mat-icon class="mr-3">dashboard</mat-icon>
              <span>Dashboard</span>
            </a>
            
            <a mat-list-item routerLink="/setup" class="text-white hover:bg-gray-800">
              <mat-icon class="mr-3">settings</mat-icon>
              <span>Setup</span>
            </a>
            
            <a mat-list-item routerLink="/modules" class="text-white hover:bg-gray-800">
              <mat-icon class="mr-3">extension</mat-icon>
              <span>Modules</span>
            </a>
            
            <a mat-list-item routerLink="/wlan" class="text-white hover:bg-gray-800">
              <mat-icon class="mr-3">wifi</mat-icon>
              <span>WLAN</span>
            </a>
            
            <a mat-list-item routerLink="/system" class="text-white hover:bg-gray-800">
              <mat-icon class="mr-3">computer</mat-icon>
              <span>System</span>
            </a>
          </mat-nav-list>
        </div>
      </mat-sidenav>

      <!-- Main Content -->
      <mat-sidenav-content>
        <!-- Header -->
        <mat-toolbar color="primary" class="shadow-md">
          <span class="flex-1">MagicMirror Administration</span>
          <button mat-icon-button>
            <mat-icon>language</mat-icon>
          </button>
          <button mat-icon-button>
            <mat-icon>notifications</mat-icon>
          </button>
        </mat-toolbar>

        <!-- Page Content -->
        <div class="p-6 bg-gray-50 min-h-[calc(100vh-64px)]">
          <router-outlet></router-outlet>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
    }
  `]
})
export class AppComponent {
  title = 'MagicMirror Admin';
}
