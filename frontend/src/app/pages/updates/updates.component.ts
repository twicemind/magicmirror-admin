import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';

interface UpdateInfo {
  component: string;
  currentVersion: string;
  latestVersion: string;
  hasUpdate: boolean;
  changelog?: string;
  type: 'system' | 'plugin';
}

@Component({
  selector: 'app-updates',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="max-w-7xl mx-auto">
      <div class="flex items-center justify-between mb-4 md:mb-6">
        <h1 class="text-2xl md:text-3xl font-bold">Updates</h1>
        <button mat-raised-button color="primary" (click)="checkForUpdates()" [disabled]="checking">
          <mat-icon>refresh</mat-icon>
          Check for Updates
        </button>
      </div>

      <div *ngIf="checking" class="flex justify-center p-12">
        <div class="text-center">
          <mat-spinner class="mx-auto mb-4"></mat-spinner>
          <p class="text-gray-600">Checking for updates...</p>
        </div>
      </div>

      <div *ngIf="!checking" class="space-y-4">
        <!-- System Update -->
        <mat-card class="shadow-lg">
          <mat-card-header class="pb-4">
            <mat-icon [class]="systemUpdate.hasUpdate ? 'text-orange-500' : 'text-green-500'" class="mr-3">
              {{ systemUpdate.hasUpdate ? 'notification_important' : 'check_circle' }}
            </mat-icon>
            <mat-card-title>MagicMirror Admin</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <p class="text-sm text-gray-600 mb-1">Current Version</p>
                <p class="text-lg font-semibold">{{ systemUpdate.currentVersion }}</p>
              </div>
              <mat-icon class="text-gray-400 hidden md:block">arrow_forward</mat-icon>
              <div>
                <p class="text-sm text-gray-600 mb-1">Latest Version</p>
                <p class="text-lg font-semibold" [class.text-orange-600]="systemUpdate.hasUpdate">
                  {{ systemUpdate.latestVersion }}
                </p>
              </div>
              <div class="md:ml-auto">
                <button 
                  mat-raised-button 
                  [color]="systemUpdate.hasUpdate ? 'accent' : 'primary'"
                  [disabled]="!systemUpdate.hasUpdate || updating['system']"
                  (click)="updateComponent('system')">
                  <mat-spinner *ngIf="updating['system']" diameter="20" class="inline-block mr-2"></mat-spinner>
                  <mat-icon *ngIf="!updating['system']">{{ systemUpdate.hasUpdate ? 'system_update' : 'check' }}</mat-icon>
                  {{ systemUpdate.hasUpdate ? 'Update Now' : 'Up to Date' }}
                </button>
              </div>
            </div>
            <div *ngIf="systemUpdate.hasUpdate && systemUpdate.changelog" class="mt-4 p-3 bg-blue-50 rounded">
              <p class="text-sm font-semibold mb-2">What's New:</p>
              <p class="text-sm text-gray-700">{{ systemUpdate.changelog }}</p>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Plugin Updates -->
        <div *ngIf="pluginUpdates.length > 0">
          <h2 class="text-xl font-bold mb-4">Installed Plugins</h2>
          <div class="space-y-4">
            <mat-card *ngFor="let update of pluginUpdates" class="shadow-lg">
              <mat-card-content>
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div class="flex items-center space-x-3">
                    <mat-icon [class]="update.hasUpdate ? 'text-orange-500' : 'text-green-500'">
                      extension
                    </mat-icon>
                    <div>
                      <p class="font-semibold">{{ update.component }}</p>
                      <p class="text-sm text-gray-600">
                        <span *ngIf="update.hasUpdate">{{ update.currentVersion }} → {{ update.latestVersion }}</span>
                        <span *ngIf="!update.hasUpdate">v{{ update.currentVersion }}</span>
                      </p>
                    </div>
                  </div>
                  <button 
                    mat-raised-button 
                    [color]="update.hasUpdate ? 'accent' : 'primary'"
                    [disabled]="!update.hasUpdate || updating[update.component]"
                    (click)="updateComponent(update.component)">
                    <mat-spinner *ngIf="updating[update.component]" diameter="20" class="inline-block mr-2"></mat-spinner>
                    <mat-icon *ngIf="!updating[update.component]">{{ update.hasUpdate ? 'system_update' : 'check' }}</mat-icon>
                    {{ update.hasUpdate ? 'Update' : 'Up to Date' }}
                  </button>
                </div>
                <div *ngIf="update.hasUpdate && update.changelog" class="mt-3 p-2 bg-blue-50 rounded text-sm text-gray-700">
                  {{ update.changelog }}
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </div>

        <!-- Update All -->
        <div *ngIf="hasAnyUpdates()" class="flex justify-center pt-4">
          <button 
            mat-raised-button 
            color="accent" 
            class="!py-3 !px-8"
            [disabled]="updatingAll"
            (click)="updateAll()">
            <mat-spinner *ngIf="updatingAll" diameter="20" class="inline-block mr-2"></mat-spinner>
            <mat-icon *ngIf="!updatingAll">system_update_alt</mat-icon>
            {{ updatingAll ? 'Updating All...' : 'Update All' }}
          </button>
        </div>

        <!-- No Updates -->
        <div *ngIf="!hasAnyUpdates()" class="text-center p-12 bg-gray-50 rounded-lg mt-6">
          <mat-icon class="text-6xl text-green-500 mb-4">check_circle</mat-icon>
          <p class="text-xl font-semibold text-gray-700 mb-2">Everything is up to date!</p>
          <p class="text-sm text-gray-500">You're running the latest versions</p>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class UpdatesComponent implements OnInit {
  systemUpdate: UpdateInfo = {
    component: 'MagicMirror Admin',
    currentVersion: '1.0.0',
    latestVersion: '1.0.0',
    hasUpdate: false,
    type: 'system'
  };

  pluginUpdates: UpdateInfo[] = [];
  
  checking = false;
  updating: { [key: string]: boolean } = {};
  updatingAll = false;

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.checkForUpdates();
  }

  checkForUpdates() {
    this.checking = true;
    
    // Load plugins first
    this.http.get<any[]>('/api/admin/plugins').subscribe({
      next: (plugins) => {
        // Mock update check - will be replaced with real API
        setTimeout(() => {
          // System update (mock)
          this.systemUpdate.latestVersion = '1.1.0';
          this.systemUpdate.hasUpdate = true;
          this.systemUpdate.changelog = 'New features: Log system, Plugin manager improvements, Bug fixes';
          
          // Plugin updates - check each installed plugin
          this.pluginUpdates = [];
          
          plugins.forEach((plugin, index) => {
            // Simulate that some plugins have updates available
            const hasUpdate = index === 0; // First plugin has update
            const currentVersion = plugin.version;
            const latestVersion = hasUpdate ? this.incrementVersion(currentVersion) : currentVersion;
            
            this.pluginUpdates.push({
              component: plugin.name,
              currentVersion: currentVersion,
              latestVersion: latestVersion,
              hasUpdate: hasUpdate,
              changelog: hasUpdate ? `Bug fixes and improvements for ${plugin.name}` : undefined,
              type: 'plugin'
            });
          });
          
          this.checking = false;
          
          const updateCount = (this.systemUpdate.hasUpdate ? 1 : 0) + 
                             this.pluginUpdates.filter(p => p.hasUpdate).length;
          
          if (updateCount > 0) {
            this.snackBar.open(`${updateCount} update(s) available`, 'Close', { duration: 3000 });
          } else {
            this.snackBar.open('Everything is up to date', 'Close', { duration: 2000 });
          }
        }, 1500);
      },
      error: (err) => {
        console.error('Error loading plugins:', err);
        this.checking = false;
        this.snackBar.open('Error checking for updates', 'Close', { duration: 3000 });
      }
    });
  }
  
  incrementVersion(version: string): string {
    const parts = version.split('.');
    const patch = parseInt(parts[2] || '0');
    parts[2] = (patch + 1).toString();
    return parts.join('.');
  }

  updateComponent(component: string) {
    this.updating[component] = true;
    this.snackBar.open(`Updating ${component}...`, '', { duration: 2000 });

    setTimeout(() => {
      if (component === 'system') {
        this.systemUpdate.currentVersion = this.systemUpdate.latestVersion;
        this.systemUpdate.hasUpdate = false;
      } else {
        const plugin = this.pluginUpdates.find(p => p.component === component);
        if (plugin) {
          plugin.currentVersion = plugin.latestVersion;
          plugin.hasUpdate = false;
        }
      }
      this.updating[component] = false;
      this.snackBar.open(`${component} updated successfully!`, 'Close', { duration: 3000 });
    }, 3000);
  }

  updateAll() {
    this.updatingAll = true;
    this.snackBar.open('Updating all components...', '', { duration: 3000 });

    setTimeout(() => {
      if (this.systemUpdate.hasUpdate) {
        this.systemUpdate.currentVersion = this.systemUpdate.latestVersion;
        this.systemUpdate.hasUpdate = false;
      }
      
      this.pluginUpdates.forEach(plugin => {
        if (plugin.hasUpdate) {
          plugin.currentVersion = plugin.latestVersion;
          plugin.hasUpdate = false;
        }
      });

      this.updatingAll = false;
      this.snackBar.open('All updates completed!', 'Close', { duration: 3000 });
    }, 5000);
  }

  hasAnyUpdates(): boolean {
    return this.systemUpdate.hasUpdate || 
           this.pluginUpdates.some(p => p.hasUpdate);
  }
}
