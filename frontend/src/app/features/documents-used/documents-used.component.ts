import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { KnowledgeApiService } from '../../core/services/knowledge-api.service';
import { KnowledgeItem } from '../../core/models/knowledge.model';

@Component({
  selector: 'app-documents-used',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatTableModule, MatSelectModule, MatFormFieldModule,
    MatCardModule, MatIconModule,
  ],
  template: `
    <h2>Documents Used by Project</h2>

    <mat-form-field appearance="outline" class="project-select">
      <mat-label>Select Project</mat-label>
      <mat-select [(ngModel)]="selectedProject" (selectionChange)="onProjectChange()">
        @for (p of projects; track p) {
          <mat-option [value]="p">{{ p }}</mat-option>
        }
      </mat-select>
    </mat-form-field>

    @if (selectedProject) {
      <mat-card>
        <mat-card-content>
          @if (items.length > 0) {
            <table mat-table [dataSource]="items" class="full-width">
              <ng-container matColumnDef="id">
                <th mat-header-cell *matHeaderCellDef>ID</th>
                <td mat-cell *matCellDef="let row">{{ row.id }}</td>
              </ng-container>

              <ng-container matColumnDef="title">
                <th mat-header-cell *matHeaderCellDef>Title</th>
                <td mat-cell *matCellDef="let row">{{ row.title }}</td>
              </ng-container>

              <ng-container matColumnDef="type_label">
                <th mat-header-cell *matHeaderCellDef>Type</th>
                <td mat-cell *matCellDef="let row">{{ row.type_label }}</td>
              </ng-container>

              <ng-container matColumnDef="designation">
                <th mat-header-cell *matHeaderCellDef>Designation</th>
                <td mat-cell *matCellDef="let row">{{ row.designation }}</td>
              </ng-container>

              <ng-container matColumnDef="owner">
                <th mat-header-cell *matHeaderCellDef>Owner</th>
                <td mat-cell *matCellDef="let row">{{ row.owner }}</td>
              </ng-container>

              <ng-container matColumnDef="date">
                <th mat-header-cell *matHeaderCellDef>Date</th>
                <td mat-cell *matCellDef="let row">{{ row.date }}</td>
              </ng-container>

              <ng-container matColumnDef="process_labels">
                <th mat-header-cell *matHeaderCellDef>Processes</th>
                <td mat-cell *matCellDef="let row">{{ row.process_labels }}</td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
          } @else {
            <p class="muted">No documents linked to this project.</p>
          }
        </mat-card-content>
      </mat-card>
    }
  `,
  styles: [`
    .project-select { width: 300px; margin-bottom: 16px; }
    .full-width { width: 100%; }
    .muted { color: #999; font-style: italic; padding: 16px 0; }
  `],
})
export class DocumentsUsedComponent implements OnInit {
  projects: string[] = [];
  selectedProject: string | null = null;
  items: KnowledgeItem[] = [];
  displayedColumns = ['id', 'title', 'type_label', 'designation', 'owner', 'date', 'process_labels'];

  constructor(private knowledgeApi: KnowledgeApiService) {}

  ngOnInit() {
    this.knowledgeApi.getProjects().subscribe(p => this.projects = p);
  }

  onProjectChange() {
    if (this.selectedProject) {
      this.knowledgeApi.getDocumentsUsed(this.selectedProject).subscribe(items => this.items = items);
    }
  }
}
