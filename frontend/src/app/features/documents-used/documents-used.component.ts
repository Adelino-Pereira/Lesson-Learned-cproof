import { Component, OnInit, Inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule, FormControl } from "@angular/forms";
import { MatTableModule } from "@angular/material/table";
import { MatSelectModule } from "@angular/material/select";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { MatChipsModule } from "@angular/material/chips";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import {
  MatDialog,
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";

import { KnowledgeApiService } from "../../core/services/knowledge-api.service";
import { PermissionService } from "../../core/services/permission.service";
import { MasterDataService } from "../../core/services/master-data.service";
import {
  KnowledgeItem,
  KnowledgeItemWithUsage,
  MasterType,
  MasterProcess,
  MasterProject,
} from "../../core/models/knowledge.model";

// ---- Add Document Dialog ----
@Component({
  selector: "app-add-document-dialog",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
  ],
  template: `
    <h2 mat-dialog-title>Add Lessons to {{ data.projectName }}</h2>
    <mat-dialog-content>
      <div class="filter-row">
        <mat-form-field appearance="outline" class="filter-field search-field">
          <mat-label>Search title</mat-label>
          <input
            matInput
            [(ngModel)]="filterTitle"
            (ngModelChange)="applyFilters()"
            placeholder="Search..."
          />
          <mat-icon matPrefix>search</mat-icon>
        </mat-form-field>

        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>Type</mat-label>
          <mat-select
            [(ngModel)]="filterType"
            (selectionChange)="applyFilters()"
          >
            <mat-option [value]="null">All</mat-option>
            @for (t of types; track t.id) {
              <mat-option [value]="t.id">{{ t.label }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>Designation</mat-label>
          <input
            matInput
            [(ngModel)]="filterDesignation"
            (ngModelChange)="applyFilters()"
            placeholder="Filter..."
          />
        </mat-form-field>

        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>Processes</mat-label>
          <mat-select
            [(ngModel)]="filterProcess"
            (selectionChange)="applyFilters()"
          >
            <mat-option [value]="null">All</mat-option>
            @for (p of processList; track p.id) {
              <mat-option [value]="p.label">{{ p.label }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
      </div>

      @if (filteredItems.length > 0) {
        <table mat-table [dataSource]="filteredItems" class="full-width">
          <ng-container matColumnDef="selected">
            <th mat-header-cell *matHeaderCellDef>Select</th>
            <td mat-cell *matCellDef="let row">
              <mat-slide-toggle
                [checked]="row.is_used === 1"
                (change)="toggle(row, $event.checked)"
                color="primary"
              >
              </mat-slide-toggle>
            </td>
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

          <ng-container matColumnDef="process_labels">
            <th mat-header-cell *matHeaderCellDef>Processes</th>
            <td mat-cell *matCellDef="let row">
              @for (p of (row.process_labels || "").split(","); track p) {
                @if (p.trim()) {
                  <span class="process-chip">{{ p.trim() }}</span>
                }
              }
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr
            mat-row
            *matRowDef="let row; columns: columns"
            [class.used-row]="row.is_used === 1"
          ></tr>
        </table>
      } @else if (items.length > 0) {
        <p class="muted">No documents match the current filters.</p>
      } @else {
        <p class="muted">No approved documents available.</p>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-raised-button (click)="cancel()">CANCEL</button>
      <button
        mat-raised-button
        color="primary"
        (click)="confirm()"
        [disabled]="saving"
      >
        CONFIRM SELECTION
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .filter-row {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
        margin-bottom: 8px;
      }
      .filter-field {
        flex: 1;
        min-width: 160px;
      }
      .search-field {
        flex: 2;
      }
      .full-width {
        width: 100%;
      }
      .muted {
        color: #999;
        font-style: italic;
        padding: 16px 0;
      }
      .used-row {
        background: #e8f5e9;
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
      mat-dialog-actions {
        padding: 12px 24px !important;
        gap: 8px;
      }
    `,
  ],
})
export class AddDocumentDialogComponent implements OnInit {
  items: KnowledgeItemWithUsage[] = [];
  filteredItems: KnowledgeItemWithUsage[] = [];
  columns = [
    "selected",
    "title",
    "type_label",
    "designation",
    "process_labels",
  ];
  saving = false;
  private changes: { id: number; add: boolean }[] = [];

