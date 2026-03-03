import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
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
import { KnowledgeItemDetail, MasterType, MasterProcess } from '../../core/models/knowledge.model';

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
              <span>{{ item.date }}</span>
            }
          </div>

          <!-- Row 3: Owner, Author, Project, Plant -->
          <div class="field">
            <span class="label">Owner</span>
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
                <mat-select [(ngModel)]="item.project">
                  @for (proj of projects; track proj) {
                    <mat-option [value]="proj">{{ proj }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
            } @else {
              <span>{{ item.project || '—' }}</span>
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

          <!-- Row 5: Created + Processes side by side -->
          <div class="field">
            <span class="label">Created</span>
            <span>{{ item.created_at }}</span>
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
          @if (item.visibility_status === 'PENDING') {
            <button mat-raised-button class="validate-btn" (click)="validate('VISIBLE')" [disabled]="validating">
              <mat-icon>check_circle</mat-icon> VALIDATE
            </button>
            <button mat-raised-button class="reject-btn" (click)="validate('NOT_VISIBLE')" [disabled]="validating">
              <mat-icon>cancel</mat-icon> REJECT
            </button>
          }
          <button mat-raised-button color="primary" (click)="toggleEdit()">EDIT</button>
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
    .status-VISIBLE { background: #e8f5e9; color: #2e7d32; }
    .status-NOT_VISIBLE { background: #eeeeee; color: #616161; }
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
  types: MasterType[] = [];
  allProcesses: MasterProcess[] = [];
  selectedProcessIds: number[] = [];

  plants = ['Doureca Portugal', 'Dourdin Romania', 'Dourdin France', 'Durden Turkey'];
  projects = [
    'Proj-2026/001', 'Proj-2026/002', 'Proj-2026/003', 'Proj-2026/004', 'Proj-2026/005',
    'Proj-2026/006', 'Proj-2026/007', 'Proj-2026/008', 'Proj-2026/009', 'Proj-2026/010',
  ];

  private itemSnapshot: string = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { itemId: number },
    private dialogRef: MatDialogRef<DetailDialogComponent>,
    private knowledgeApi: KnowledgeApiService,
    private masterData: MasterDataService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    this.masterData.getTypes().subscribe(t => this.types = t);
    this.masterData.getProcesses().subscribe(p => this.allProcesses = p);
    this.knowledgeApi.getById(this.data.itemId).subscribe(item => {
      this.item = item;
      this.selectedProcessIds = item.processes.map(p => p.id);
    });
  }

  toggleEdit() {
    this.itemSnapshot = JSON.stringify(this.item);
    this.editing = true;
  }

  cancelEdit() {
    this.item = JSON.parse(this.itemSnapshot);
    this.selectedProcessIds = this.item!.processes.map(p => p.id);
    this.editing = false;
  }

  validate(status: 'VISIBLE' | 'NOT_VISIBLE') {
    if (!this.item) return;
    this.validating = true;
    this.knowledgeApi.updateStatus(this.item.id, status).subscribe({
      next: (updated) => {
        this.item!.visibility_status = updated.visibility_status;
        const label = status === 'VISIBLE' ? 'validated' : 'rejected';
        this.snackBar.open(`Item ${label} successfully`, 'Close', { duration: 3000 });
        this.validating = false;
      },
      error: () => {
        this.snackBar.open('Failed to update status', 'Close', { duration: 3000 });
        this.validating = false;
      },
    });
  }

  saveEdit() {
    if (!this.item) return;
    const body = {
      title: this.item.title,
      designation: this.item.designation,
      date: this.item.date,
      owner: this.item.owner,
      author: this.item.author,
      type_id: this.item.type_id,
      project: this.item.project,
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

  close() {
    this.dialogRef.close();
  }
}
