import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-system',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <div>
      <h1 class="text-3xl font-bold mb-6">System Information</h1>
      <mat-card>
        <mat-card-content>
          <p>System information coming soon...</p>
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class SystemComponent {}
