import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';

import { KnowledgeApiService } from '../../core/services/knowledge-api.service';
import { StatBlock } from '../../core/models/knowledge.model';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTableModule, MatIconModule],
  template: `
    <h2>Statistics</h2>

    <div class="stats-grid">
      <mat-card>
        <mat-card-header>
          <mat-icon mat-card-avatar class="stat-icon">category</mat-icon>
          <mat-card-title>Items by Type</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <table mat-table [dataSource]="byType" class="full-width">
            <ng-container matColumnDef="label">
              <th mat-header-cell *matHeaderCellDef>Type</th>
              <td mat-cell *matCellDef="let row">{{ row.label }}</td>
            </ng-container>
            <ng-container matColumnDef="count">
              <th mat-header-cell *matHeaderCellDef>Count</th>
              <td mat-cell *matCellDef="let row"><strong>{{ row.count }}</strong></td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="columns"></tr>
            <tr mat-row *matRowDef="let row; columns: columns;"></tr>
          </table>
        </mat-card-content>
      </mat-card>

      <mat-card>
        <mat-card-header>
          <mat-icon mat-card-avatar class="stat-icon">settings</mat-icon>
          <mat-card-title>Items by Process</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <table mat-table [dataSource]="byProcess" class="full-width">
            <ng-container matColumnDef="label">
              <th mat-header-cell *matHeaderCellDef>Process</th>
              <td mat-cell *matCellDef="let row">{{ row.label }}</td>
            </ng-container>
            <ng-container matColumnDef="count">
              <th mat-header-cell *matHeaderCellDef>Count</th>
              <td mat-cell *matCellDef="let row"><strong>{{ row.count }}</strong></td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="columns"></tr>
            <tr mat-row *matRowDef="let row; columns: columns;"></tr>
          </table>
        </mat-card-content>
      </mat-card>

      <mat-card>
        <mat-card-header>
          <mat-icon mat-card-avatar class="stat-icon">factory</mat-icon>
          <mat-card-title>Items by Plant</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <table mat-table [dataSource]="byPlant" class="full-width">
            <ng-container matColumnDef="label">
              <th mat-header-cell *matHeaderCellDef>Plant</th>
              <td mat-cell *matCellDef="let row">{{ row.label }}</td>
            </ng-container>
            <ng-container matColumnDef="count">
              <th mat-header-cell *matHeaderCellDef>Count</th>
              <td mat-cell *matCellDef="let row"><strong>{{ row.count }}</strong></td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="columns"></tr>
            <tr mat-row *matRowDef="let row; columns: columns;"></tr>
          </table>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px;
      margin-top: 16px;
    }
    .stat-icon {
      color: #3f51b5;
      font-size: 28px;
    }
    .full-width { width: 100%; }
  `],
})
export class StatsComponent implements OnInit {
  byType: StatBlock[] = [];
  byProcess: StatBlock[] = [];
  byPlant: StatBlock[] = [];
  columns = ['label', 'count'];

  constructor(private knowledgeApi: KnowledgeApiService) {}

  ngOnInit() {
    this.knowledgeApi.getStats().subscribe(stats => {
      this.byType = stats.byType;
      this.byProcess = stats.byProcess;
      this.byPlant = stats.byPlant;
    });
  }
}
