import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';

import { KnowledgeApiService } from '../../core/services/knowledge-api.service';
import { PermissionService } from '../../core/services/permission.service';
import { KnowledgeItemWithUsage } from '../../core/models/knowledge.model';

@Component({
  selector: 'app-documents-used',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatTableModule, MatSelectModule, MatFormFieldModule,
    MatCardModule, MatIconModule, MatSlideToggleModule,
    MatSnackBarModule, MatChipsModule,
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
              <ng-container matColumnDef="is_used">
                <th mat-header-cell *matHeaderCellDef>Used</th>
                <td mat-cell *matCellDef="let row">
                  <mat-slide-toggle
                    [checked]="row.is_used === 1"
                    (change)="toggleUsage(row, $event.checked)"
                    [disabled]="!permissions.hasPermission('documents-used:edit')"
                    color="primary">
                  </mat-slide-toggle>
                </td>
              </ng-container>

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
                <td mat-cell *matCellDef="let row">{{ row.date | date:'yyyy/MM/dd' }}</td>
              </ng-container>

              <ng-container matColumnDef="process_labels">
                <th mat-header-cell *matHeaderCellDef>Processes</th>
                <td mat-cell *matCellDef="let row">
                  @for (p of (row.process_labels || '').split(','); track p) {
                    @if (p.trim()) {
                      <span class="process-chip">{{ p.trim() }}</span>
                    }
                  }
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"
                  [class.used-row]="row.is_used === 1"></tr>
            </table>
          } @else {
            <p class="muted">No knowledge items found.</p>
          }
        </mat-card-content>
      </mat-card>
    }
  `,
  styles: [`
    .project-select { width: 300px; margin-bottom: 16px; }
    .full-width { width: 100%; }
    .muted { color: #999; font-style: italic; padding: 16px 0; }
    .used-row { background: #e8f5e9; }
    .process-chip {
      display: inline-block;
      background: #e8eaf6;
      color: #3f51b5;
      border-radius: 12px;
      padding: 2px 10px;
      font-size: 12px;
      margin: 1px 2px;
    }
  `],
})
export class DocumentsUsedComponent implements OnInit {
  projects: string[] = [];
  selectedProject: string | null = null;
  items: KnowledgeItemWithUsage[] = [];
  displayedColumns: string[] = [];
  canEdit = false;

  constructor(
    private knowledgeApi: KnowledgeApiService,
    private snackBar: MatSnackBar,
    public permissions: PermissionService,
  ) {
    this.canEdit = this.permissions.hasPermission('documents-used:edit');
    const base = ['id', 'title', 'type_label', 'designation', 'owner', 'date', 'process_labels'];
    this.displayedColumns = this.canEdit ? ['is_used', ...base] : base;
  }

  ngOnInit() {
    this.knowledgeApi.getProjects().subscribe(p => this.projects = p);
  }

  onProjectChange() {
    if (this.selectedProject) {
      this.knowledgeApi.getItemsWithUsage(this.selectedProject).subscribe(items => this.items = items);
    }
  }

  toggleUsage(row: KnowledgeItemWithUsage, checked: boolean) {
    if (!this.selectedProject) return;

    const action$ = checked
      ? this.knowledgeApi.linkDocumentToProject(this.selectedProject, row.id)
      : this.knowledgeApi.unlinkDocumentFromProject(this.selectedProject, row.id);

    action$.subscribe({
      next: () => {
        row.is_used = checked ? 1 : 0;
        const label = checked ? 'linked to' : 'unlinked from';
        this.snackBar.open(`Item ${label} ${this.selectedProject}`, 'Close', { duration: 2000 });
      },
      error: () => {
        this.snackBar.open('Failed to update link', 'Close', { duration: 3000 });
      },
    });
  }
}
