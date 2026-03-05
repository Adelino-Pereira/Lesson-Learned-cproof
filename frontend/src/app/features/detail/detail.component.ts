/**
 * detail.component.ts — Knowledge item detail dialog.
 * Opens as a Material dialog from the listing page. Features:
 *   - View mode: displays all item metadata, processes (chips), files, derived-from link
 *   - Edit mode: inline editing of all fields with save/cancel
 *   - Validate: approve or reject pending items (admin/validator roles)
 *   - Officialise: transform a Lessons-learned into Good-practice/Guide-line,
 *     or create a new derived item (sets derived_from_id)
 */

import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { KnowledgeApiService } from '../../core/services/knowledge-api.service';
import { MasterDataService } from '../../core/services/master-data.service';
import { PermissionService } from '../../core/services/permission.service';
import { KnowledgeItemDetail, MasterType, MasterProcess, MasterProject } from '../../core/models/knowledge.model';

@Component({
  selector: 'app-detail-dialog',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatDialogModule,
    MatCardModule, MatChipsModule, MatIconModule,
    MatButtonModule, MatDividerModule, MatListModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatSnackBarModule,
  ],
  template: `
    @if (item) {
      <h2 mat-dialog-title>{{ item.title }}</h2>

      <mat-dialog-content>
        <div class="detail-grid">
          <!-- Row 1: Title (full width) -->
          <div class="field full-span">
            <span class="label">Title</span>
            @if (editing) {
              <mat-form-field appearance="outline" class="edit-field">
                <input matInput [(ngModel)]="item.title">
              </mat-form-field>
            } @else {
              <span>{{ item.title }}</span>
            }
          </div>

          <!-- Row 2: Designation, Type, Status, Date -->
          <div class="field">
            <span class="label">Designation</span>
            @if (editing) {
              <mat-form-field appearance="outline" class="edit-field">
                <input matInput [(ngModel)]="item.designation">
              </mat-form-field>
            } @else {
              <span>{{ item.designation || '—' }}</span>
            }
          </div>

          <div class="field">
            <span class="label">Type</span>
            @if (editing) {
              <mat-form-field appearance="outline" class="edit-field">
                <mat-select [(ngModel)]="item.type_id">
                  @for (t of types; track t.id) {
                    <mat-option [value]="t.id">{{ t.label }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
            } @else {
              <span>{{ item.type_label }}</span>
            }
          </div>

          <div class="field">
            <span class="label">Status</span>
            <span class="status-badge" [ngClass]="'status-' + item.visibility_status">
              {{ item.visibility_status }}
            </span>
          </div>

          <div class="field">
            <span class="label">Date</span>
            @if (editing) {
              <mat-form-field appearance="outline" class="edit-field">
                <input matInput type="date" [(ngModel)]="item.date">
              </mat-form-field>
            } @else {
              <span>{{ item.date | date:'yyyy/MM/dd' }}</span>
            }
          </div>

          <!-- Row 3: Customer, Author, Project, Plant -->
          <div class="field">
            <span class="label">Customer</span>
            @if (editing) {
              <mat-form-field appearance="outline" class="edit-field">
                <input matInput [(ngModel)]="item.owner">
              </mat-form-field>
            } @else {
              <span>{{ item.owner }}</span>
            }
          </div>

          <div class="field">
            <span class="label">Author</span>
            @if (editing) {
              <mat-form-field appearance="outline" class="edit-field">
                <input matInput [(ngModel)]="item.author">
              </mat-form-field>
            } @else {
              <span>{{ item.author }}</span>
            }
          </div>

          <div class="field">
            <span class="label">Project</span>
            @if (editing) {
              <mat-form-field appearance="outline" class="edit-field">
                <mat-select [(ngModel)]="item.project_id">
                  @for (proj of projects; track proj.id) {
                    <mat-option [value]="proj.id">{{ proj.name }} ({{ proj.designation }})</mat-option>
                  }
                </mat-select>
              </mat-form-field>
            } @else {
              <span>{{ item.project_name || '—' }}</span>
            }
          </div>

          <div class="field">
            <span class="label">Plant</span>
            @if (editing) {
              <mat-form-field appearance="outline" class="edit-field">
                <mat-select [(ngModel)]="item.plant">
                  @for (pl of plants; track pl) {
                    <mat-option [value]="pl">{{ pl }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
            } @else {
              <span>{{ item.plant || '—' }}</span>
            }
          </div>

          <!-- Row 4: Document Link (full width) -->
          <div class="field full-span">
            <span class="label">Document Link</span>
            @if (editing) {
              <mat-form-field appearance="outline" class="edit-field">
                <input matInput [(ngModel)]="item.document_link" placeholder="https://docs.example.com/...">
                <mat-icon matPrefix>link</mat-icon>
              </mat-form-field>
            } @else {
              @if (item.document_link) {
                <a [href]="item.document_link" target="_blank" class="doc-link">
                  <mat-icon class="link-icon">open_in_new</mat-icon> {{ item.document_link }}
                </a>
              } @else {
                <span class="muted">No link</span>
              }
            }
          </div>

          <!-- Derived from (if applicable) -->
          @if (item.derived_from_id) {
            <div class="field full-span">
              <span class="label">Derived from</span>
              <a class="derived-link" (click)="openParent(item.derived_from_id!)">
                <mat-icon class="link-icon">launch</mat-icon> {{ item.derived_from_title || 'Item #' + item.derived_from_id }}
              </a>
            </div>
          }

          <!-- Row 5: Created + Processes side by side -->
          <div class="field">
            <span class="label">Created</span>
            <span>{{ item.created_at | date:'yyyy/MM/dd' }}</span>
          </div>

          <div class="field span-2">
            <span class="label">Processes</span>
            @if (editing) {
              <mat-form-field appearance="outline" class="edit-field">
                <mat-select [(ngModel)]="selectedProcessIds" multiple>
                  @for (p of allProcesses; track p.id) {
                    <mat-option [value]="p.id">{{ p.label }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
            } @else {
              <mat-chip-set>
                @for (p of item.processes; track p.id) {
                  <mat-chip>{{ p.label }}</mat-chip>
                }
                @if (item.processes.length === 0) {
                  <span class="muted">No processes linked</span>
                }
              </mat-chip-set>
            }
          </div>

          <div class="field">
            <span class="label">Attached Files</span>
            @if (item.files.length > 0) {
              <mat-list dense>
                @for (f of item.files; track f.id) {
                  <mat-list-item>
                    <mat-icon matListItemIcon>
                      {{ f.file_kind === 'IMAGE' ? 'image' : 'description' }}
                    </mat-icon>
                    <a matListItemTitle [href]="'/' + f.storage_path" target="_blank">
                      {{ f.filename_original }}
                    </a>
                    <span matListItemLine>{{ f.file_kind }} &middot; {{ f.uploaded_at }}</span>
                  </mat-list-item>
                }
              </mat-list>
            } @else {
              <span class="muted">No files attached</span>
            }
          </div>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        @if (editing) {
          <button mat-raised-button (click)="cancelEdit()">CANCEL</button>
          <button mat-raised-button color="primary" (click)="saveEdit()">SAVE</button>
        } @else {
          @if (item.visibility_status === 'PENDING' && permissions.hasPermission('knowledge:validate')) {
            <button mat-raised-button class="validate-btn" (click)="validate('APPROVED')" [disabled]="validating">
              <mat-icon>check_circle</mat-icon> VALIDATE
            </button>
            <button mat-raised-button class="reject-btn" (click)="validate('REJECTED')" [disabled]="validating">
              <mat-icon>cancel</mat-icon> REJECT
            </button>
          }
          @if (item.type_id === 6 && !item.derived_from_id && item.visibility_status === 'APPROVED' && permissions.hasPermission('knowledge:edit')) {
            @if (officialising) {
              <mat-form-field appearance="outline" class="officialise-select">
                <mat-label>Target type</mat-label>
                <mat-select [(ngModel)]="officialiseTypeId">
                  <mat-option [value]="4">Good-practice</mat-option>
                  <mat-option [value]="3">Guide-line</mat-option>
                </mat-select>
              </mat-form-field>
              <button mat-raised-button (click)="officialising = false">CANCEL</button>
              <button mat-raised-button class="officialise-btn" (click)="confirmOfficialise('transform')" [disabled]="!officialiseTypeId || creatingDerived">
                TRANSFORM
              </button>
              <button mat-raised-button class="validate-btn" (click)="confirmOfficialise('create')" [disabled]="!officialiseTypeId || creatingDerived">
                CREATE NEW
              </button>
            } @else {
              <button mat-raised-button class="officialise-btn" (click)="officialising = true">
                <mat-icon>verified</mat-icon> OFFICIALISE
              </button>
            }
          }
          @if (permissions.hasPermission('knowledge:edit')) {
            <button mat-raised-button color="primary" (click)="toggleEdit()">EDIT</button>
          }
          <button mat-raised-button class="exit-btn" (click)="close()">EXIT</button>
        }
      </mat-dialog-actions>
    } @else {
      <mat-dialog-content>
        <p>Loading...</p>
      </mat-dialog-content>
    }
  `,
  styles: [`
    .detail-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr 1fr;
      gap: 16px;
    }
    .full-span { grid-column: 1 / -1; }
    .span-2 { grid-column: span 2; }
    .field {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .edit-field {
      width: 100%;
    }
    .muted { color: #999; font-style: italic; }
    .doc-link {
      color: #3f51b5;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      word-break: break-all;
    }
    .doc-link:hover { text-decoration: underline; }
    .link-icon { font-size: 18px; width: 18px; height: 18px; }
    .status-badge {
      display: inline-block;
      border-radius: 12px;
      padding: 2px 10px;
      font-size: 12px;
      font-weight: 500;
      width: fit-content;
    }
    .status-PENDING { background: #fff8e1; color: #f57f17; }
    .status-APPROVED { background: #e8f5e9; color: #2e7d32; }
    .status-REJECTED { background: #eeeeee; color: #616161; }
    .validate-btn {
      background-color: #2e7d32 !important;
      color: #fff !important;
    }
    .reject-btn {
      background-color: #c62828 !important;
      color: #fff !important;
    }
    .validate-btn mat-icon, .reject-btn mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      margin-right: 4px;
    }
    .exit-btn {
      background-color: #C3C3C3 !important;
      color: #fff;
    }
    .derived-link {
      color: #3f51b5;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    .derived-link:hover { text-decoration: underline; }
    .officialise-btn {
      background-color: #1565c0 !important;
      color: #fff !important;
    }
    .officialise-btn mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      margin-right: 4px;
    }
    .officialise-select {
      width: 160px;
      margin-bottom: -1.25em;
    }
    mat-dialog-actions {
      padding: 12px 24px !important;
      gap: 8px;
    }
  `],
})
export class DetailDialogComponent implements OnInit {
  item: KnowledgeItemDetail | null = null;
  editing = false;
  validating = false;
  officialising = false;
  officialiseTypeId: number | null = null;
  creatingDerived = false;
  types: MasterType[] = [];
  allProcesses: MasterProcess[] = [];
  selectedProcessIds: number[] = [];

