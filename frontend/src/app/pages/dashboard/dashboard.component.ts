import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="max-w-7xl mx-auto">
      <h1 class="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Dashboard</h1>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <!-- Status Card -->
        <mat-card class="shadow-lg hover:shadow-xl transition-shadow">
          <mat-card-content class="flex items-center justify-between p-4">
            <div>
              <p class="text-sm text-gray-600 mb-1">Status</p>
              <p class="text-2xl font-bold" [class]="status.healthy ? 'text-green-600' : 'text-red-600'">
                {{ status.healthy ? 'Running' : 'Error' }}
              </p>
            </div>
            <mat-icon [class]="status.healthy ? 'text-green-500' : 'text-red-500'" class="text-4xl">
              {{ status.healthy ? 'check_circle' : 'error' }}
            </mat-icon>
          </mat-card-content>
        </mat-card>

        <!-- Version Card -->
        <mat-card class="shadow-lg hover:shadow-xl transition-shadow">
          <mat-card-content class="flex items-center justify-between p-4">
            <div>
              <p class="text-sm text-gray-600 mb-1">Version</p>
              <p class="text-2xl font-bold text-blue-600">{{ version }}</p>
            </div>
            <mat-icon class="text-blue-500 text-4xl">info</mat-icon>
          </mat-card-content>
        </mat-card>

        <!-- Plugins Card -->
        <mat-card class="shadow-lg hover:shadow-xl transition-shadow cursor-pointer" routerLink="/plugins">
          <mat-card-content class="flex items-center justify-between p-4">
            <div>
              <p class="text-sm text-gray-600 mb-1">Plugins</p>
              <p class="text-2xl font-bold text-purple-600">{{ pluginCount }}</p>
            </div>
            <mat-icon class="text-purple-500 text-4xl">extension</mat-icon>
          </mat-card-content>
        </mat-card>

        <!-- Updates Card -->
        <mat-card class="shadow-lg hover:shadow-xl transition-shadow cursor-pointer" routerLink="/updates">
          <mat-card-content class="flex items-center justify-between p-4">
            <div>
              <p class="text-sm text-gray-600 mb-1">Updates</p>
              <p class="text-2xl font-bold" [class]="updatesAvailable > 0 ? 'text-orange-600' : 'text-green-600'">
                {{ updatesAvailable }}
              </p>
            </div>
            <mat-icon [class]="updatesAvailable > 0 ? 'text-orange-500' : 'text-green-500'" class="text-4xl">
              {{ updatesAvailable > 0 ? 'notification_important' : 'check_circle' }}
            </mat-icon>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Quick Info -->
      <div class="mt-6 md:mt-8">
        <mat-card class="shadow-lg">
          <mat-card-header class="pb-4">
            <mat-card-title class="text-xl">Welcome to MagicMirror Admin</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p class="text-gray-700 mb-4">
              Manage your MagicMirror installation from this central dashboard.
            </p>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="flex items-start space-x-3">
                <mat-icon class="text-blue-500">computer</mat-icon>
                <div>
                  <p class="font-semibold">System Info</p>
                  <p class="text-sm text-gray-600">View host details and resources</p>
                </div>
              </div>
              <div class="flex items-start space-x-3">
                <mat-icon class="text-purple-500">extension</mat-icon>
                <div>
                  <p class="font-semibold">Plugin Manager</p>
                  <p class="text-sm text-gray-600">Install GitHub-hosted plugins</p>
                </div>
              </div>
              <div class="flex items-start space-x-3">
                <mat-icon class="text-green-500">article</mat-icon>
                <div>
                  <p class="font-semibold">Central Logs</p>
                  <p class="text-sm text-gray-600">Monitor system and plugin logs</p>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: []
})
export class DashboardComponent implements OnInit {
  status = { healthy: true };
  version = '1.0.0';
  pluginCount = 0;
  updatesAvailable = 0;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadStatus();
  }

  loadStatus() {
    this.http.get<any>('/api/admin/health').subscribe({
      next: (data) => {
        this.status.healthy = data.status === 'healthy';
        this.version = data.version || '1.0.0';
        this.pluginCount = data.plugins || 0;
      },
      error: (err) => {
        console.error('Error loading status:', err);
        this.status.healthy = false;
      }
    });
  }
}
