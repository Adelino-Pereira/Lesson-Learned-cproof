/**
 * confirm-dialog.component.ts — Reusable confirmation dialog.
 * Replicates the DCS production pattern: header with title + close icon,
 * divider, message body, and NO/YES action buttons.
 */

import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

/**
 * Data model passed into the confirmation dialog.
 * Matches DCS's ConfirmDialogModel pattern.
 */
export class ConfirmDialogModel {
  constructor(
    public title: string,
    public message: string,
  ) {}
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, MatDividerModule],
  template: `
    <div class="dialog-header" mat-dialog-title>
      <h2 class="dialog-title">{{ data.title }}</h2>
      <button mat-icon-button class="close-btn" (click)="closeDialog()">
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <mat-divider></mat-divider>

    <div mat-dialog-content class="dialog-body">
      <p>{{ data.message }}</p>
    </div>

    <div mat-dialog-actions align="end" class="dialog-actions">
      <button mat-raised-button class="no-btn" (click)="closeDialog()">NO</button>
      <button mat-raised-button color="primary" (click)="onConfirm()">YES</button>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    .dialog-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 24px 8px;
      margin: 0 !important;
    }
    .dialog-title {
      margin: 0;
      font-size: 18px;
      font-weight: 500;
    }
    .close-btn {
      color: #666;
    }
    .dialog-body {
      padding: 24px 24px !important;
      text-align: center;
    }
    .dialog-body p {
      margin: 0;
      font-size: 15px;
      color: #333;
    }
    .dialog-actions {
      padding: 8px 24px 16px !important;
      gap: 8px;
      justify-content: flex-end;
    }
    .no-btn {
      background-color: #c3c3c3 !important;
      color: #fff !important;
    }
  `],
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogModel,
  ) {
    // Prevent closing on backdrop click (matches DCS behavior)
    dialogRef.disableClose = true;
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  closeDialog(): void {
    this.dialogRef.close(false);
  }
}
