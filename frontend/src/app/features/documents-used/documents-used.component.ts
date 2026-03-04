import { Component, OnInit, Inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { MatTableModule } from "@angular/material/table";
import { MatSelectModule } from "@angular/material/select";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { MatChipsModule } from "@angular/material/chips";
import {
  MatDialog,
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";

import { KnowledgeApiService } from "../../core/services/knowledge-api.service";
import { PermissionService } from "../../core/services/permission.service";
import {
  KnowledgeItem,
  KnowledgeItemWithUsage,
} from "../../core/models/knowledge.model";

// ---- Add Document Dialog ----
@Component({
  selector: "app-add-document-dialog",
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
  ],
  template: `
    <h2 mat-dialog-title>Add Documents to {{ data.project }}</h2>
    <mat-dialog-content>
      @if (items.length > 0) {
        <table mat-table [dataSource]="items" class="full-width">
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
  columns = [
    "selected",
    "title",
    "type_label",
    "designation",
    "process_labels",
  ];
  saving = false;
  private changes: { id: number; add: boolean }[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { project: string },
    private dialogRef: MatDialogRef<AddDocumentDialogComponent>,
    private knowledgeApi: KnowledgeApiService,
  ) {}

  ngOnInit() {
    this.knowledgeApi
      .getItemsWithUsage(this.data.project)
      .subscribe((items) => {
        this.items = items.filter((i) => i.visibility_status === "APPROVED");
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
        ? this.knowledgeApi.linkDocumentToProject(this.data.project, change.id)
        : this.knowledgeApi.unlinkDocumentFromProject(
            this.data.project,
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
    MatTableModule,
    MatSelectModule,
    MatFormFieldModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    MatChipsModule,
    MatDialogModule,
  ],
  template: `
    <div class="header-row">
      <h2>Documents Used by Project</h2>
    </div>

    <div class="controls-row">
      <mat-form-field appearance="outline" class="project-select">
        <mat-label>Select Project</mat-label>
        <mat-select
          [(ngModel)]="selectedProject"
          (selectionChange)="onProjectChange()"
        >
          @for (p of projects; track p) {
            <mat-option [value]="p">{{ p }}</mat-option>
          }
        </mat-select>
      </mat-form-field>

      @if (selectedProject && canEdit) {
        <button mat-raised-button color="primary" (click)="openAddDialog()">
          <mat-icon>add</mat-icon> Add Documents
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
        width: 300px;
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
    `,
  ],
})
export class DocumentsUsedComponent implements OnInit {
  projects: string[] = [];
  selectedProject: string | null = null;
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
    this.knowledgeApi.getProjects().subscribe((p) => (this.projects = p));
  }

  onProjectChange() {
    if (!this.selectedProject) return;
    this.loadLinkedDocuments();
  }

  loadLinkedDocuments() {
    if (!this.selectedProject) return;
    this.knowledgeApi
      .getDocumentsUsed(this.selectedProject)
      .subscribe((items) => (this.items = items));
  }

  openAddDialog() {
    if (!this.selectedProject) return;
    const ref = this.dialog.open(AddDocumentDialogComponent, {
      width: "80vw",
      maxWidth: "80vw",
      maxHeight: "80vh",
      data: { project: this.selectedProject },
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
