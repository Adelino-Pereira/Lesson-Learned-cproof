import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { NgxChartsModule, Color, ScaleType } from '@swimlane/ngx-charts';

import { KnowledgeApiService } from '../../core/services/knowledge-api.service';
import { StatBlock } from '../../core/models/knowledge.model';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, NgxChartsModule],
  template: `
    <h2>Statistics</h2>

    <div class="charts-grid">
      <mat-card>
        <mat-card-header>
          <mat-icon mat-card-avatar class="stat-icon">category</mat-icon>
          <mat-card-title>Items by Type</mat-card-title>
        </mat-card-header>
        <mat-card-content class="chart-container">
          @if (chartByType.length) {
            <ngx-charts-bar-horizontal
              [results]="chartByType"
              [scheme]="colorScheme"
              [xAxisLabel]="'Count'"
              [showXAxisLabel]="true"
              [showYAxisLabel]="false"
              [xAxis]="true"
              [yAxis]="true"
              [view]="[chartWidth, 300]"
              [animations]="true">
            </ngx-charts-bar-horizontal>
          }
        </mat-card-content>
      </mat-card>

      <mat-card>
        <mat-card-header>
          <mat-icon mat-card-avatar class="stat-icon">settings</mat-icon>
          <mat-card-title>Items by Process</mat-card-title>
        </mat-card-header>
        <mat-card-content class="chart-container">
          @if (chartByProcess.length) {
            <ngx-charts-bar-vertical
              [results]="chartByProcess"
              [scheme]="colorScheme"
              [showXAxisLabel]="false"
              [showYAxisLabel]="true"
              [yAxisLabel]="'Count'"
              [xAxis]="true"
              [yAxis]="true"
              [view]="[chartWidth, 300]"
              [animations]="true">
            </ngx-charts-bar-vertical>
          }
        </mat-card-content>
      </mat-card>

      <mat-card>
        <mat-card-header>
          <mat-icon mat-card-avatar class="stat-icon">factory</mat-icon>
          <mat-card-title>Items by Plant</mat-card-title>
        </mat-card-header>
        <mat-card-content class="chart-container">
          @if (chartByPlant.length) {
            <ngx-charts-pie-chart
              [results]="chartByPlant"
              [scheme]="colorScheme"
              [labels]="true"
              [doughnut]="true"
              [arcWidth]="0.4"
              [view]="[chartWidth, 300]"
              [animations]="true">
            </ngx-charts-pie-chart>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .charts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 24px;
      margin-top: 16px;
    }
    .stat-icon {
      color: #3f51b5;
      font-size: 28px;
    }
    .chart-container {
      display: flex;
      justify-content: center;
      padding: 16px 0;
    }
    @media (max-width: 600px) {
      .charts-grid {
        grid-template-columns: 1fr;
      }
    }
  `],
})
export class StatsComponent implements OnInit {
  chartByType: { name: string; value: number }[] = [];
  chartByProcess: { name: string; value: number }[] = [];
  chartByPlant: { name: string; value: number }[] = [];

  chartWidth = 500;

  colorScheme: Color = {
    name: 'Indigo',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#3f51b5', '#5c6bc0', '#7986cb', '#9fa8da', '#303f9f',
             '#1a237e', '#8c9eff', '#536dfe', '#c5cae9'],
  };

  constructor(private knowledgeApi: KnowledgeApiService) {}

  ngOnInit() {
    this.knowledgeApi.getStats().subscribe(stats => {
      this.chartByType = this.toChartData(stats.byType);
      this.chartByProcess = this.toChartData(stats.byProcess);
      this.chartByPlant = this.toChartData(stats.byPlant);
    });
  }

  private toChartData(blocks: StatBlock[]): { name: string; value: number }[] {
    return blocks.map(b => ({ name: b.label, value: b.count }));
  }
}
