import { Component, ViewChild, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { QuotesService } from 'src/app/services/quotes.service';
import Swal from 'sweetalert2';

interface LineItem {
  description: string;
  productName: string;
  quantity: number;
  rate: number;
  gst: string;
}

interface FormData {
  contact_id: string;
  customerEmail: string;
  sendLater: boolean;
  billingAddress: string;
  terms: string;
  quoteDate: string;
  validUntil: string;
  notes: string;
  attachments: File[];
  discountMethod: string;
  discountType: number;
}

interface Attachment {
  id: number | null;
  filename: string;
  path: string;
  date?: string;
}

interface Contact {
  id: number;
  'Contact Name': string;
}

interface ContactDetails {
  id: number;
  email: string;
  billing_address: string;
  contact_name: string;
}

interface PaymentTerm {
  id: number;
  text: string;
  description: string;
}

interface Product {
  id: string;
  text: string;
}

@Component({
  selector: 'app-create-quote',
  templateUrl: './create-quote.component.html',
  styleUrls: ['./create-quote.component.scss']
})
export class CreateQuoteComponent implements OnInit {
  @ViewChild('quoteForm') quoteForm!: NgForm;

  formData: FormData = {
    contact_id: '',
    customerEmail: '',
    sendLater: false,
    billingAddress: '',
    terms: '',
    quoteDate: '',
    validUntil: '',
    notes: '',
    attachments: [],
    discountMethod: 'percentage',
    discountType: 0,
  };

  lineItems: LineItem[] = [
    {
      description: '',
      productName: '',
      quantity: 1,
      rate: 1,
      gst: '0'
    }
  ];

  contacts: Contact[] = [];
  paymentTerms: PaymentTerm[] = [];
  products: Product[] = [];
  showProductSuggestions: boolean[] = [];
  filteredProducts: Product[][] = [];

  subtotal = 0;
  taxableSubtotal = 0;
  discountAmount = 0;
  total = 0;
  balanceDue = 0;

  // Error handling
  showError = false;
  errorMessage = '';
  validationErrors: { [key: string]: string[] } = {};

  constructor(private quotesService: QuotesService) { }

  ngOnInit() {
    this.fetchDropdownData();
    // Initialize arrays for the first line item
    this.showProductSuggestions = [false];
    this.filteredProducts = [[]];

    // Ensure discount fields are properly initialized
    this.initializeDiscountFields();

    // Force initial calculation
    this.updateCalculations();

    // Also trigger calculation after a delay to ensure everything is loaded
    setTimeout(() => {
      this.updateCalculations();
    }, 500);
  }

  private initializeDiscountFields() {
    // Ensure discountType is a number
    if (typeof this.formData.discountType !== 'number' || isNaN(this.formData.discountType)) {
      this.formData.discountType = 0;
    }

    // Ensure discountMethod is valid
    if (!['percentage', 'fixed'].includes(this.formData.discountMethod)) {
      this.formData.discountMethod = 'percentage';
    }

    // Ensure discountType is within valid ranges
    if (this.formData.discountType < 0) {
      this.formData.discountType = 0;
    }

    // Ensure discountType is within method-specific limits
    if (this.formData.discountType > 0) {
      if (this.formData.discountMethod === 'percentage' && this.formData.discountType > 100) {
        this.formData.discountType = 100;
      }
    }
  }

  private validateDiscountType() {
    if (this.formData.discountType > 0) {
      if (this.formData.discountMethod === 'percentage' && this.formData.discountType > 100) {
        this.formData.discountType = 100; // Cap at 100%
      } else if (this.formData.discountMethod === 'fixed' && this.formData.discountType > this.subtotal) {
        this.formData.discountType = this.subtotal; // Cap at subtotal
      }
    }

    // Ensure discountType is never negative
    if (this.formData.discountType < 0) {
      this.formData.discountType = 0;
    }

    // Ensure discountType is a valid number
    if (isNaN(this.formData.discountType)) {
      this.formData.discountType = 0;
    }

    // Ensure discountType is within method-specific limits
    if (this.formData.discountType > 0) {
      if (this.formData.discountMethod === 'percentage' && this.formData.discountType > 100) {
        this.formData.discountType = 100;
      } else if (this.formData.discountMethod === 'fixed' && this.formData.discountType > this.subtotal) {
        this.formData.discountType = this.subtotal;
      }
    }
  }

  onDiscountMethodChange() {
    // Reset discount type when method changes to prevent invalid values
    if (this.formData.discountType > 0) {
      if (this.formData.discountMethod === 'percentage' && this.formData.discountType > 100) {
        this.formData.discountType = 0;
      } else if (this.formData.discountMethod === 'fixed' && this.formData.discountType > this.subtotal) {
        this.formData.discountType = 0;
      }
    }

    // Clean and validate discount fields
    this.cleanDiscountFields();

    // Update calculations after method change
    this.updateCalculations();
  }

  validateDiscountInput() {
    // Ensure discount type is a valid number
    if (this.formData.discountType < 0) {
      this.formData.discountType = 0;
    }

    // Apply validation rules
    if (this.formData.discountType > 0) {
      if (this.formData.discountMethod === 'percentage' && this.formData.discountType > 100) {
        this.formData.discountType = 100;
      } else if (this.formData.discountMethod === 'fixed' && this.formData.discountType > this.subtotal) {
        this.formData.discountType = this.subtotal;
      }
    }

    // Clean discount fields without triggering another calculation
    this.cleanDiscountFields();

    // Update calculations after validation
    this.updateCalculations();
  }

  onDiscountTypeChange() {
    // Update calculations when discount type changes
    this.updateCalculations();
  }

  fetchDropdownData() {
    // Fetch contacts and payment terms
    this.quotesService.getDropdownData(1).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.contacts = response.data.contacts;
          this.paymentTerms = response.data.payment_terms;
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error fetching dropdown data:', error);
        if (error.status === 401) {
          alert('Authentication error: Please log in again.');
        } else {
          alert('Failed to load dropdown data. Please try again.');
        }
      }
    });

    // Fetch products from the new endpoint
    this.quotesService.getProducts(1).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.products = response.data.items || [];
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error fetching products:', error);
        // Don't show alert for products, just log the error
      }
    });
  }

  onCustomerChange() {
    if (this.formData.contact_id) {
      const contactId = parseInt(this.formData.contact_id, 10);
      this.quotesService.getContactDetails(contactId).subscribe({
        next: (response: any) => {
          if (response.success && response.data) {
            this.formData.customerEmail = response.data.email || '';
            this.formData.billingAddress = response.data.billing_address || '';
          }
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error fetching contact details:', error);
        }
      });
    }
  }

  showErrorMessage(message: string, errors?: { [key: string]: string[] }) {
    this.errorMessage = message;
    this.validationErrors = errors || {};
    this.showError = true;

    // Reset discount fields if there are validation errors
    if (errors && (errors['discount_type'] || errors['discount_method'])) {
      this.resetDiscountFields();
    }

    // Auto-hide error after 5 seconds
    setTimeout(() => {
      this.hideError();
    }, 5000);
  }

  private resetDiscountFields() {
    // Reset discount fields to safe values when validation fails
    this.formData.discountType = 0;
    this.formData.discountMethod = 'percentage';
    this.updateCalculations();
  }

  private cleanDiscountFields() {
    // Ensure discount fields are clean and valid before submission
    if (this.formData.discountType <= 0) {
      this.formData.discountType = 0;
      this.formData.discountMethod = 'percentage';
    } else {
      // Ensure discountType is a valid number
      this.formData.discountType = parseFloat(this.formData.discountType.toString()) || 0;

      // Ensure discountMethod is valid
      if (!['percentage', 'fixed'].includes(this.formData.discountMethod)) {
        this.formData.discountMethod = 'percentage';
      }

      // Apply validation rules
      this.validateDiscountType();

      // Ensure discountType is still valid after validation
      if (this.formData.discountType <= 0) {
        this.formData.discountType = 0;
        this.formData.discountMethod = 'percentage';
      }
    }

    // Don't call updateCalculations here to avoid infinite loop
  }

  hideError() {
    this.showError = false;
    this.errorMessage = '';
    this.validationErrors = {};
  }

  getFieldError(fieldName: string): string {
    return this.validationErrors[fieldName] ? this.validationErrors[fieldName][0] : '';
  }

  getValidationErrorKeys(): string[] {
    return Object.keys(this.validationErrors);
  }

  addLine() {
    this.lineItems.push({ description: '', productName: '', quantity: 1, rate: 1, gst: '0' });
    const newIndex = this.lineItems.length - 1;
    this.showProductSuggestions[newIndex] = false;
    this.filteredProducts[newIndex] = [];
    // Trigger calculations after adding line
    setTimeout(() => this.updateCalculations(), 0);
  }

  deleteLine(index: number) {
    if (this.lineItems.length > 1) {
      this.lineItems.splice(index, 1);
      this.updateCalculations();
    } else {
      alert('You must have at least one line item.');
    }
  }

  clearLines() {
    this.lineItems = [{ description: '', productName: '', quantity: 1, rate: 1, gst: '0' }];
    this.showProductSuggestions = [false];
    this.filteredProducts = [[]];
    // Trigger calculations after clearing lines
    setTimeout(() => this.updateCalculations(), 0);
  }

  // Method to recalculate all line items and totals
  recalculateAllItems() {
    this.lineItems.forEach((item, index) => {
      // Ensure all values are valid numbers
      if (isNaN(item.quantity) || item.quantity <= 0) {
        item.quantity = 1;
      }
      if (isNaN(item.rate) || item.rate < 0) {
        item.rate = 0;
      }
      if (isNaN(parseFloat(item.gst)) || parseFloat(item.gst) < 0) {
        item.gst = '0';
      }
    });

    // Update calculations
    this.updateCalculations();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (files) {
      this.addFiles(files);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    const files = event.dataTransfer?.files;
    if (files) {
      this.addFiles(files);
    }
  }

  private addFiles(files: FileList): void {
    const maxFileSize = 20 * 1024 * 1024; // 20MB per file
    const maxTotalSize = 100 * 1024 * 1024; // 100MB total limit
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/png',
      'image/jpeg',
      'image/gif',
      'text/plain'
    ];

    // Calculate current total size of attachments
    const currentTotalSize = this.formData.attachments.reduce((sum, file) => sum + file.size, 0);
    let newTotalSize = currentTotalSize;

    const newFiles: File[] = [];
    const errors: string[] = [];

    // Validate each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Check file size
      if (file.size > maxFileSize) {
        errors.push(`File "${file.name}" exceeds 20MB limit.`);
        continue;
      }

      // Check total size
      newTotalSize += file.size;
      if (newTotalSize > maxTotalSize) {
        errors.push(`Total attachment size exceeds 100MB limit.`);
        break;
      }

      // Check file type
      if (!allowedTypes.includes(file.type)) {
        errors.push(`File "${file.name}" is not an allowed type.`);
        continue;
      }

      newFiles.push(file);
    }

    // Add valid files to attachments
    if (newFiles.length > 0) {
      this.formData.attachments = [...this.formData.attachments, ...newFiles];
      console.log(`Added ${newFiles.length} file(s). Total attachments:`, this.formData.attachments.length);
    }

    // Display errors if any
    if (errors.length > 0) {
      this.showErrorMessage(errors.join(' '));
    }
  }

  removeAttachment(index?: number) {
    if (index !== undefined && index >= 0 && index < this.formData.attachments.length) {
      const removedFile = this.formData.attachments.splice(index, 1)[0];
      console.log(`Removed file: ${removedFile.name}`);
    } else {
      this.formData.attachments = [];
      console.log('Removed all attachments');
    }
  }

  getAttachmentInfo(file: File): string {
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    return `${file.name} (${sizeInMB} MB)`;
  }

  onProductNameChange(value: string, index: number) {
    // When dropdown selection changes, update the input field
    this.lineItems[index].productName = value;
  }

  // Handle quantity changes
  onQuantityChange(index: number) {
    // Ensure quantity is valid
    if (isNaN(this.lineItems[index].quantity) || this.lineItems[index].quantity <= 0) {
      this.lineItems[index].quantity = 1;
    }
    this.updateCalculations();
  }

  // Handle rate changes
  onRateChange(index: number) {
    // Ensure rate is valid
    if (isNaN(this.lineItems[index].rate) || this.lineItems[index].rate < 0) {
      this.lineItems[index].rate = 0;
    }
    this.updateCalculations();
  }

  // Handle GST changes
  onGstChange(index: number) {
    // Ensure GST is valid
    if (isNaN(parseFloat(this.lineItems[index].gst)) || parseFloat(this.lineItems[index].gst) < 0) {
      this.lineItems[index].gst = '0';
    }
    this.updateCalculations();
  }

  onProductNameInput(event: any, index: number) {
    // When text input changes, update the value
    this.lineItems[index].productName = event.target.value;
    this.filterProducts(event.target.value, index);
  }

  onProductNameFocus(index: number) {
    this.showProductSuggestions[index] = true;
    this.filterProducts(this.lineItems[index].productName, index);
  }

  onProductNameBlur(index: number) {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => {
      this.showProductSuggestions[index] = false;
    }, 200);
  }

  filterProducts(searchTerm: string, index: number) {
    if (!searchTerm) {
      this.filteredProducts[index] = this.products;
    } else {
      this.filteredProducts[index] = this.products.filter(product =>
        product.text.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
  }

  selectProduct(productName: string, index: number) {
    this.lineItems[index].productName = productName;
    this.showProductSuggestions[index] = false;
  }

  getTodayDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  validateDates(): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const quoteDate = new Date(this.formData.quoteDate);
    const validUntil = new Date(this.formData.validUntil);

    if (quoteDate < today) {
      alert('Quote date cannot be before today.');
      return false;
    }

    if (validUntil <= quoteDate) {
      alert('Valid until date must be greater than quote date.');
      return false;
    }

    return true;
  }

  calculateGstAmount(item: LineItem): number {
    const quantity = Number(item.quantity) || 0;
    const rate = Number(item.rate) || 0;
    const gstRate = Number(item.gst) || 0;

    const lineTotal = quantity * rate;
    const gstAmount = (lineTotal * gstRate) / 100;

    console.log(`GST calc: qty=${quantity}, rate=${rate}, gst%=${gstRate}, lineTotal=${lineTotal}, gstAmount=${gstAmount}`);

    return gstAmount;
  }

  getTotalGstAmount(): number {
    const total = this.lineItems.reduce((sum, item) => sum + this.calculateGstAmount(item), 0);
    return isNaN(total) ? 0 : total;
  }

  updateCalculations() {
    console.log('Starting calculations with lineItems:', this.lineItems);

    // Calculate subtotal (excluding GST)
    this.subtotal = 0;
    for (const item of this.lineItems) {
      const quantity = Number(item.quantity) || 0;
      const rate = Number(item.rate) || 0;
      const lineTotal = quantity * rate;
      this.subtotal += lineTotal;
      console.log(`Line item: qty=${quantity}, rate=${rate}, total=${lineTotal}`);
    }

    console.log('Calculated subtotal:', this.subtotal);

    // Calculate total GST amount
    let totalGstAmount = 0;
    for (const item of this.lineItems) {
      const gstAmount = this.calculateGstAmount(item);
      totalGstAmount += gstAmount;
      console.log(`GST for item:`, gstAmount);
    }

    console.log('Total GST amount:', totalGstAmount);

    this.taxableSubtotal = this.subtotal;

    // Calculate discount amount (simplified)
    this.discountAmount = 0;
    if (this.formData.discountType > 0) {
      if (this.formData.discountMethod === 'percentage') {
        this.discountAmount = this.subtotal * (this.formData.discountType / 100);
      } else if (this.formData.discountMethod === 'fixed') {
        this.discountAmount = this.formData.discountType;
      }
    }

    // Calculate total (subtotal - discount + GST)
    this.total = this.subtotal - this.discountAmount + totalGstAmount;

    // Balance due equals total
    this.balanceDue = this.total;

    // Ensure total is never negative
    if (this.total < 0) {
      this.total = 0;
      this.balanceDue = 0;
    }

    // Debug logging
    console.log('Final calculations:', {
      subtotal: this.subtotal,
      discountAmount: this.discountAmount,
      totalGstAmount: totalGstAmount,
      total: this.total,
      balanceDue: this.balanceDue
    });
  }

  saveForm() {
    // Validate dates
    if (!this.validateDates()) {
      return;
    }

    // Clean and validate discount fields before submission
    this.cleanDiscountFields();

    // Validate discount fields
    if (this.formData.discountType > 0) {
      // Ensure discountType is a valid number
      if (isNaN(this.formData.discountType) || this.formData.discountType < 0) {
        this.showErrorMessage('Discount amount must be a valid positive number.');
        return;
      }

      if (this.formData.discountMethod !== 'percentage' && this.formData.discountMethod !== 'fixed') {
        this.showErrorMessage('Invalid discount method. Please select either percentage or fixed amount.');
        return;
      }

      if (this.formData.discountMethod === 'percentage' && this.formData.discountType > 100) {
        this.showErrorMessage('Discount percentage cannot exceed 100%.');
        return;
      }

      if (this.formData.discountMethod === 'fixed' && this.formData.discountType > this.subtotal) {
        this.showErrorMessage('Fixed discount amount cannot exceed the subtotal.');
        return;
      }

      // Ensure discountType is within valid ranges
      if (this.formData.discountMethod === 'percentage' && this.formData.discountType > 100) {
        this.formData.discountType = 100;
      } else if (this.formData.discountMethod === 'fixed' && this.formData.discountType > this.subtotal) {
        this.formData.discountType = this.subtotal;
      }
    }

    // Add line items as array with new field names
    const items = this.lineItems.map(item => ({
      item_description: item.productName || '',
      item_quantity: item.quantity || 0,
      item_rate: item.rate || 0,
      item_gst_rate: parseFloat(item.gst) || 0
    }));

    // Ensure all line items have valid data
    items.forEach((item, index) => {
      if (!item.item_description || item.item_description.trim() === '') {
        item.item_description = 'Product/Service';
      }
      if (isNaN(item.item_quantity) || item.item_quantity <= 0) {
        item.item_quantity = 1;
      }
      if (isNaN(item.item_rate) || item.item_rate < 0) {
        item.item_rate = 0;
      }
      if (isNaN(item.item_gst_rate) || item.item_gst_rate < 0) {
        item.item_gst_rate = 0;
      }
    });

    // Create JSON payload to match the backend API requirements
    const payload = {
      company_id: 1,
      contact_id: parseInt(this.formData.contact_id, 10) || 1,
      quote_date: this.formData.quoteDate || this.getTodayDate(),
      expiration_date: this.formData.validUntil || this.getTodayDate(),
      items: items,
      discount_type: this.formData.discountType || 0,
      discount_method: this.formData.discountMethod || 'percentage',
      tax_rate: 0, // Set to 0 as in the user's example
      notes: this.formData.notes || 'Quote created via form submission',
      terms: this.paymentTerms.find(term => term.id === parseInt(this.formData.terms))?.text || 'Payment due within 30 days'
    };

    console.log('Sending payload:', payload);
    console.log('Payload JSON:', JSON.stringify(payload, null, 2));
    console.log('Form data values:', {
      contact_id: this.formData.contact_id,
      quoteDate: this.formData.quoteDate,
      validUntil: this.formData.validUntil,
      items: this.lineItems,
      discountType: this.formData.discountType,
      discountMethod: this.formData.discountMethod
    });
    // Validate payload before sending
    if (!payload.contact_id) {
      this.showErrorMessage('Please select a customer (contact_id is required).');
      return;
    }

    if (!payload.quote_date) {
      this.showErrorMessage('Please select a quote date.');
      return;
    }

    if (!payload.expiration_date) {
      this.showErrorMessage('Please select a valid until date.');
      return;
    }

    if (!payload.items || payload.items.length === 0) {
      this.showErrorMessage('At least one line item is required.');
      return;
    }

    // Validate that we have at least one valid item
    const validItems = payload.items.filter((item: any) =>
      item.item_description && item.item_description.trim() !== '' &&
      item.item_quantity > 0 && item.item_rate > 0
    );

    if (validItems.length === 0) {
      this.showErrorMessage('Please add at least one valid line item with product name, quantity, and rate.');
      return;
    }

    // Check if we have attachments and use the appropriate method
    if (this.formData.attachments && this.formData.attachments.length > 0) {
      console.log('Saving quote with attachments:', this.formData.attachments);
      console.log('Attachment details:');
      this.formData.attachments.forEach((file, index) => {
        console.log(`  Attachment ${index + 1}:`, {
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: new Date(file.lastModified).toISOString()
        });
      });

      console.log('API Request Details:');
      console.log('  - Endpoint: POST /api/quotes');
      console.log('  - Content-Type: multipart/form-data');
      console.log('  - Fields being sent:');
      console.log('    * company_id:', payload.company_id);
      console.log('    * contact_id:', payload.contact_id);
      console.log('    * quote_date:', payload.quote_date);
      console.log('    * expiration_date:', payload.expiration_date);
      console.log('    * items count:', payload.items.length);
      console.log('    * attachments count:', this.formData.attachments.length);

      this.quotesService.createQuoteWithAttachments(payload, this.formData.attachments).subscribe({
        next: (response) => {
          console.log('Quote with attachments saved successfully:', response);
          this.hideError(); // Clear any existing errors
          Swal.fire({
            icon: 'success',
            title: 'Quote Saved!',
            text: 'The quote has been saved successfully.',
            confirmButtonText: 'OK'
          });


          // Reset form after successful submission
          this.resetForm();
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error saving quote with attachments:', error);
          this.handleQuoteSubmissionError(error);
        }
      });
    } else {
      console.log('Saving quote without attachments');

      console.log('API Request Details:');
      console.log('  - Endpoint: POST /api/quotes');
      console.log('  - Content-Type: multipart/form-data');
      console.log('  - Fields being sent:');
      console.log('    * company_id:', payload.company_id);
      console.log('    * contact_id:', payload.contact_id);
      console.log('    * quote_date:', payload.quote_date);
      console.log('    * expiration_date:', payload.expiration_date);
      console.log('    * items count:', payload.items.length);
      console.log('    * attachments count: 0');

      this.quotesService.createQuote(payload).subscribe({
        next: (response) => {
          console.log('Quote saved successfully:', response);
          this.hideError(); // Clear any existing errors
          alert('Quote saved successfully!');

          // Reset form after successful submission
          this.resetForm();
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error saving quote:', error);
          this.handleQuoteSubmissionError(error);
        }
      });
    }
  }

  private handleQuoteSubmissionError(error: HttpErrorResponse): void {
    if (error.status === 401) {
      this.showErrorMessage('Authentication error: Please log in again.');
    } else if (error.status === 422) {
      // Validation error
      const errorResponse = error.error;
      if (errorResponse && errorResponse.errors) {
        this.showErrorMessage(errorResponse.message || 'Validation failed', errorResponse.errors);
      } else {
        this.showErrorMessage('Validation failed. Please check your input.');
      }
    } else if (error.status === 400) {
      // Bad request - often related to validation
      this.showErrorMessage('Invalid request. Please check your input and try again.');
    } else {
      this.showErrorMessage('Failed to save quote. Please try again.');
    }
  }

  private resetForm(): void {
    // Reset form data
    this.formData = {
      contact_id: '',
      customerEmail: '',
      sendLater: false,
      billingAddress: '',
      terms: '',
      quoteDate: '',
      validUntil: '',
      notes: '',
      attachments: [],
      discountMethod: 'percentage',
      discountType: 0,
    };

    // Reset line items
    this.lineItems = [{
      description: '',
      productName: '',
      quantity: 1,
      rate: 1,
      gst: '0'
    }];

    // Reset calculations
    this.subtotal = 0;
    this.taxableSubtotal = 0;
    this.discountAmount = 0;
    this.total = 0;
    this.balanceDue = 0;

    // Reset product suggestions
    this.showProductSuggestions = [false];
    this.filteredProducts = [[]];

    // Reset form validation state
    if (this.quoteForm) {
      this.quoteForm.resetForm();
    }

    console.log('Form reset successfully');
  }
}