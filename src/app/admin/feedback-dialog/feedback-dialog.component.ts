import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-feedback-dialog',
  templateUrl: './feedback-dialog.component.html',
})
export class FeedbackDialogComponent {
  feedbackText: string = '';

  constructor(private dialogRef: MatDialogRef<FeedbackDialogComponent>) {}

  closeDialog(): void {
    this.dialogRef.close();
  }

  submitFeedback(): void {
    if (this.feedbackText.trim()) {
      console.log('Feedback submitted:', this.feedbackText);
      this.dialogRef.close(this.feedbackText); // send feedback back if needed
    }
  }
}
