import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';

interface MMInstallation {
  installed: boolean;
  type?: string;
  path?: string;
  modules_path?: string;
  version?: string;
  config_path?: string;
}

interface MMModule {
  name: string;
  path: string;
  installed: boolean;
  version?: string;
  author?: string;
  description?: string;
  repository?: string;
  configured?: boolean;
}

@Component({
  selector: 'app-mm-modules',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    MatTooltipModule
  ],
  templateUrl: './mm-modules.component.html',
  styleUrls: ['./mm-modules.component.css']
})
export class MMModulesComponent implements OnInit {
  installation: MMInstallation | null = null;
  modules: MMModule[] = [];
  
  // UI State
  loadingInstallation = true;
  loadingModules = false;
  installingModule = false;
  uninstallingModule: { [key: string]: boolean } = {};
  
  // Form
  repoUrl = '';

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.checkInstallation();
  }

  // ========================================================================
  // Installation Detection
  // ========================================================================

  checkInstallation(): void {
    this.loadingInstallation = true;
    
    this.http.get<MMInstallation>('/api/admin/plugins/ap-modules/installation')
      .subscribe({
        next: (data) => {
          this.installation = data;
          this.loadingInstallation = false;
          
          if (data.installed) {
            this.loadModules();
          }
        },
        error: (err) => {
          console.error('Error checking installation:', err);
          this.loadingInstallation = false;
          this.snackBar.open('Fehler beim Prüfen der Installation', 'OK', { duration: 3000 });
        }
      });
  }

  // ========================================================================
  // Module Management
  // ========================================================================

  loadModules(): void {
    this.loadingModules = true;
    
    this.http.get<MMModule[]>('/api/admin/plugins/ap-modules/modules')
      .subscribe({
        next: (data) => {
          this.modules = data;
          this.loadingModules = false;
        },
        error: (err) => {
          console.error('Error loading modules:', err);
          this.loadingModules = false;
          this.snackBar.open('Fehler beim Laden der Module', 'OK', { duration: 3000 });
        }
      });
  }

  installModule(): void {
    if (!this.repoUrl) {
      this.snackBar.open('Bitte Repository URL eingeben', 'OK', { duration: 2000 });
      return;
    }

    this.installingModule = true;
    this.snackBar.open(`Installiere Modul von ${this.repoUrl}...`, '', { duration: 2000 });

    this.http.post('/api/admin/plugins/ap-modules/modules/install', {
      repository: this.repoUrl
    }).subscribe({
      next: (response: any) => {
        this.installingModule = false;
        this.repoUrl = '';
        this.snackBar.open(response.message || 'Modul erfolgreich installiert', 'OK', { duration: 3000 });
        this.loadModules();
      },
      error: (err) => {
        console.error('Error installing module:', err);
        this.installingModule = false;
        const errorMsg = err.error?.detail || 'Fehler beim Installieren des Moduls';
        this.snackBar.open(errorMsg, 'OK', { duration: 5000 });
      }
    });
  }

  uninstallModule(module: MMModule): void {
    if (!confirm(`Modul "${module.name}" wirklich deinstallieren?`)) {
      return;
    }

    this.uninstallingModule[module.name] = true;
    this.snackBar.open(`Deinstalliere ${module.name}...`, '', { duration: 2000 });

    this.http.delete(`/api/admin/plugins/ap-modules/modules/${module.name}`)
      .subscribe({
        next: (response: any) => {
          this.uninstallingModule[module.name] = false;
          this.snackBar.open(response.message || 'Modul deinstalliert', 'OK', { duration: 3000 });
          this.loadModules();
        },
        error: (err) => {
          console.error('Error uninstalling module:', err);
          this.uninstallingModule[module.name] = false;
          const errorMsg = err.error?.detail || 'Fehler beim Deinstallieren';
          this.snackBar.open(errorMsg, 'OK', { duration: 5000 });
        }
      });
  }

  // ========================================================================
  // Helpers
  // ========================================================================

  getInstallationIcon(): string {
    if (!this.installation || !this.installation.installed) {
      return 'error_outline';
    }
    return this.installation.type === 'docker' ? 'sailing' : 'home';
  }

  getInstallationColor(): string {
    if (!this.installation || !this.installation.installed) {
      return 'text-red-500';
    }
    return this.installation.type === 'docker' ? 'text-blue-500' : 'text-green-500';
  }

  getInstallationTypeLabel(): string {
    if (!this.installation || !this.installation.installed) {
      return 'Nicht installiert';
    }
    return this.installation.type === 'docker' ? 'MagicMirrorOS (Docker)' : 'Native Installation';
  }
}