  types: MasterType[] = [];
  processList: MasterProcess[] = [];
  filterTitle = "";
  filterType: number | null = null;
  filterDesignation = "";
  filterProcess: string | null = null;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { projectId: number; projectName: string },
    private dialogRef: MatDialogRef<AddDocumentDialogComponent>,
    private knowledgeApi: KnowledgeApiService,
    private masterData: MasterDataService,
  ) {}

  ngOnInit() {
    this.masterData.getTypes().subscribe((t) => (this.types = t));
    this.masterData.getProcesses().subscribe((p) => (this.processList = p));
    this.knowledgeApi
      .getItemsWithUsage(this.data.projectId)
      .subscribe((items) => {
        this.items = items.filter((i) => i.visibility_status === "APPROVED");
        this.filteredItems = [...this.items];
      });
  }

  applyFilters() {
    this.filteredItems = this.items.filter((item) => {
      if (
        this.filterTitle &&
        !item.title.toLowerCase().includes(this.filterTitle.toLowerCase())
      ) {
        return false;
      }
      if (this.filterType != null && item.type_id !== this.filterType) {
        return false;
      }
      if (
        this.filterDesignation &&
        !(item.designation || "")
          .toLowerCase()
          .includes(this.filterDesignation.toLowerCase())
      ) {
        return false;
      }
      if (this.filterProcess) {
        const labels = (item.process_labels || "")
          .split(",")
          .map((l) => l.trim());
        if (!labels.includes(this.filterProcess)) {
          return false;
        }
      }
      return true;
    });
  }

  toggle(row: KnowledgeItemWithUsage, checked: boolean) {
    row.is_used = checked ? 1 : 0;
    const existing = this.changes.findIndex((c) => c.id === row.id);
    if (existing >= 0) this.changes.splice(existing, 1);
    this.changes.push({ id: row.id, add: checked });
  }

  confirm() {
    if (this.changes.length === 0) {
      this.dialogRef.close("updated");
      return;
    }
    this.saving = true;
    let completed = 0;
    for (const change of this.changes) {
      const action$ = change.add
        ? this.knowledgeApi.linkDocumentToProject(
            this.data.projectId,
            change.id,
          )
        : this.knowledgeApi.unlinkDocumentFromProject(
            this.data.projectId,
            change.id,
          );
      action$.subscribe({
        next: () => {
          completed++;
          if (completed === this.changes.length) {
            this.dialogRef.close("updated");
          }
        },
        error: () => {
          completed++;
          if (completed === this.changes.length) {
            this.dialogRef.close("updated");
          }
        },
      });
    }
  }

  cancel() {
    this.dialogRef.close();
  }
}