  plants = ['Doureca Portugal', 'Dourdin Romania', 'Dourdin France', 'Durden Turkey'];
  projects: MasterProject[] = [];

  private itemSnapshot: string = '';   // JSON snapshot for edit cancel/restore
  private modified = false;            // Track if any changes were made (for listing refresh)

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { itemId: number },
    private dialogRef: MatDialogRef<DetailDialogComponent>,
    private dialog: MatDialog,
    private knowledgeApi: KnowledgeApiService,
    private masterData: MasterDataService,
    private snackBar: MatSnackBar,
    public permissions: PermissionService,
  ) {}

  ngOnInit() {
    // Load dropdown data and fetch the item detail
    this.masterData.getTypes().subscribe(t => this.types = t.filter(x => x.id !== 3 && x.id !== 4));
    this.masterData.getProcesses().subscribe(p => this.allProcesses = p);
    this.knowledgeApi.getProjects().subscribe(p => this.projects = p);
    this.knowledgeApi.getById(this.data.itemId).subscribe(item => {
      this.item = item;
      this.selectedProcessIds = item.processes.map(p => p.id);
    });
  }

  /** Enters edit mode — takes a JSON snapshot of the item for cancel/restore */
  toggleEdit() {
    this.itemSnapshot = JSON.stringify(this.item);
    this.editing = true;
  }

  /** Restores the item from the snapshot and exits edit mode */
  cancelEdit() {
    this.item = JSON.parse(this.itemSnapshot);
    this.selectedProcessIds = this.item!.processes.map(p => p.id);
    this.editing = false;
  }

  /** Approves or rejects a pending item (PATCH /api/knowledge/:id/status) */
  validate(status: 'APPROVED' | 'REJECTED') {
    if (!this.item) return;
    this.validating = true;
    this.knowledgeApi.updateStatus(this.item.id, status).subscribe({
      next: (updated) => {
        this.item!.visibility_status = updated.visibility_status;
        const label = status === 'APPROVED' ? 'validated' : 'rejected';
        this.snackBar.open(`Item ${label} successfully`, 'Close', { duration: 3000 });
        this.validating = false;
        this.modified = true;
      },
      error: () => {
        this.snackBar.open('Failed to update status', 'Close', { duration: 3000 });
        this.validating = false;
      },
    });
  }

  /** Sends the edited item data to the API and closes the dialog on success */
  saveEdit() {
    if (!this.item) return;
    const body = {
      title: this.item.title,
      designation: this.item.designation,
      date: this.item.date,
      owner: this.item.owner,
      author: this.item.author,
      type_id: this.item.type_id,
      project_id: this.item.project_id,
      plant: this.item.plant,
      document_link: this.item.document_link,
      processes: this.selectedProcessIds,
    };
    this.knowledgeApi.update(this.item.id, body).subscribe({
      next: (updated) => {
        this.item = updated;
        this.selectedProcessIds = updated.processes.map(p => p.id);
        this.snackBar.open('Changes saved successfully', 'Close', { duration: 3000 });
        this.editing = false;
        this.dialogRef.close('updated');
      },
      error: () => {
        this.snackBar.open('Failed to save changes', 'Close', { duration: 3000 });
      },
    });
  }

  /** Navigates to the parent item (derived-from link) by opening a new detail dialog */
  openParent(parentId: number) {
    this.dialogRef.close();
    this.dialog.open(DetailDialogComponent, {
      width: '90vw',
      maxWidth: '90vw',
      maxHeight: '90vh',
      data: { itemId: parentId },
    });
  }

  /**
   * Officialise a Lessons-learned item into a Good-practice or Guide-line.
   * Two modes:
   *   - 'transform': changes the type of the existing item in-place
   *   - 'create': creates a new item with the selected type, linked via derived_from_id
   */
  confirmOfficialise(mode: 'transform' | 'create') {
    if (!this.item || !this.officialiseTypeId) return;
    this.creatingDerived = true;
    const typeLabel = this.officialiseTypeId === 4 ? 'Good-practice' : 'Guide-line';

    if (mode === 'transform') {
      // Transform mode: update the existing item's type
      const body = {
        title: this.item.title,
        designation: this.item.designation,
        date: this.item.date,
        owner: this.item.owner,
        author: this.item.author,
        type_id: this.officialiseTypeId,
        project_id: this.item.project_id,
        plant: this.item.plant,
        document_link: this.item.document_link,
        processes: this.item.processes.map(p => p.id),
      };
      this.knowledgeApi.update(this.item.id, body).subscribe({
        next: () => {
          this.snackBar.open(`Item transformed into ${typeLabel}`, 'Close', { duration: 3000 });
          this.creatingDerived = false;
          this.officialising = false;
          this.dialogRef.close('updated');
        },
        error: () => {
          this.snackBar.open('Failed to transform item', 'Close', { duration: 3000 });
          this.creatingDerived = false;
        },
      });
    } else {
      // Create mode: create a new derived item with today's date
      const today = new Date();
      const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

      const body = {
        title: this.item.title,
        designation: this.item.designation,
        date: dateStr,
        owner: this.item.owner,
        author: this.item.author,
        type_id: this.officialiseTypeId,
        project_id: this.item.project_id,
        plant: this.item.plant,
        document_link: this.item.document_link,
        processes: JSON.stringify(this.item.processes.map(p => p.id)),
        derived_from_id: this.item.id,
      };

      this.knowledgeApi.createJson(body).subscribe({
        next: () => {
          this.snackBar.open(`New ${typeLabel} created from this item`, 'Close', { duration: 3000 });
          this.creatingDerived = false;
          this.officialising = false;
          this.dialogRef.close('updated');
        },
        error: () => {
          this.snackBar.open('Failed to create derived item', 'Close', { duration: 3000 });
          this.creatingDerived = false;
        },
      });
    }
  }

  close() {
    this.dialogRef.close(this.modified ? 'updated' : undefined);
  }
}
