import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-system-updater',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatChipsModule,
    MatSlideToggleModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    MatDividerModule
  ],
  templateUrl: './system-updater.component.html',
  styleUrls: ['./system-updater.component.css']
})
export class SystemUpdaterComponent implements OnInit {
  // System Info
  systemInfo: any = null;
  
  // Update Check
  updateCheck: any = null;
  checkingUpdates = false;
  
  // Update Operation
  updating = false;
  updateResult: any = null;
  
  // Auto-Update Config
  autoUpdateConfig: any = null;
  savingConfig = false;
  
  // Reboot
  rebootRequired = false;
  
  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}
  
  ngOnInit(): void {
    this.loadSystemInfo();
    this.loadAutoUpdateConfig();
    this.checkRebootRequired();
  }
  
  // ========================================================================
  // System Info
  // ========================================================================
  
  loadSystemInfo(): void {
    this.http.get('/api/admin/plugins/ap-systemupdater/info')
      .subscribe({
        next: (data) => {
          this.systemInfo = data;
        },
        error: (err) => {
          console.error('Error loading system info:', err);
          this.snackBar.open('Fehler beim Laden der System-Informationen', 'OK', { duration: 3000 });
        }
      });
  }
  
  // ========================================================================
  // Update Check
  // ========================================================================
  
  checkForUpdates(): void {
    this.checkingUpdates = true;
    this.updateCheck = null;
    
    this.http.get('/api/admin/plugins/ap-systemupdater/check-updates')
      .subscribe({
        next: (data) => {
          this.updateCheck = data;
          this.checkingUpdates = false;
          
          const count = (data as any).packages_available;
          if (count > 0) {
            this.snackBar.open(`${count} Updates verfügbar`, 'OK', { duration: 3000 });
          } else {
            this.snackBar.open('System ist aktuell', 'OK', { duration: 3000 });
          }
        },
        error: (err) => {
          console.error('Error checking updates:', err);
          this.checkingUpdates = false;
          this.snackBar.open('Fehler beim Prüfen der Updates', 'OK', { duration: 3000 });
        }
      });
  }
  
  // ========================================================================
  // Update Operations
  // ========================================================================
  
  performUpdate(): void {
    if (!confirm('System jetzt aktualisieren? Dies kann einige Minuten dauern.')) {
      return;
    }
    
    this.updating = true;
    this.updateResult = null;
    
    this.snackBar.open('System-Update gestartet...', '', { duration: 2000 });
    
    this.http.post('/api/admin/plugins/ap-systemupdater/update', {})
      .subscribe({
        next: (data) => {
          this.updateResult = data;
          this.updating = false;
          
          if ((data as any).success) {
            this.snackBar.open('System erfolgreich aktualisiert', 'OK', { duration: 5000 });
            
            // Refresh update check
            this.checkForUpdates();
            this.checkRebootRequired();
          } else {
            this.snackBar.open('Update fehlgeschlagen', 'OK', { duration: 5000 });
          }
        },
        error: (err) => {
          console.error('Error performing update:', err);
          this.updating = false;
          this.snackBar.open('Fehler beim Update', 'OK', { duration: 3000 });
        }
      });
  }
  
  // ========================================================================
  // Auto-Update Configuration
  // ========================================================================
  
  loadAutoUpdateConfig(): void {
    this.http.get('/api/admin/plugins/ap-systemupdater/auto-update/config')
      .subscribe({
        next: (data) => {
          this.autoUpdateConfig = data;
        },
        error: (err) => {
          console.error('Error loading auto-update config:', err);
        }
      });
  }
  
  saveAutoUpdateConfig(): void {
    this.savingConfig = true;
    
    this.http.post('/api/admin/plugins/ap-systemupdater/auto-update/config', this.autoUpdateConfig)
      .subscribe({
        next: () => {
          this.savingConfig = false;
          this.snackBar.open('Konfiguration gespeichert', 'OK', { duration: 3000 });
        },
        error: (err) => {
          console.error('Error saving config:', err);
          this.savingConfig = false;
          this.snackBar.open('Fehler beim Speichern', 'OK', { duration: 3000 });
        }
      });
  }
  
  toggleAutoUpdate(): void {
    const endpoint = this.autoUpdateConfig.enabled
      ? '/api/admin/plugins/ap-systemupdater/auto-update/enable'
      : '/api/admin/plugins/ap-systemupdater/auto-update/disable';
    
    this.http.post(endpoint, {})
      .subscribe({
        next: () => {
          const status = this.autoUpdateConfig.enabled ? 'aktiviert' : 'deaktiviert';
          this.snackBar.open(`Auto-Update ${status}`, 'OK', { duration: 3000 });
        },
        error: (err) => {
          console.error('Error toggling auto-update:', err);
          // Revert toggle
          this.autoUpdateConfig.enabled = !this.autoUpdateConfig.enabled;
          this.snackBar.open('Fehler beim Ändern der Einstellung', 'OK', { duration: 3000 });
        }
      });
  }
  
  // ========================================================================
  // Reboot Management
  // ========================================================================
  
  checkRebootRequired(): void {
    this.http.get('/api/admin/plugins/ap-systemupdater/reboot-required')
      .subscribe({
        next: (data: any) => {
          this.rebootRequired = data.required;
        },
        error: (err) => {
          console.error('Error checking reboot status:', err);
        }
      });
  }
  
  rebootSystem(): void {
    if (!confirm('System jetzt neu starten? Alle laufenden Prozesse werden beendet.')) {
      return;
    }
    
    this.http.post('/api/admin/plugins/ap-systemupdater/reboot', {})
      .subscribe({
        next: () => {
          this.snackBar.open('System wird neu gestartet...', '', { duration: 5000 });
        },
        error: (err) => {
          console.error('Error rebooting:', err);
          this.snackBar.open('Fehler beim Neustart', 'OK', { duration: 3000 });
        }
      });
  }
}
