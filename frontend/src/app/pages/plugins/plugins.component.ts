import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';

interface Plugin {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  icon: string;
  enabled: boolean;
  routes: any[];
  menu: any[];
  permissions: any[];
  repo?: string;
  updateAvailable?: boolean;
}

@Component({
  selector: 'app-plugins',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="max-w-7xl mx-auto">
      <h1 class="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Plugin Manager</h1>

      <!-- Install from GitHub -->
      <mat-card class="shadow-lg mb-6">
        <mat-card-header class="pb-4">
          <mat-icon class="mr-3 text-blue-500">add_circle</mat-icon>
          <mat-card-title>Install from GitHub</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="flex flex-col md:flex-row gap-4">
            <mat-form-field class="flex-1">
              <mat-label>GitHub Repository (owner/repo)</mat-label>
              <input matInput [(ngModel)]="repoUrl" placeholder="magicmirror/MMM-Weather">
            </mat-form-field>
            <button mat-raised-button color="primary" (click)="installPlugin()" [disabled]="installing || !repoUrl">
              <mat-icon *ngIf="!installing">download</mat-icon>
              <mat-spinner *ngIf="installing" diameter="20" class="inline-block"></mat-spinner>
              {{ installing ? 'Installing...' : 'Install' }}
            </button>
          </div>
          <p class="text-sm text-gray-600 mt-2">
            Enter GitHub repository in format: <code class="bg-gray-100 px-2 py-1 rounded">owner/repository</code>
          </p>
        </mat-card-content>
      </mat-card>

      <!-- Installed Plugins -->
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-xl font-bold">Installed Plugins</h2>
        <button mat-icon-button (click)="loadPlugins()">
          <mat-icon>refresh</mat-icon>
        </button>
      </div>

      <div *ngIf="loading" class="flex justify-center p-12">
        <mat-spinner></mat-spinner>
      </div>

      <div *ngIf="!loading && plugins.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <mat-card *ngFor="let plugin of plugins" class="shadow-lg">
          <mat-card-header>
            <mat-icon [class]="plugin.enabled ? 'text-green-500' : 'text-gray-400'" class="mr-3">
              {{ plugin.icon || 'extension' }}
            </mat-icon>
            <div>
              <mat-card-title class="text-lg">{{ plugin.name }}</mat-card-title>
              <mat-card-subtitle class="flex items-center gap-2">
                <span>v{{ plugin.version }}</span>
                <mat-chip *ngIf="plugin.updateAvailable" class="!h-6 !text-xs" color="accent">
                  Update Available
                </mat-chip>
                <mat-chip *ngIf="!plugin.enabled" class="!h-6 !text-xs" color="warn">
                  Disabled
                </mat-chip>
              </mat-card-subtitle>
            </div>
          </mat-card-header>
          <mat-card-content>
            <p class="text-sm text-gray-600 mb-2">{{ plugin.description }}</p>
            <p class="text-xs text-gray-500 mb-1">
              <mat-icon class="text-xs align-middle">person</mat-icon>
              {{ plugin.author }}
            </p>
            <p class="text-xs text-gray-500" *ngIf="plugin.repo">
              <mat-icon class="text-xs align-middle">code</mat-icon>
              {{ plugin.repo }}
            </p>
          </mat-card-content>
          <mat-card-actions class="flex gap-2">
            <button mat-button color="warn" (click)="deletePlugin(plugin)" [disabled]="deleting[plugin.id]">
              <mat-icon>delete</mat-icon>
              Delete
            </button>
            <button mat-button color="primary" *ngIf="plugin.updateAvailable" (click)="updatePlugin(plugin)" [disabled]="updating[plugin.id]">
              <mat-icon>system_update</mat-icon>
              Update
            </button>
          </mat-card-actions>
        </mat-card>
      </div>

      <div *ngIf="!loading && plugins.length === 0" class="text-center p-12 bg-gray-50 rounded-lg">
        <mat-icon class="text-6xl text-gray-400 mb-4">extension_off</mat-icon>
        <p class="text-gray-600 mb-4">No plugins installed yet</p>
        <p class="text-sm text-gray-500">Install your first plugin from GitHub above</p>
      </div>
    </div>
  `,
  styles: []
})
export class PluginsComponent implements OnInit {
  plugins: Plugin[] = [];
  repoUrl = '';
  loading = true;
  installing = false;
  updating: { [key: string]: boolean } = {};
  deleting: { [key: string]: boolean } = {};

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadPlugins();
  }

  loadPlugins() {
    this.loading = true;
    
    this.http.get<Plugin[]>('/api/admin/plugins').subscribe({
      next: (data) => {
        this.plugins = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading plugins:', err);
        this.snackBar.open('Error loading plugins', 'Close', { duration: 3000 });
        this.plugins = [];
        this.loading = false;
      }
    });
  }

  installPlugin() {
    if (!this.repoUrl) return;

    this.installing = true;
    this.snackBar.open(`Installing ${this.repoUrl}...`, '', { duration: 2000 });

    // TODO: Implement real plugin installation API
    // Mock installation for now
    setTimeout(() => {
      const repoName = this.repoUrl.split('/')[1] || 'plugin';
      this.plugins.push({
        id: Date.now().toString(),
        name: repoName,
        version: '1.0.0',
        description: 'GitHub plugin',
        author: 'Unknown',
        icon: 'extension',
        enabled: true,
        routes: [],
        menu: [],
        permissions: [],
        repo: this.repoUrl,
        updateAvailable: false
      });
      this.installing = false;
      this.repoUrl = '';
      this.snackBar.open('Plugin installed successfully!', 'Close', { duration: 3000 });
    }, 2000);
  }

  updatePlugin(plugin: Plugin) {
    this.updating[plugin.id] = true;
    this.snackBar.open(`Updating ${plugin.name}...`, '', { duration: 2000 });

    setTimeout(() => {
      plugin.updateAvailable = false;
      this.updating[plugin.id] = false;
      this.snackBar.open('Plugin updated successfully!', 'Close', { duration: 3000 });
    }, 2000);
  }

  deletePlugin(plugin: Plugin) {
    if (!confirm(`Delete plugin "${plugin.name}"?`)) return;

    this.deleting[plugin.id] = true;
    this.snackBar.open(`Deleting ${plugin.name}...`, '', { duration: 2000 });

    setTimeout(() => {
      this.plugins = this.plugins.filter(p => p.id !== plugin.id);
      delete this.deleting[plugin.id];
      this.snackBar.open('Plugin deleted successfully!', 'Close', { duration: 3000 });
    }, 1500);
  }
}
