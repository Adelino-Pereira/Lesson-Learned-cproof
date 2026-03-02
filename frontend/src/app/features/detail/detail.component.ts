import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';

import { KnowledgeApiService } from '../../core/services/knowledge-api.service';
import { KnowledgeItemDetail } from '../../core/models/knowledge.model';

@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule, MatChipsModule, MatIconModule,
    MatButtonModule, MatDividerModule, MatListModule,
  ],
  template: `
    <button mat-stroked-button (click)="goBack()" class="back-btn">
      <mat-icon>arrow_back</mat-icon> Back to Listing
    </button>

    @if (item) {
      <mat-card class="detail-card">
        <mat-card-header>
          <mat-card-title>{{ item.title }}</mat-card-title>
          <mat-card-subtitle>{{ item.designation }}</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <div class="detail-grid">
            <div class="field">
              <span class="label">Status</span>
              <span class="status-badge" [ngClass]="'status-' + item.visibility_status">
                {{ item.visibility_status }}
              </span>
            </div>
            <div class="field">
              <span class="label">Type</span>
              <span>{{ item.type_label }}</span>
            </div>
            <div class="field">
              <span class="label">Date</span>
              <span>{{ item.date }}</span>
            </div>
            <div class="field">
              <span class="label">Owner</span>
              <span>{{ item.owner }}</span>
            </div>
            <div class="field">
              <span class="label">Author</span>
              <span>{{ item.author }}</span>
            </div>
            <div class="field">
              <span class="label">Project</span>
              <span>{{ item.project || '—' }}</span>
            </div>
            <div class="field">
              <span class="label">Plant</span>
              <span>{{ item.plant || '—' }}</span>
            </div>
            <div class="field">
              <span class="label">Created</span>
              <span>{{ item.created_at }}</span>
            </div>
          </div>

          <mat-divider class="divider"></mat-divider>

          <h3>Processes</h3>
          <mat-chip-set>
            @for (p of item.processes; track p.id) {
              <mat-chip>{{ p.label }}</mat-chip>
            }
            @if (item.processes.length === 0) {
              <span class="muted">No processes linked</span>
            }
          </mat-chip-set>

          <mat-divider class="divider"></mat-divider>

          <h3>Attached Files</h3>
          @if (item.files.length > 0) {
            <mat-list>
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
            <p class="muted">No files attached</p>
          }
        </mat-card-content>
      </mat-card>
    } @else {
      <p>Loading...</p>
    }
  `,
  styles: [`
    .back-btn { margin-bottom: 16px; }
    .detail-card { max-width: 800px; }
    .detail-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-top: 16px;
    }
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
    .divider { margin: 20px 0; }
    .muted { color: #999; font-style: italic; }
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
  `],
})
export class DetailComponent implements OnInit {
  item: KnowledgeItemDetail | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private knowledgeApi: KnowledgeApiService,
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.knowledgeApi.getById(id).subscribe(item => this.item = item);
  }

  goBack() {
    this.router.navigate(['/knowledge']);
  }
}
