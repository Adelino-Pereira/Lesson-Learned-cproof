import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { KnowledgeApiService } from '../../core/services/knowledge-api.service';
import { MasterDataService } from '../../core/services/master-data.service';
import { PermissionService } from '../../core/services/permission.service';
import { KnowledgeItem, KnowledgeFilters, MasterType, MasterProcess, MasterProject } from '../../core/models/knowledge.model';
import { DetailDialogComponent } from '../detail/detail.component';

@Component({
  selector: 'app-listing',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatTableModule, MatPaginatorModule, MatSortModule,
    MatButtonModule, MatIconModule, MatSelectModule,
    MatFormFieldModule, MatInputModule,
    MatChipsModule, MatBadgeModule, MatDialogModule,
    MatSnackBarModule, MatTooltipModule,
  ],
  template: `
    @if (canValidate) {
      <div class="status-filter-bar">
        <button mat-flat-button
          [class.active]="activeStatus === 'PENDING'"
          [class.status-pending-btn]="activeStatus === 'PENDING'"
          (click)="filterByStatus('PENDING')">PENDING ({{ statusCounts.PENDING }})</button>
        <button mat-flat-button
          [class.active]="activeStatus === 'APPROVED'"
          [class.status-approved-btn]="activeStatus === 'APPROVED'"
          (click)="filterByStatus('APPROVED')">APPROVED ({{ statusCounts.APPROVED }})</button>
        <button mat-flat-button
          [class.active]="activeStatus === 'REJECTED'"
          [class.status-rejected-btn]="activeStatus === 'REJECTED'"
          (click)="filterByStatus('REJECTED')">REJECTED ({{ statusCounts.REJECTED }})</button>
        <button mat-flat-button
          [class.active]="activeStatus === 'ALL'"
          [class.status-all-btn]="activeStatus === 'ALL'"
          (click)="filterByStatus('ALL')">ALL ({{ statusCounts.ALL }})</button>
      </div>
    }

    <mat-form-field appearance="outline" subscriptSizing="dynamic" class="search-box">
      <mat-label>Search title</mat-label>
      <input matInput [(ngModel)]="filters.title" (ngModelChange)="applyFilters()" placeholder="Search...">
      <mat-icon matPrefix>search</mat-icon>
    </mat-form-field>

    <div class="filters-grid">
      <mat-form-field appearance="outline" subscriptSizing="dynamic">
        <mat-label>Type</mat-label>
        <mat-select [(ngModel)]="filters.type" (selectionChange)="applyFilters()">
          <mat-option [value]="undefined">All</mat-option>
          @for (t of types; track t.id) {
            <mat-option [value]="t.id">{{ t.label }}</mat-option>
          }
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline" subscriptSizing="dynamic">
        <mat-label>Process</mat-label>
        <mat-select [(ngModel)]="filters.process" (selectionChange)="applyFilters()">
          <mat-option [value]="undefined">All</mat-option>
          @for (p of processes; track p.id) {
            <mat-option [value]="p.id">{{ p.label }}</mat-option>
          }
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline" subscriptSizing="dynamic">
        <mat-label>Project</mat-label>
        <mat-select [(ngModel)]="filters.project_id" (selectionChange)="applyFilters()">
          <mat-option [value]="undefined">All</mat-option>
          @for (proj of projects; track proj.id) {
            <mat-option [value]="proj.id">{{ proj.name }} ({{ proj.designation }})</mat-option>
          }
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline" subscriptSizing="dynamic">
        <mat-label>Customer</mat-label>
        <input matInput [(ngModel)]="filters.owner" (change)="applyFilters()">
      </mat-form-field>

      <mat-form-field appearance="outline" subscriptSizing="dynamic">
        <mat-label>Plant</mat-label>
        <input matInput [(ngModel)]="filters.plant" (change)="applyFilters()">
      </mat-form-field>

      <mat-form-field appearance="outline" subscriptSizing="dynamic">
        <mat-label>Date From</mat-label>
        <input matInput type="date" [(ngModel)]="filters.date_from" (change)="applyFilters()">
      </mat-form-field>

      <mat-form-field appearance="outline" subscriptSizing="dynamic">
        <mat-label>Date To</mat-label>
        <input matInput type="date" [(ngModel)]="filters.date_to" (change)="applyFilters()">
      </mat-form-field>

      <button mat-stroked-button (click)="clearFilters()">Clear Filters</button>
    </div>

    <div class="table-container">
      <table mat-table [dataSource]="dataSource" matSort class="full-width">
        <ng-container matColumnDef="id">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>ID</th>
          <td mat-cell *matCellDef="let row">{{ row.id }}</td>
        </ng-container>

        <ng-container matColumnDef="type_label">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Type</th>
          <td mat-cell *matCellDef="let row">{{ row.type_label }}</td>
        </ng-container>

        <ng-container matColumnDef="designation">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Designation</th>
          <td mat-cell *matCellDef="let row">{{ row.designation }}</td>
        </ng-container>

        <ng-container matColumnDef="process_labels">
          <th mat-header-cell *matHeaderCellDef>Process</th>
          <td mat-cell *matCellDef="let row">
            @for (p of (row.process_labels || '').split(','); track p) {
              @if (p.trim()) {
                <span class="process-chip">{{ p.trim() }}</span>
              }
            }
          </td>
        </ng-container>

        <ng-container matColumnDef="owner">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Customer</th>
          <td mat-cell *matCellDef="let row">{{ row.owner }}</td>
        </ng-container>

        <ng-container matColumnDef="author">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Author</th>
          <td mat-cell *matCellDef="let row">{{ row.author }}</td>
        </ng-container>

        <ng-container matColumnDef="project">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Project</th>
          <td mat-cell *matCellDef="let row">{{ row.project_name || '—' }}</td>
        </ng-container>

        <ng-container matColumnDef="date">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Date</th>
          <td mat-cell *matCellDef="let row">{{ row.date | date:'yyyy/MM/dd' }}</td>
        </ng-container>

        <ng-container matColumnDef="visibility_status">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
          <td mat-cell *matCellDef="let row">
            <span class="status-badge" [ngClass]="'status-' + row.visibility_status">
              {{ row.visibility_status }}
            </span>
          </td>
        </ng-container>

        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef>Actions</th>
          <td mat-cell *matCellDef="let row">
            <button mat-icon-button matTooltip="Edit" (click)="goToDetail(row.id); $event.stopPropagation()">
              <mat-icon>edit</mat-icon>
            </button>
            <button mat-icon-button matTooltip="Delete" (click)="deleteItem(row); $event.stopPropagation()">
              <mat-icon class="delete-icon">delete</mat-icon>
            </button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"
            class="clickable-row"
            (click)="goToDetail(row.id)"></tr>
      </table>

      <mat-paginator [pageSizeOptions]="[10, 20, 50]" showFirstLastButtons />
    </div>
  `,
  styles: [`
    :host ::ng-deep .mat-mdc-form-field-infix {
      min-height: 36px !important;
      padding-top: 8px !important;
      padding-bottom: 8px !important;
    }
    :host ::ng-deep .mat-mdc-text-field-wrapper {
      padding: 0 12px !important;
    }
    .search-box {
      width: 100%;
      margin-bottom: 4px;
    }
    .filters-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
      gap: 6px;
      align-items: center;
      margin-bottom: 4px;
    }
    .table-container {
      margin-top: 8px;
      overflow: auto;
    }
    .full-width {
      width: 100%;
    }
    .clickable-row {
      cursor: pointer;
    }
    .clickable-row:hover {
      background: rgba(0, 0, 0, 0.04);
    }
    .process-chip {
      display: inline-block;
      background: #e8eaf6;
      color: #3f51b5;
      border-radius: 12px;
      padding: 2px 10px;
      font-size: 12px;
      margin: 1px 2px;
    }
    .status-badge {
      display: inline-block;
      border-radius: 12px;
      padding: 2px 10px;
      font-size: 12px;
      font-weight: 500;
    }
    .status-PENDING { background: #fff8e1; color: #f57f17; }
    .status-APPROVED { background: #e8f5e9; color: #2e7d32; }
    .status-REJECTED { background: #eeeeee; color: #616161; }
    .delete-icon { color: #c62828; }
    .status-filter-bar {
      display: flex;
      gap: 4px;
      margin-bottom: 12px;
    }
    .status-filter-bar button {
      background: #e0e0e0;
      color: #616161;
      font-weight: 500;
      min-width: 100px;
    }
    .status-filter-bar button.status-pending-btn {
      background: #fff8e1;
      color: #f57f17;
    }
    .status-filter-bar button.status-approved-btn {
      background: #e8f5e9;
      color: #2e7d32;
    }
    .status-filter-bar button.status-rejected-btn {
      background: #eeeeee;
      color: #616161;
      font-weight: 700;
    }
    .status-filter-bar button.status-all-btn {
      background: #e3f2fd;
      color: #1565c0;
    }
  `],
})
export class ListingComponent implements OnInit {
  displayedColumns: string[] = [];
  dataSource = new MatTableDataSource<KnowledgeItem>([]);
  filters: KnowledgeFilters = {};
  types: MasterType[] = [];
  processes: MasterProcess[] = [];
  projects: MasterProject[] = [];
  canValidate = false;
  activeStatus: string = 'PENDING';
  statusCounts = { PENDING: 0, APPROVED: 0, REJECTED: 0, ALL: 0 };

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private knowledgeApi: KnowledgeApiService,
    private masterData: MasterDataService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    public permissions: PermissionService,
  ) {
    this.canValidate = this.permissions.hasPermission('knowledge:validate');
    const base = ['id', 'type_label', 'designation', 'process_labels', 'owner', 'project', 'author', 'date'];
    if (this.canValidate) base.push('visibility_status');
    this.displayedColumns = this.permissions.hasPermission('knowledge:edit')
      ? [...base, 'actions']
      : base;
    if (!this.canValidate) {
      this.filters.visibility_status = 'APPROVED';
    } else {
      this.filters.visibility_status = 'PENDING';
    }
  }

  ngOnInit() {
    this.masterData.getTypes().subscribe(t => this.types = t);
    this.masterData.getProcesses().subscribe(p => this.processes = p);
    this.knowledgeApi.getProjects().subscribe(p => this.projects = p);
    this.loadData();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadData() {
    this.knowledgeApi.getAll(this.filters).subscribe(items => {
      this.dataSource.data = items;
    });
    if (this.canValidate) {
      this.loadCounts();
    }
  }

  loadCounts() {
    const countFilters: KnowledgeFilters = { ...this.filters };
    delete countFilters.visibility_status;
    this.knowledgeApi.getAll(countFilters).subscribe(items => {
      this.statusCounts = {
        PENDING: items.filter(i => i.visibility_status === 'PENDING').length,
        APPROVED: items.filter(i => i.visibility_status === 'APPROVED').length,
        REJECTED: items.filter(i => i.visibility_status === 'REJECTED').length,
        ALL: items.length,
      };
    });
  }

  applyFilters() {
    this.loadData();
  }

  filterByStatus(status: string) {
    this.activeStatus = status;
    this.filters.visibility_status = status === 'ALL' ? undefined : status;
    this.loadData();
  }

  clearFilters() {
    const status = this.canValidate ? this.activeStatus : 'APPROVED';
    this.filters = { visibility_status: status };
    this.loadData();
  }

  goToSubmit() {
    this.router.navigate(['/knowledge/new']);
  }

  deleteItem(row: KnowledgeItem) {
    if (!confirm(`Delete "${row.title}"?`)) return;
    this.knowledgeApi.delete(row.id).subscribe({
      next: () => {
        this.snackBar.open('Item deleted', 'Close', { duration: 3000 });
        this.loadData();
      },
      error: () => {
        this.snackBar.open('Failed to delete item', 'Close', { duration: 3000 });
      },
    });
  }

  goToDetail(id: number) {
    const ref = this.dialog.open(DetailDialogComponent, {
      width: '90vw',
      maxWidth: '90vw',
      maxHeight: '90vh',
      data: { itemId: id },
    });
    ref.afterClosed().subscribe(result => {
      if (result === 'updated') {
        this.loadData();
      }
    });
  }
}
