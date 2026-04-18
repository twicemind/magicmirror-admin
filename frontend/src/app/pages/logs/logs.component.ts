import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { HttpClient } from '@angular/common/http';

interface LogEntry {
  timestamp: string;
  source: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
}

interface LogSource {
  id: string;
  name: string;
  enabled: boolean;
  type: 'system' | 'plugin';
}

@Component({
  selector: 'app-logs',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatChipsModule,
    MatSlideToggleModule
  ],
  template: `
    <div class="max-w-7xl mx-auto">
      <h1 class="text-2xl md:text-3xl font-bold mb-4 md:mb-6">System Logs</h1>

      <!-- Filters -->
      <mat-card class="shadow-lg mb-4">
        <mat-card-content class="p-4">
          <div class="flex flex-col md:flex-row gap-4">
            <!-- Log Sources -->
            <div class="flex-1">
              <p class="text-sm font-semibold mb-3">Log Sources</p>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div *ngFor="let source of logSources" class="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div class="flex items-center space-x-2">
                    <mat-icon [class]="source.type === 'system' ? 'text-blue-500' : 'text-purple-500'" class="text-sm">
                      {{ source.type === 'system' ? 'settings' : 'extension' }}
                    </mat-icon>
                    <span class="text-sm">{{ source.name }}</span>
                  </div>
                  <mat-slide-toggle 
                    [(ngModel)]="source.enabled"
                    (change)="filterLogs()"
                    color="primary">
                  </mat-slide-toggle>
                </div>
              </div>
            </div>

            <!-- Log Levels -->
            <div class="md:w-64">
              <p class="text-sm font-semibold mb-3">Log Levels</p>
              <div class="space-y-2">
                <div *ngFor="let level of logLevels" class="flex items-center justify-between">
                  <mat-chip [class]="'log-level-' + level" class="!h-7">
                    {{ level | uppercase }}
                  </mat-chip>
                  <mat-slide-toggle 
                    [(ngModel)]="enabledLevels[level]"
                    (change)="filterLogs()"
                    color="primary">
                  </mat-slide-toggle>
                </div>
              </div>
            </div>
          </div>

          <div class="flex flex-col md:flex-row gap-2 mt-4 pt-4 border-t">
            <button mat-raised-button color="primary" (click)="refresh()">
              <mat-icon>refresh</mat-icon>
              Refresh
            </button>
            <button mat-raised-button (click)="clearLogs()">
              <mat-icon>clear_all</mat-icon>
              Clear
            </button>
            <button mat-raised-button (click)="downloadLogs()">
              <mat-icon>download</mat-icon>
              Download
            </button>
            <div class="flex-1"></div>
            <mat-slide-toggle [(ngModel)]="autoRefresh" (change)="toggleAutoRefresh()" color="primary">
              Auto-refresh (5s)
            </mat-slide-toggle>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Log Entries -->
      <mat-card class="shadow-lg">
        <mat-card-content class="p-0">
          <div class="log-container bg-gray-900 text-gray-100 font-mono text-sm overflow-auto" style="max-height: 60vh;">
            <div *ngIf="filteredLogs.length === 0" class="p-8 text-center text-gray-500">
              <mat-icon class="text-4xl mb-2">article</mat-icon>
              <p>No logs to display</p>
              <p class="text-xs mt-2">Adjust filters or wait for new log entries</p>
            </div>
            
            <div *ngFor="let log of filteredLogs" 
                 class="log-entry p-3 border-b border-gray-800 hover:bg-gray-800 transition-colors"
                 [class.bg-red-900]="log.level === 'error'"
                 [class.bg-yellow-900]="log.level === 'warn'">
              <div class="flex flex-col md:flex-row md:items-start gap-2">
                <span class="text-xs text-gray-400 md:w-40 flex-shrink-0">{{ log.timestamp }}</span>
                <span class="text-xs px-2 py-1 rounded inline-block w-fit" 
                      [class.bg-blue-600]="log.level === 'info'"
                      [class.bg-yellow-600]="log.level === 'warn'"
                      [class.bg-red-600]="log.level === 'error'"
                      [class.bg-gray-600]="log.level === 'debug'">
                  {{ log.level.toUpperCase() }}
                </span>
                <span class="text-xs text-purple-400 md:w-32 flex-shrink-0">{{ log.source }}</span>
                <span class="flex-1 break-all">{{ log.message }}</span>
              </div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .log-container {
      scrollbar-width: thin;
      scrollbar-color: #4a5568 #1a202c;
    }
    
    .log-container::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    
    .log-container::-webkit-scrollbar-track {
      background: #1a202c;
    }
    
    .log-container::-webkit-scrollbar-thumb {
      background: #4a5568;
      border-radius: 4px;
    }
  `]
})
export class LogsComponent implements OnInit, OnDestroy {
  logs: LogEntry[] = [];
  filteredLogs: LogEntry[] = [];
  
