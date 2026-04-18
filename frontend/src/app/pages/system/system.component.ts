import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpClient } from '@angular/common/http';

interface SystemInfo {
  hostname: string;
  platform: string;
  uptime: string;
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
}

@Component({
  selector: 'app-system',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="max-w-7xl mx-auto">
      <h1 class="text-2xl md:text-3xl font-bold mb-4 md:mb-6">System Information</h1>

      <div *ngIf="loading" class="flex justify-center p-12">
        <mat-spinner></mat-spinner>
      </div>

      <div *ngIf="!loading && systemInfo" class="space-y-4 md:space-y-6">
        <!-- Host Info -->
        <mat-card class="shadow-lg">
          <mat-card-header class="pb-4">
            <mat-icon class="mr-3 text-blue-500">computer</mat-icon>
            <mat-card-title>Host Information</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <mat-icon class="text-gray-600">dns</mat-icon>
                <div>
                  <p class="text-sm text-gray-600">Hostname</p>
                  <p class="font-semibold">{{ systemInfo.hostname }}</p>
                </div>
              </div>
              <div class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <mat-icon class="text-gray-600">settings_system_daydream</mat-icon>
                <div>
                  <p class="text-sm text-gray-600">Platform</p>
                  <p class="font-semibold">{{ systemInfo.platform }}</p>
                </div>
              </div>
              <div class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg md:col-span-2">
                <mat-icon class="text-gray-600">schedule</mat-icon>
                <div>
                  <p class="text-sm text-gray-600">Uptime</p>
                  <p class="font-semibold">{{ systemInfo.uptime }}</p>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Resource Usage -->
        <mat-card class="shadow-lg">
          <mat-card-header class="pb-4">
            <mat-icon class="mr-3 text-green-500">speed</mat-icon>
            <mat-card-title>Resource Usage</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="space-y-6">
              <!-- CPU -->
              <div>
                <div class="flex justify-between items-center mb-2">
                  <div class="flex items-center space-x-2">
                    <mat-icon class="text-blue-500 text-lg">memory</mat-icon>
                    <span class="font-semibold">CPU Usage</span>
                  </div>
                  <span class="text-sm font-mono">{{ systemInfo.cpu_usage.toFixed(1) }}%</span>
                </div>
                <mat-progress-bar 
                  mode="determinate" 
                  [value]="systemInfo.cpu_usage"
                  [color]="systemInfo.cpu_usage > 80 ? 'warn' : 'primary'">
                </mat-progress-bar>
              </div>

              <!-- Memory -->
              <div>
                <div class="flex justify-between items-center mb-2">
                  <div class="flex items-center space-x-2">
                    <mat-icon class="text-purple-500 text-lg">storage</mat-icon>
                    <span class="font-semibold">Memory Usage</span>
                  </div>
                  <span class="text-sm font-mono">{{ systemInfo.memory_usage.toFixed(1) }}%</span>
                </div>
                <mat-progress-bar 
                  mode="determinate" 
                  [value]="systemInfo.memory_usage"
                  [color]="systemInfo.memory_usage > 80 ? 'warn' : 'primary'">
                </mat-progress-bar>
              </div>

              <!-- Disk -->
              <div>
                <div class="flex justify-between items-center mb-2">
                  <div class="flex items-center space-x-2">
                    <mat-icon class="text-orange-500 text-lg">storage</mat-icon>
                    <span class="font-semibold">Disk Usage</span>
                  </div>
                  <span class="text-sm font-mono">{{ systemInfo.disk_usage.toFixed(1) }}%</span>
                </div>
                <mat-progress-bar 
                  mode="determinate" 
                  [value]="systemInfo.disk_usage"
                  [color]="systemInfo.disk_usage > 80 ? 'warn' : 'primary'">
                </mat-progress-bar>
              </div>
            </div>
          </mat-card-content>
          <mat-card-actions>
            <button mat-button (click)="refresh()">
              <mat-icon>refresh</mat-icon>
              Refresh
            </button>
          </mat-card-actions>
        </mat-card>

        <!-- Services -->
        <mat-card class="shadow-lg">
          <mat-card-header class="pb-4">
            <mat-icon class="mr-3 text-purple-500">widgets</mat-icon>
            <mat-card-title>Services</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="space-y-3">
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div class="flex items-center space-x-3">
                  <mat-icon class="text-green-500">check_circle</mat-icon>
                  <span class="font-semibold">MagicMirror Admin API</span>
                </div>
                <span class="text-sm text-green-600">Running</span>
              </div>
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div class="flex items-center space-x-3">
                  <mat-icon class="text-green-500">check_circle</mat-icon>
                  <span class="font-semibold">NGINX</span>
                </div>
                <span class="text-sm text-green-600">Running</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <div *ngIf="error" class="text-center p-12">
        <mat-icon class="text-6xl text-red-500 mb-4">error</mat-icon>
        <p class="text-red-600">{{ error }}</p>
        <button mat-raised-button color="primary" (click)="refresh()" class="mt-4">
          Try Again
        </button>
      </div>
    </div>
  `,
  styles: []
})
export class SystemComponent implements OnInit {
  systemInfo: SystemInfo | null = null;
  loading = true;
  error = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadSystemInfo();
  }

  loadSystemInfo() {
    this.loading = true;
    this.error = '';
    
    this.http.get<SystemInfo>('/api/admin/system/info').subscribe({
      next: (data) => {
        this.systemInfo = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading system info:', err);
        this.error = err.error?.detail || 'Failed to load system information';
        this.loading = false;
      }
    });
  }

  refresh() {
    this.loadSystemInfo();
  }
}
