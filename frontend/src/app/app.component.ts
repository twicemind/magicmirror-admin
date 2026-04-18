import { Component, ViewChild } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { BreakpointObserver } from '@angular/cdk/layout';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule
  ],
  template: `
    <mat-sidenav-container class="h-screen">
      <!-- Sidebar -->
      <mat-sidenav 
        #sidenav
        [mode]="isMobile ? 'over' : 'side'" 
        [opened]="!isMobile"
        class="w-64 bg-gray-900 text-white">
        <div class="p-4">
          <div class="flex items-center justify-between mb-6">
            <h1 class="text-xl font-bold text-white">MM Admin</h1>
            <button mat-icon-button (click)="sidenav.close()" *ngIf="isMobile" class="text-white">
              <mat-icon>close</mat-icon>
            </button>
          </div>
          
          <mat-nav-list>
            <a mat-list-item 
               routerLink="/dashboard" 
               routerLinkActive="bg-blue-600"
               (click)="isMobile && sidenav.close()"
               class="text-white hover:bg-gray-700 rounded-lg mb-1 transition-colors">
              <mat-icon class="mr-3">dashboard</mat-icon>
              <span>Dashboard</span>
            </a>
            
            <a mat-list-item 
               routerLink="/system" 
               routerLinkActive="bg-blue-600"
               (click)="isMobile && sidenav.close()"
               class="text-white hover:bg-gray-700 rounded-lg mb-1 transition-colors">
              <mat-icon class="mr-3">computer</mat-icon>
              <span>System</span>
            </a>
            
            <a mat-list-item 
               routerLink="/plugins" 
               routerLinkActive="bg-blue-600"
               (click)="isMobile && sidenav.close()"
               class="text-white hover:bg-gray-700 rounded-lg mb-1 transition-colors">
              <mat-icon class="mr-3">extension</mat-icon>
              <span>Plugins</span>
            </a>
            
            <a mat-list-item 
               routerLink="/system-updater" 
               routerLinkActive="bg-blue-600"
               (click)="isMobile && sidenav.close()"
               class="text-white hover:bg-gray-700 rounded-lg mb-1 transition-colors">
              <mat-icon class="mr-3">system_update_alt</mat-icon>
              <span>System Updater</span>
            </a>
            
            <a mat-list-item 
               routerLink="/modules" 
               routerLinkActive="bg-blue-600"
               (click)="isMobile && sidenav.close()"
               class="text-white hover:bg-gray-700 rounded-lg mb-1 transition-colors">
              <mat-icon class="mr-3">apps</mat-icon>
              <span>MM Modules</span>
            </a>
            
            <a mat-list-item 
               routerLink="/updates" 
               routerLinkActive="bg-blue-600"
               (click)="isMobile && sidenav.close()"
               class="text-white hover:bg-gray-700 rounded-lg mb-1 transition-colors">
              <mat-icon class="mr-3">system_update</mat-icon>
              <span>Updates</span>
            </a>
            
            <a mat-list-item 
               routerLink="/logs" 
               routerLinkActive="bg-blue-600"
               (click)="isMobile && sidenav.close()"
               class="text-white hover:bg-gray-700 rounded-lg mb-1 transition-colors">
              <mat-icon class="mr-3">article</mat-icon>
              <span>Logs</span>
            </a>
          </mat-nav-list>
        </div>
      </mat-sidenav>

      <!-- Main Content -->
      <mat-sidenav-content>
        <!-- Header -->
        <mat-toolbar color="primary" class="shadow-md">
          <button mat-icon-button (click)="sidenav.toggle()" *ngIf="isMobile">
            <mat-icon>menu</mat-icon>
          </button>
          <button mat-icon-button (click)="goBack()" *ngIf="!isHomePage" class="ml-2">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <span class="flex-1 ml-2">{{ pageTitle }}</span>
          <button mat-icon-button>
            <mat-icon>notifications</mat-icon>
          </button>
        </mat-toolbar>

        <!-- Page Content -->
        <div class="p-4 md:ntent -->
  @ViewChild('sidenav') sidenav!: MatSidenav;
  isMobile = false;

  constructor(private breakpointObserver: BreakpointObserver) {
    this.breakpointObserver.observe(['(max-width: 768px)']).subscribe(result => {
      this.isMobile = result.matches;
    });
  }y-50 min-h-[calc(100vh-64px)]">
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
  @ViewChild('sidenav') sidenav!: MatSidenav;
  isMobile = false;
  isHomePage = true;
  pageTitle = 'MagicMirror Admin';

  private pageTitles: { [key: string]: string } = {
    '/dashboard': 'Dashboard',
    '/system': 'System',
    '/plugins': 'Plugins',
    '/system-updater': 'System Updater',
    '/modules': 'MM Modules',
    '/updates': 'Updates',
    '/logs': 'Logs'
  };

  constructor(
    private breakpointObserver: BreakpointObserver,
    private router: Router
  ) {
    this.breakpointObserver.observe(['(max-width: 768px)']).subscribe(result => {
      this.isMobile = result.matches;
    });

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const url = event.urlAfterRedirects || event.url;
        this.isHomePage = url === '/' || url === '/dashboard';
        this.pageTitle = this.pageTitles[url] || 'MagicMirror Admin';
      });
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}
