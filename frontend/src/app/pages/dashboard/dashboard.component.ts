import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpClient } from '@angular/common/http';

interface PluginMetadata {
  id: string;
  name: string;
  version: string;
  description: string;
  icon: string;
  enabled: boolean;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="dashboard">
      <h1 class="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Status Card -->
        <mat-card class="shadow-lg">
          <mat-card-header>
            <mat-icon class="mr-2 text-green-500">check_circle</mat-icon>
            <mat-card-title>System Status</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p class="text-2xl font-bold text-green-600">Running</p>
            <p class="text-sm text-gray-600 mt-2">All services operational</p>
          </mat-card-content>
        </mat-card>

        <!-- Plugins Card -->
        <mat-card class="shadow-lg">
          <mat-card-header>
            <mat-icon class="mr-2 text-blue-500">extension</mat-icon>
            <mat-card-title>Loaded Plugins</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p class="text-2xl font-bold text-blue-600">{{ plugins.length }}</p>
            <p class="text-sm text-gray-600 mt-2">Active plugins</p>
          </mat-card-content>
        </mat-card>

        <!-- Version Card -->
        <mat-card class="shadow-lg">
          <mat-card-header>
            <mat-icon class="mr-2 text-purple-500">info</mat-icon>
            <mat-card-title>Version</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p class="text-2xl font-bold text-purple-600">1.0.0</p>
            <p class="text-sm text-gray-600 mt-2">Latest version</p>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Loaded Plugins -->
      <div class="mt-8">
        <h2 class="text-2xl font-bold mb-4">Loaded Plugins</h2>
        
        <div *ngIf="loading" class="flex justify-center p-8">
          <mat-spinner></mat-spinner>
        </div>

        <div *ngIf="!loading && plugins.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <mat-card *ngFor="let plugin of plugins" class="shadow hover:shadow-lg transition-shadow">
            <mat-card-header>
              <mat-icon [class]="'mr-2 text-' + getIconColor(plugin.id)">{{ plugin.icon }}</mat-icon>
              <mat-card-title>{{ plugin.name }}</mat-card-title>
              <mat-card-subtitle>v{{ plugin.version }}</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <p class="text-sm text-gray-600">{{ plugin.description }}</p>
            </mat-card-content>
            <mat-card-actions>
              <button mat-button color="primary">Configure</button>
            </mat-card-actions>
          </mat-card>
        </div>

        <div *ngIf="!loading && plugins.length === 0" class="text-center p-8 text-gray-500">
          <mat-icon class="text-6xl mb-4">extension_off</mat-icon>
          <p>No plugins loaded</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      max-width: 1400px;
      margin: 0 auto;
    }
  `]
})
export class DashboardComponent implements OnInit {
  plugins: PluginMetadata[] = [];
  loading = true;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadPlugins();
  }

  loadPlugins() {
    this.http.get<PluginMetadata[]>('/api/admin/plugins')
      .subscribe({
        next: (data) => {
          this.plugins = data;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading plugins:', err);
          this.loading = false;
        }
      });
  }

  getIconColor(pluginId: string): string {
    const colors: { [key: string]: string } = {
      'setup-manager': 'blue-500',
      'wlan-manager': 'green-500',
      'module-manager': 'purple-500'
    };
    return colors[pluginId] || 'gray-500';
  }
}
