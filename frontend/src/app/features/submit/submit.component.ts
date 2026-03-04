import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_FORMATS, NativeDateAdapter } from '@angular/material/core';

class YyyyMmDdAdapter extends NativeDateAdapter {
  override format(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}/${m}/${d}`;
  }

  override parse(value: string): Date | null {
    if (!value) return null;
    const parts = value.split('/');
    if (parts.length === 3) {
      return new Date(+parts[0], +parts[1] - 1, +parts[2]);
    }
    return super.parse(value);
  }
}

const APP_DATE_FORMATS = {
  parse: { dateInput: 'input' },
  display: {
    dateInput: 'input',
    monthYearLabel: { year: 'numeric', month: 'short' },
    dateA11yLabel: { year: 'numeric', month: 'long', day: 'numeric' },
    monthYearA11yLabel: { year: 'numeric', month: 'long' },
  },
};

import { KnowledgeApiService } from '../../core/services/knowledge-api.service';
import { MasterDataService } from '../../core/services/master-data.service';
import { AuthService } from '../../core/services/auth.service';
import { MasterType, MasterProcess, MasterProject } from '../../core/models/knowledge.model';

@Component({
  selector: 'app-submit',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatCardModule,
    MatSnackBarModule, MatDatepickerModule,
  ],
  providers: [
    { provide: DateAdapter, useClass: YyyyMmDdAdapter },
    { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS },
  ],
  template: `
    <div class="submit-header">
      <h2>Submit New Knowledge Item</h2>
    </div>

    <mat-card>
      <mat-card-content>
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form-grid">
          <mat-form-field appearance="outline" class="full-span">
            <mat-label>Title</mat-label>
            <input matInput formControlName="title" placeholder="Enter title">
            @if (form.get('title')?.hasError('required') && form.get('title')?.touched) {
              <mat-error>Title is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Designation</mat-label>
            <input matInput formControlName="designation" placeholder="e.g. GL-INJ-001">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Date</mat-label>
            <input matInput [matDatepicker]="picker" formControlName="date">
            <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
            <mat-datepicker #picker></mat-datepicker>
            @if (form.get('date')?.hasError('required') && form.get('date')?.touched) {
              <mat-error>Date is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Customer</mat-label>
            <input matInput formControlName="owner" placeholder="Enter customer name">
            @if (form.get('owner')?.hasError('required') && form.get('owner')?.touched) {
              <mat-error>Customer is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Type</mat-label>
            <mat-select formControlName="type_id">
              @for (t of types; track t.id) {
                <mat-option [value]="t.id">{{ t.label }}</mat-option>
              }
            </mat-select>
            @if (form.get('type_id')?.hasError('required') && form.get('type_id')?.touched) {
              <mat-error>Type is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Project</mat-label>
            <mat-select formControlName="project_id">
              @for (proj of projects; track proj.id) {
                <mat-option [value]="proj.id">{{ proj.name }} ({{ proj.designation }})</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Plant</mat-label>
            <mat-select formControlName="plant">
              @for (pl of plants; track pl) {
                <mat-option [value]="pl">{{ pl }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Processes</mat-label>
            <mat-select formControlName="processes" multiple>
              @for (p of processList; track p.id) {
                <mat-option [value]="p.id">{{ p.label }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-span">
            <mat-label>Document Link</mat-label>
            <input matInput formControlName="document_link" placeholder="https://docs.example.com/...">
            <mat-icon matPrefix>link</mat-icon>
          </mat-form-field>

          <div class="file-upload-section">
            <label class="file-label">
              <mat-icon>attach_file</mat-icon> Upload Documents
              <input type="file" multiple (change)="onDocumentSelected($event)" accept=".pdf,.doc,.docx,.xls,.xlsx,.txt">
            </label>
            @for (f of documentFiles; track f.name) {
              <span class="file-chip">{{ f.name }}</span>
            }
          </div>

          <div class="file-upload-section">
            <label class="file-label">
              <mat-icon>image</mat-icon> Upload Images
              <input type="file" multiple (change)="onImageSelected($event)" accept="image/*">
            </label>
            @for (f of imageFiles; track f.name) {
              <span class="file-chip">{{ f.name }}</span>
            }
          </div>

          <div class="form-actions full-span">
            <button mat-stroked-button type="button" (click)="goBack()">Cancel</button>
            <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || submitting">
              @if (submitting) {
                Submitting...
              } @else {
                Submit Item
              }
            </button>
          </div>
        </form>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .submit-header { margin-bottom: 16px; }
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0 16px;
    }
    .full-span { grid-column: 1 / -1; }
    .file-upload-section {
      padding: 8px 0;
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }
    .file-label {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 6px 16px;
      border: 1px dashed #ccc;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }
    .file-label input { display: none; }
    .file-label:hover { background: #f5f5f5; }
    .file-chip {
      background: #e8eaf6;
      color: #3f51b5;
      border-radius: 12px;
      padding: 2px 10px;
      font-size: 12px;
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding-top: 16px;
    }
  `],
})
export class SubmitComponent implements OnInit {
  form!: FormGroup;
  types: MasterType[] = [];
  processList: MasterProcess[] = [];
  documentFiles: File[] = [];
  imageFiles: File[] = [];
  submitting = false;

  plants = ['Doureca Portugal', 'Dourdin Romania', 'Dourdin France', 'Durden Turkey'];
  projects: MasterProject[] = [];

  constructor(
    private fb: FormBuilder,
    private knowledgeApi: KnowledgeApiService,
    private masterData: MasterDataService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      title: ['', Validators.required],
      designation: [''],
      date: [null, Validators.required],
      owner: ['', Validators.required],
      author: [this.authService.currentUser?.name || '', Validators.required],
      type_id: [null, Validators.required],
      project_id: [null],
      plant: [''],
      processes: [[]],
      document_link: [''],
    });

    this.masterData.getTypes().subscribe(t => this.types = t.filter(x => x.id !== 3 && x.id !== 4));
    this.masterData.getProcesses().subscribe(p => this.processList = p);
    this.knowledgeApi.getProjects().subscribe(p => this.projects = p);
  }

  onDocumentSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.documentFiles = Array.from(input.files);
    }
  }

  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.imageFiles = Array.from(input.files);
    }
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.submitting = true;

    const formData = new FormData();
    const values = this.form.value;

    formData.append('title', values.title);
    formData.append('designation', values.designation || '');
    formData.append('date', values.date instanceof Date ? values.date.toISOString().split('T')[0] : values.date);
    formData.append('owner', values.owner);
    formData.append('author', values.author);
    formData.append('type_id', values.type_id);
    formData.append('project_id', values.project_id || '');
    formData.append('plant', values.plant || '');
    formData.append('processes', JSON.stringify(values.processes || []));
    formData.append('document_link', values.document_link || '');

    for (const file of this.documentFiles) {
      formData.append('documents', file);
    }
    for (const file of this.imageFiles) {
      formData.append('images', file);
    }

    this.knowledgeApi.create(formData).subscribe({
      next: (created) => {
        this.snackBar.open('Knowledge item submitted successfully!', 'Close', { duration: 3000 });
        this.router.navigate(['/knowledge']);
      },
      error: () => {
        this.snackBar.open('Failed to submit item', 'Close', { duration: 3000 });
        this.submitting = false;
      },
    });
  }

  goBack() {
    this.router.navigate(['/knowledge']);
  }
}