  logSources: LogSource[] = [];

  logLevels = ['info', 'warn', 'error', 'debug'];
  enabledLevels: { [key: string]: boolean } = {
    'info': true,
    'warn': true,
    'error': true,
    'debug': false
  };

  autoRefresh = false;
  refreshInterval: any;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadLogSources();
    this.loadLogs();
  }

  ngOnDestroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  loadLogSources() {
    // Add default system sources
    this.logSources = [
      { id: 'admin', name: 'Admin System', enabled: true, type: 'system' },
      { id: 'nginx', name: 'NGINX', enabled: true, type: 'system' },
      { id: 'magicmirror', name: 'MagicMirror', enabled: true, type: 'system' }
    ];

    // Load plugin sources
    this.http.get<any[]>('/api/admin/plugins').subscribe({
      next: (plugins) => {
        plugins.forEach(plugin => {
          this.logSources.push({
            id: plugin.id,
            name: plugin.name,
            enabled: true,
            type: 'plugin'
          });
        });
        this.filterLogs();
      },
      error: (err) => {
        console.error('Error loading plugin sources:', err);
      }
    });
  }

  loadLogs() {
    // Mock logs - will be replaced with real API
    const now = new Date();
    this.logs = [
      {
        timestamp: this.formatTime(new Date(now.getTime() - 60000)),
        source: 'admin',
        level: 'info',
        message: 'MagicMirror Admin Platform started successfully'
      },
      {
        timestamp: this.formatTime(new Date(now.getTime() - 50000)),
        source: 'admin',
        level: 'info',
        message: 'Plugin loader initialized - 2 plugins found'
      },
      {
        timestamp: this.formatTime(new Date(now.getTime() - 45000)),
        source: 'setup-manager',
        level: 'info',
        message: 'Setup Manager plugin loaded successfully'
      },
      {
        timestamp: this.formatTime(new Date(now.getTime() - 44000)),
        source: 'ap-systemupdater',
        level: 'info',
        message: 'AP System Updater plugin loaded successfully'
      },
      {
        timestamp: this.formatTime(new Date(now.getTime() - 43000)),
        source: 'ap-systemupdater',
        level: 'warn',
        message: 'Running in mock mode (macOS development)'
      },
      {
        timestamp: this.formatTime(new Date(now.getTime() - 40000)),
        source: 'nginx',
        level: 'info',
        message: 'Reverse proxy configured for port 80'
      },
      {
        timestamp: this.formatTime(new Date(now.getTime() - 30000)),
        source: 'magicmirror',
        level: 'warn',
        message: 'Config file not found, using defaults'
      },
      {
        timestamp: this.formatTime(new Date(now.getTime() - 20000)),
        source: 'admin',
        level: 'debug',
        message: 'API request: GET /api/admin/health'
      },
      {
        timestamp: this.formatTime(new Date(now.getTime() - 10000)),
        source: 'setup-manager',
        level: 'debug',
        message: 'Checking for setup updates'
      }
    ];
    this.filterLogs();
  }

  filterLogs() {
    const enabledSources = this.logSources
      .filter(s => s.enabled)
      .map(s => s.id);
    
    const enabledLevelsList = Object.entries(this.enabledLevels)
      .filter(([_, enabled]) => enabled)
      .map(([level]) => level);

    this.filteredLogs = this.logs.filter(log => 
      enabledSources.includes(log.source) &&
      enabledLevelsList.includes(log.level)
    );
  }

  refresh() {
    this.loadLogs();
  }

  clearLogs() {
    if (confirm('Clear all logs?')) {
      this.logs = [];
      this.filteredLogs = [];
    }
  }

  downloadLogs() {
    const content = this.filteredLogs
      .map(log => `[${log.timestamp}] [${log.level.toUpperCase()}] [${log.source}] ${log.message}`)
      .join('\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `magicmirror-logs-${Date.now()}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  toggleAutoRefresh() {
    if (this.autoRefresh) {
      this.refreshInterval = setInterval(() => {
        this.loadLogs();
      }, 5000);
    } else {
      if (this.refreshInterval) {
        clearInterval(this.refreshInterval);
      }
    }
  }

  formatTime(date: Date): string {
    return date.toISOString().replace('T', ' ').substring(0, 19);
  }
}