// ---- Documents Used Component ----
@Component({
  selector: "app-documents-used",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatSelectModule,
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    MatChipsModule,
    MatDialogModule,
    MatAutocompleteModule,
  ],
  template: `
    <div class="header-row">
      <h2>Documents Used by Project</h2>
    </div>

    <div class="controls-row">
      <mat-form-field appearance="outline" class="project-select">
        <mat-label>Select Project</mat-label>
        <input
          matInput
          [formControl]="searchControl"
          [matAutocomplete]="projectAuto"
          placeholder="Search by name, customer, vehicle..."
        />
        <mat-icon matSuffix>search</mat-icon>
        @if (selectedProject) {
          <button matSuffix mat-icon-button (click)="clearProject($event)">
            <mat-icon>close</mat-icon>
          </button>
        }
        <mat-autocomplete
          #projectAuto="matAutocomplete"
          [displayWith]="displayProject"
          (optionSelected)="onProjectSelected($event)"
        >
          @for (group of filteredGroups; track group.customer) {
            <mat-optgroup [label]="group.customer">
              @for (proj of group.projects; track proj.id) {
                <mat-option [value]="proj">
                  <div class="option-line1">{{ proj.name }}</div>
                  <div class="option-line2">
                    {{ proj.vehicle }} &middot; {{ proj.designation }}
                  </div>
                </mat-option>
              }
            </mat-optgroup>
          }
        </mat-autocomplete>
      </mat-form-field>

      @if (selectedProject && canEdit) {
        <button mat-raised-button color="primary" (click)="openAddDialog()">
          <mat-icon>add</mat-icon> Add Lessons
        </button>
      }
    </div>

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
                <th mat-header-cell *matHeaderCellDef>Customer</th>
                <td mat-cell *matCellDef="let row">{{ row.owner }}</td>
              </ng-container>

              <ng-container matColumnDef="date">
                <th mat-header-cell *matHeaderCellDef>Date</th>
                <td mat-cell *matCellDef="let row">
                  {{ row.date | date: "yyyy/MM/dd" }}
                </td>
              </ng-container>

              <ng-container matColumnDef="process_labels">
                <th mat-header-cell *matHeaderCellDef>Processes</th>
                <td mat-cell *matCellDef="let row">
                  @for (p of (row.process_labels || "").split(","); track p) {
                    @if (p.trim()) {
                      <span class="process-chip">{{ p.trim() }}</span>
                    }
                  }
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
            </table>
          } @else {
            <p class="muted">No documents linked to this project.</p>
          }
        </mat-card-content>
      </mat-card>
    }
  `,
  styles: [
    `
      .header-row {
        margin-bottom: 8px;
      }
      .controls-row {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 16px;
      }
      .project-select {
        width: 450px;
      }
      .full-width {
        width: 100%;
      }
      .muted {
        color: #999;
        font-style: italic;
        padding: 16px 0;
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
      .option-line1 {
        font-weight: 500;
      }
      .option-line2 {
        font-size: 12px;
        color: #666;
      }
    `,
  ],
})
export class DocumentsUsedComponent implements OnInit {
  allProjects: MasterProject[] = [];
  filteredGroups: { customer: string; projects: MasterProject[] }[] = [];
  selectedProject: MasterProject | null = null;
  searchControl = new FormControl("");
  items: KnowledgeItem[] = [];
  displayedColumns = [
    "id",
    "title",
    "type_label",
    "designation",
    "owner",
    "date",
    "process_labels",
  ];
  canEdit = false;

  constructor(
    private knowledgeApi: KnowledgeApiService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    public permissions: PermissionService,
  ) {
    this.canEdit = this.permissions.hasPermission("documents-used:edit");
  }

  ngOnInit() {
    this.knowledgeApi.getProjects().subscribe((projects) => {
      this.allProjects = projects;
      this.filterProjects("");
    });

    this.searchControl.valueChanges.subscribe((value) => {
      if (typeof value === "string") {
        this.filterProjects(value);
      }
    });
  }

  filterProjects(search: string) {
    const term = (search || "").toLowerCase();
    const filtered = this.allProjects.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.designation.toLowerCase().includes(term) ||
        p.customer.toLowerCase().includes(term) ||
        p.vehicle.toLowerCase().includes(term) ||
        (p.description || "").toLowerCase().includes(term),
    );

    const grouped = new Map<string, MasterProject[]>();
    for (const proj of filtered) {
      const list = grouped.get(proj.customer) || [];
      list.push(proj);
      grouped.set(proj.customer, list);
    }

    this.filteredGroups = Array.from(grouped.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([customer, projects]) => ({ customer, projects }));
  }

  displayProject = (proj: MasterProject | string): string => {
    if (!proj || typeof proj === "string") return proj as string;
    return `${proj.name} (${proj.designation})`;
  };

  onProjectSelected(event: any) {
    this.selectedProject = event.option.value;
    this.loadLinkedDocuments();
  }

  clearProject(event: Event) {
    event.stopPropagation();
    this.selectedProject = null;
    this.searchControl.setValue("");
    this.items = [];
  }

  loadLinkedDocuments() {
    if (!this.selectedProject) return;
    this.knowledgeApi
      .getDocumentsUsed(this.selectedProject.id)
      .subscribe((items) => (this.items = items));
  }

  openAddDialog() {
    if (!this.selectedProject) return;
    const ref = this.dialog.open(AddDocumentDialogComponent, {
      width: "80vw",
      maxWidth: "80vw",
      maxHeight: "80vh",
      data: {
        projectId: this.selectedProject.id,
        projectName: this.selectedProject.name,
      },
    });
    ref.afterClosed().subscribe((result) => {
      if (result === "updated") {
        this.loadLinkedDocuments();
        this.snackBar.open("Document selection updated", "Close", {
          duration: 2000,
        });
      }
    });
  }
}
