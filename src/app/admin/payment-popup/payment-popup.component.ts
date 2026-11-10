import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InvoiceService } from 'src/app/services/invoice.service';
import { HttpErrorResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';

export interface PaymentData {
  payment_amount: number;
  payment_date: string;
  payment_method: string;
  reference_number: string;
  notes: string;
  attachments?: File[];
}

export interface Attachment {
  id: number | null;
  filename: string;
  path: string;
  date?: string;
}

export interface PaymentSummary {
  total_paid: string;
  total_due: number;
  payment_count: number;
  last_payment_date: string;
}

@Component({
  selector: 'app-payment-popup',
  templateUrl: './payment-popup.component.html',
  styleUrls: ['./payment-popup.component.scss']
})
export class PaymentPopupComponent implements OnInit {
  @Input() invoiceId: number = 0;
  private _invoiceAmount: number = 0;
  
  @Input() 
  set invoiceAmount(value: number) {
    this._invoiceAmount = value;
    this.updatePaymentAmountValidator();
  }
  
  get invoiceAmount(): number {
    return this._invoiceAmount;
  }
  @Input() customerName: string = '';
  @Input() totalPaid: number = 0;
  @Input() paymentSummary: PaymentSummary | null = null;
  
  // Add a setter to log when attachments change
  @Input() set existingAttachments(value: Attachment[]) {
    console.log('Setting existing attachments:', value);
    this._existingAttachments = value;
  }

  // Add a setter to detect when popup becomes visible and fetch real data
  @Input() set isVisible(value: boolean) {
    console.log('Payment popup isVisible setter called with:', value);
    this._isVisible = value; // Actually set the visibility property
    console.log('Payment popup _isVisible is now:', this._isVisible);
    if (value && this.invoiceId) {
      // Popup is now visible, fetch fresh transaction data
      console.log('Popup is visible, will fetch transaction data for invoice:', this.invoiceId);
      setTimeout(() => this.fetchTransactionData(), 100);
    }
  }
  
  get isVisible(): boolean {
    return this._isVisible;
  }
  
  get existingAttachments(): Attachment[] {
    return this._existingAttachments;
  }
  
  private _isVisible: boolean = false;
  private _existingAttachments: Attachment[] = [];
  @Output() closePopup = new EventEmitter<void>();
  @Output() paymentRecorded = new EventEmitter<any>();

  paymentForm: FormGroup;
  isLoading = false;
  showError = false;
  errorMessage = '';
  
  // File attachment properties
  selectedFiles: File[] = [];
  maxFileSize = 10 * 1024 * 1024; // 10MB
  allowedFileTypes = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'txt'];
  dragOver = false;

  paymentMethods = [
    'Cash',
    'Check',
    'Bank Transfer',
    'Credit Card',
    'Debit Card',
    'PayPal',
    'Other'
  ];

  constructor(
    private fb: FormBuilder,
    private invoiceService: InvoiceService
  ) {
    this.paymentForm = this.fb.group({
      payment_amount: [0, [Validators.required, Validators.min(0.01)]],
      payment_date: ['', Validators.required],
      payment_method: ['', Validators.required],
      reference_number: [''],
      notes: ['']
    });
  }

  // Custom validator to check payment amount doesn't exceed remaining balance
  private paymentAmountValidator(): any {
    return (control: any) => {
      if (!control.value || !this.invoiceAmount) {
        return null;
      }
      
      const paymentAmount = parseFloat(control.value);
      const invoiceAmount = parseFloat(this.invoiceAmount.toString());
      const remainingBalance = invoiceAmount - this.totalPaid;
      
      if (isNaN(paymentAmount) || isNaN(invoiceAmount)) {
        return null;
      }
      
      if (paymentAmount > remainingBalance) {
        return { amountExceedsBalance: true };
      }
      
      return null;
    };
  }

  ngOnInit() {
    console.log('Payment popup ngOnInit called');
    console.log('Invoice ID:', this.invoiceId);
    console.log('Is Visible:', this.isVisible);
    this.initializeForm();
    this.updatePaymentAmountValidator();
    console.log('Payment popup initialized with attachments:', this.existingAttachments);
    // Fetch real transaction data when component initializes
    if (this.invoiceId) {
      this.fetchTransactionData();
    }
  }

  fetchTransactionData(): void {
    console.log('Fetching real transaction data for invoice:', this.invoiceId);
    this.isLoading = true;
    
    this.invoiceService.getInvoiceTransactions(this.invoiceId).subscribe({
      next: (response: any) => {
        console.log('Real transaction data received:', response);
        this.isLoading = false;
        
        if (response && response.data && Array.isArray(response.data)) {
          // Extract attachments from transactions
          const allAttachments: Attachment[] = [];
          
          response.data.forEach((transaction: any) => {
            if (transaction.attachments && Array.isArray(transaction.attachments)) {
              transaction.attachments.forEach((attachment: any) => {
                allAttachments.push({
                  id: attachment.id,
                  filename: attachment.filename || attachment.name,
                  path: attachment.path || attachment.file_path,
                  date: transaction.created_at || transaction.payment_date
                });
              });
            }
          });
          
          console.log('Extracted attachments from transactions:', allAttachments);
          this._existingAttachments = allAttachments;
        }
      },
      error: (error: any) => {
        console.error('Error fetching transaction data:', error);
        this.isLoading = false;
        // Keep existing attachments if any, don't show error to user for this
      }
    });
  }

  initializeForm() {
    const today = new Date().toISOString().split('T')[0];
    this.paymentForm.patchValue({
      payment_date: today,
      payment_amount: this.invoiceAmount
    });
  }

  updatePaymentAmountValidator() {
    const paymentAmountControl = this.paymentForm.get('payment_amount');
    if (paymentAmountControl) {
      paymentAmountControl.setValidators([
        Validators.required, 
        Validators.min(0.01),
        this.paymentAmountValidator()
      ]);
      paymentAmountControl.updateValueAndValidity();
    }
  }

  onClose() {
    this.closePopup.emit();
    this.resetForm();
  }

  resetForm() {
    this.paymentForm.reset();
    this.selectedFiles = [];
    this.showError = false;
    this.errorMessage = '';
    this.initializeForm();
  }

  onSubmit() {
    if (this.paymentForm.valid) {
      this.isLoading = true;
      this.showError = false;

      const paymentData: PaymentData = {
        payment_amount: this.paymentForm.value.payment_amount,
        payment_date: this.paymentForm.value.payment_date,
        payment_method: this.paymentForm.value.payment_method,
        reference_number: this.paymentForm.value.reference_number || '',
        notes: this.paymentForm.value.notes || '',
        attachments: this.selectedFiles
      };

      this.invoiceService.recordPaymentWithAttachments(this.invoiceId, paymentData).subscribe({
        next: (response: any) => {
          console.log('Payment recorded successfully:', response);
          this.isLoading = false;
          this.paymentRecorded.emit(response);
          this.onClose();
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error recording payment:', error);
          this.isLoading = false;
          this.showError = true;
          
          if (error.status === 401) {
            this.errorMessage = 'Authentication error: Please log in again.';
          } else if (error.status === 422) {
            this.errorMessage = 'Validation failed. Please check your input.';
          } else if (error.status === 400) {
            this.errorMessage = 'Invalid request. Please check your input and try again.';
          } else {
            this.errorMessage = 'Failed to record payment. Please try again.';
          }
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  markFormGroupTouched() {
    Object.keys(this.paymentForm.controls).forEach(key => {
      const control = this.paymentForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.paymentForm.get(fieldName);
    if (field?.errors && field?.touched) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} is required`;
      }
      if (field.errors['min']) {
        return `${this.getFieldLabel(fieldName)} must be greater than 0`;
      }
      if (field.errors['amountExceedsBalance']) {
        const remainingBalance = this.invoiceAmount - this.totalPaid;
        return `Payment amount cannot exceed remaining balance of $${remainingBalance.toFixed(2)}`;
      }
    }
    return '';
  }

  getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      payment_amount: 'Payment amount',
      payment_date: 'Payment date',
      payment_method: 'Payment method',
      reference_number: 'Reference number',
      notes: 'Notes'
    };
    return labels[fieldName] || fieldName;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.paymentForm.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }

  onPaymentAmountInput() {
    const paymentAmountControl = this.paymentForm.get('payment_amount');
    if (paymentAmountControl) {
      // Auto-cap payment amount if it exceeds remaining balance
      const currentValue = parseFloat(paymentAmountControl.value);
      const remainingBalance = this.invoiceAmount - this.totalPaid;
      if (!isNaN(currentValue) && currentValue > remainingBalance) {
        paymentAmountControl.setValue(remainingBalance);
      }
      paymentAmountControl.updateValueAndValidity();
    }
  }

  // File attachment methods
  onFileSelected(event: any): void {
    const files = event.target.files;
    if (files) {
      this.addFiles(Array.from(files));
    }
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragOver = false;
    
    const files = event.dataTransfer?.files;
    if (files) {
      this.addFiles(Array.from(files));
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.dragOver = false;
  }

  private addFiles(files: File[]): void {
    for (const file of files) {
      if (this.validateFile(file)) {
        this.selectedFiles.push(file);
      }
    }
  }

  private validateFile(file: File): boolean {
    // Check file size
    if (file.size > this.maxFileSize) {
      this.showError = true;
      this.errorMessage = `File ${file.name} is too large. Maximum size is ${this.maxFileSize / (1024 * 1024)}MB.`;
      return false;
    }

    // Check file type
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !this.allowedFileTypes.includes(fileExtension)) {
      this.showError = true;
      this.errorMessage = `File type ${fileExtension} is not allowed. Allowed types: ${this.allowedFileTypes.join(', ')}.`;
      return false;
    }

    return true;
  }

  removeFile(file: File): void {
    const index = this.selectedFiles.indexOf(file);
    if (index > -1) {
      this.selectedFiles.splice(index, 1);
    }
  }

  getFileSize(file: File): string {
    if (file.size < 1024) {
      return file.size + ' B';
    } else if (file.size < 1024 * 1024) {
      return (file.size / 1024).toFixed(1) + ' KB';
    } else {
      return (file.size / (1024 * 1024)).toFixed(1) + ' MB';
    }
  }

  // Existing attachment methods
  isImageFile(filename: string): boolean {
    const extension = filename.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension || '');
  }

  getImageAttachments(): Attachment[] {
    return this._existingAttachments.filter(attachment => this.isImageFile(attachment.filename));
  }

  getFileIcon(filename: string): string {
    const extension = filename.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z';
      case 'doc':
      case 'docx':
        return 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z';
      case 'txt':
        return 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z';
      default:
        return 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z';
    }
  }

  getAttachmentUrl(attachment: Attachment): string {
    // If path is already a complete URL, return it as-is
    if (attachment.path.startsWith('http://') || attachment.path.startsWith('https://')) {
      return attachment.path;
    }
    
    // Otherwise, construct the full URL using the environment API URL and attachment path
    const baseUrl = environment.apiUrl.replace('/api', ''); // Remove /api from the base URL
    return `${baseUrl}/${attachment.path}`;
  }

  openAttachment(attachment: Attachment): void {
    const url = this.getAttachmentUrl(attachment);
    if (this.isImageFile(attachment.filename)) {
      // For images, open in a new tab or modal
      window.open(url, '_blank');
    } else {
      // For other files, trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = attachment.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  onImageError(event: any): void {
    // Handle image loading errors by showing a fallback icon
    const imgElement = event.target as HTMLImageElement;
    imgElement.style.display = 'none';
    
    // Show fallback icon
    const parent = imgElement.parentElement;
    if (parent) {
      const fallbackIcon = document.createElement('svg');
      fallbackIcon.className = 'h-12 w-12 text-gray-400';
      fallbackIcon.setAttribute('fill', 'none');
      fallbackIcon.setAttribute('stroke', 'currentColor');
      fallbackIcon.setAttribute('viewBox', '0 0 24 24');
      fallbackIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>';
      parent.appendChild(fallbackIcon);
    }
  }



}
