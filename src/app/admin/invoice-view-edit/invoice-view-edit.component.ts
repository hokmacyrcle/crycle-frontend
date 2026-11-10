import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { InvoiceService } from 'src/app/services/invoice.service';
import { DomSanitizer } from '@angular/platform-browser';

interface LineItem {
  description: string;
  productName: string;
  quantity: number;
  rate: number;
  gst: string;
}

interface FormData {
  customer: string;
  customerEmail: string;
  sendLater: boolean;
  billingAddress: string;
  terms: string;
  invoiceDate: string;
  dueDate: string;
  messageOnInvoice: string;
  attachments: File[];
  discountType: string;
  discountValue: number;
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

interface PaymentSummary {
  total_paid: string;
  total_due: number;
  payment_count: number;
  last_payment_date: string;
}

interface Payment {
  id: number | null;
  date: string;
  amount: string;
  method: string;
  reference: string;
  notes: string;
  attachments?: Array<{
    id: number;
    filename: string;
    path: string;
  }>;
}

interface InvoiceData {
  invoice_id: number;
  invoice_date: string;
  invoice_due_date: string;
  invoice_status: string;
  invoice_payment_status: string;
  invoice_amount: string;
  invoice_total: string;
  invoice_paid_amount: string;
  company_id: number;
  customer: {
    id: number;
    name: string;
    email: string;
    phone: string;
    type: string;
    company_name: string;
  };
  sent_to: number;
  billing_address: string;
  payment_term_id: number;
  terms: string | null;
  subtotal: string;
  discount: {
    type: string;
    method: string;
    amount: string;
    percentage: string;
  };
  tax: {
    rate: string;
    amount: string;
  };
  gst_amount: string;
  total: string;
  balance_due: number;
  payment_summary?: PaymentSummary;
  payments?: Payment[];
  items_list: Array<{
    id: number;
    description: string;
    quantity: number;
    rate: string;
    cost: string;
    gst: string;
    total: string;
  }>;
  notes: string | null;
  message_on_invoice: string | null;
  message_on_statement: string | null;
  attachments: any[];
  created_at: string;
  updated_at: string;
}

@Component({
  selector: 'app-invoice-view-edit',
  templateUrl: './invoice-view-edit.component.html',
  styleUrls: ['./invoice-view-edit.component.scss']
})
export class InvoiceViewEditComponent implements OnInit {
invoiceId: number = 0;
  isEditMode = false;
  isLoading = true;
  originalInvoiceData: InvoiceData | null = null;

  // Payment popup properties
  showPaymentPopup = false;

  // Computed properties for payment summary
  get totalPaid(): number {
    if (this.originalInvoiceData?.payment_summary) {
      return parseFloat(this.originalInvoiceData.payment_summary.total_paid) || 0;
    }
    return 0;
  }

  get paymentSummary(): PaymentSummary | null {
    return this.originalInvoiceData?.payment_summary || null;
  }

  formData: FormData = {
    customer: '',
    customerEmail: '',
    sendLater: false,
    billingAddress: '',
    terms: '',
    invoiceDate: '',
    dueDate: '',
    messageOnInvoice: '',
    attachments: [],
    discountType: 'percent',
    discountValue: 0,
  };

  lineItems: LineItem[] = [
    {
      description: '',
      productName: '',
      quantity: 1,
      rate: 0,
      gst: ''
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

  invoiceAttachmentUrl: any;
  showImageModal = false; // New property to control modal visibility
  selectedAttachmentUrl: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private invoiceService: InvoiceService, 
    private sanitizer: DomSanitizer
  ) { }

  private initializeDiscountFields() {
    // Ensure discountValue is a number
    if (typeof this.formData.discountValue !== 'number' || isNaN(this.formData.discountValue)) {
      this.formData.discountValue = 0;
    }

    // Ensure discountType is valid
    if (!['percent', 'value'].includes(this.formData.discountType)) {
      this.formData.discountType = 'percent';
    }

    // Ensure discountValue is within valid ranges
    if (this.formData.discountValue < 0) {
      this.formData.discountValue = 0;
    }

    // Ensure discountValue is within method-specific limits
    if (this.formData.discountValue > 0) {
      if (this.formData.discountType === 'percent' && this.formData.discountValue > 100) {
        this.formData.discountValue = 100;
      }
    }
  }

  openImageModal() {
    this.showImageModal = true;
  }

  closeImageModal() {
    this.showImageModal = false;
    this.selectedAttachmentUrl = null;
  }

  private validateDiscountType() {
    if (this.formData.discountValue > 0) {
      if (this.formData.discountType === 'percent' && this.formData.discountValue > 100) {
        this.formData.discountValue = 100; // Cap at 100%
      } else if (this.formData.discountType === 'value' && this.formData.discountValue > this.subtotal) {
        this.formData.discountValue = this.subtotal; // Cap at subtotal
      }
    }

    // Ensure discountValue is never negative
    if (this.formData.discountValue < 0) {
      this.formData.discountValue = 0;
    }

    // Ensure discountValue is a valid number
    if (isNaN(this.formData.discountValue)) {
      this.formData.discountValue = 0;
    }
  }

  private cleanDiscountFields() {
    // Ensure discount fields are clean and valid before submission
    if (this.formData.discountValue <= 0) {
      this.formData.discountValue = 0;
      this.formData.discountType = 'percent';
    } else {
      // Ensure discountValue is a valid number
      this.formData.discountValue = parseFloat(this.formData.discountValue.toString()) || 0;

      // Ensure discountType is valid
      if (!['percent', 'value'].includes(this.formData.discountType)) {
        this.formData.discountType = 'percent';
      }

      // Apply validation rules
      this.validateDiscountType();

      // Ensure discountValue is still valid after validation
      if (this.formData.discountValue <= 0) {
        this.formData.discountValue = 0;
        this.formData.discountType = 'percent';
      }
    }
  }

  onDiscountMethodChange() {
    // Reset discount value when method changes to prevent invalid values
    if (this.formData.discountValue > 0) {
      if (this.formData.discountType === 'percent' && this.formData.discountValue > 100) {
        this.formData.discountValue = 0;
      } else if (this.formData.discountType === 'value' && this.formData.discountValue > this.subtotal) {
        this.formData.discountValue = 0;
      }
    }

    // Update calculations after method change
    this.updateCalculations();
  }

  onDiscountValueChange() {
    // Validate and update calculations when discount value changes
    this.validateDiscountInput();

    // Update calculations after value change
    this.updateCalculations();
  }

  validateDiscountInput() {
    // Ensure discount value is a valid number
    if (this.formData.discountValue < 0) {
      this.formData.discountValue = 0;
    }

    // Apply validation rules
    if (this.formData.discountValue > 0) {
      if (this.formData.discountType === 'percent' && this.formData.discountValue > 100) {
        this.formData.discountValue = 100;
      } else if (this.formData.discountType === 'value' && this.formData.discountValue > this.subtotal) {
        this.formData.discountValue = this.subtotal;
      }
    }
  }

  private resetDiscountFields() {
    // Reset discount fields to safe values when validation fails
    this.formData.discountValue = 0;
    this.formData.discountType = 'percent';
    this.updateCalculations();
  }

  ngOnInit() {
    this.invoiceId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.invoiceId) {
      this.loadInvoice();
    }
    this.fetchDropdownData();
    this.updateCalculations();
    // Initialize arrays for the first line item
    this.showProductSuggestions = [false];
    this.filteredProducts = [[]];

    // Ensure discount fields are properly initialized
    this.initializeDiscountFields();
  }

  loadInvoice() {
    this.isLoading = true;
    this.invoiceService.getInvoiceById(this.invoiceId).subscribe({
      next: (response: any) => {
        let invoiceData = null;
        if (response.status && response.data) {
          invoiceData = response.data;
        } else if (response.success && response.data) {
          invoiceData = response.data;
        } else if (response.data) {
          invoiceData = response.data;
        } else if (response) {
          invoiceData = response;
        }

        if (invoiceData) {
          this.originalInvoiceData = invoiceData;
          this.populateFormFromInvoice(invoiceData);

          // Handle invoice_attachment (if still needed separately)
          if (invoiceData.invoice_attachment) {
            const base64 = invoiceData.invoice_attachment;
            const mimeType = base64.startsWith('iVBORw0KGgo') ? 'image/png' : 'image/jpeg';
            this.invoiceAttachmentUrl = this.sanitizer.bypassSecurityTrustUrl(
              `data:${mimeType};base64,${base64}`
            );
          } else {
            this.invoiceAttachmentUrl = null;
          }
        } else {
          this.showErrorMessage('No invoice data found in the response.');
          this.createSampleInvoice();
        }
        this.isLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error loading invoice:', error);
        this.showErrorMessage('Failed to load invoice. Please try again.');
        this.isLoading = false;
        this.createSampleInvoice();
      }
    });
  }

  createSampleInvoice() {
    console.log('Creating sample invoice for testing');
    const sampleInvoice: InvoiceData = {
      invoice_id: this.invoiceId,
      invoice_date: new Date().toISOString(),
      invoice_due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      invoice_status: 'Draft',
      invoice_payment_status: 'Unpaid',
      invoice_amount: '1000.00',
      invoice_total: '1100.00',
      invoice_paid_amount: '0.00',
      company_id: 1,
      customer: {
        id: 1,
        name: 'Sample Customer',
        email: 'sample@example.com',
        phone: 'N/A',
        type: 'Company',
        company_name: 'Sample Company'
      },
      sent_to: 1,
      billing_address: 'Sample Address',
      payment_term_id: 1,
      terms: 'Net 30',
      subtotal: '1000.00',
      discount: {
        type: '0.00',
        method: 'percentage',
        amount: '0.00',
        percentage: '0.00'
      },
      tax: {
        rate: '0.00',
        amount: '0.00'
      },
      gst_amount: '100.00',
      total: '1100.00',
      balance_due: 1100,
      items_list: [
        {
          id: 1,
          description: 'Sample Product',
          quantity: 1,
          rate: '1000.00',
          cost: '1000.00',
          gst: '100.00',
          total: '1100.00'
        }
      ],
      notes: 'Sample invoice for testing',
      message_on_invoice: 'Sample message',
      message_on_statement: 'Sample statement',
      attachments: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.originalInvoiceData = sampleInvoice;
    this.populateFormFromInvoice(sampleInvoice);
  }

  populateFormFromInvoice(invoice: InvoiceData) {
    console.log('Populating form with invoice data:', invoice);

    // Populate form data from the new API structure
    this.formData.customer = invoice.sent_to.toString();
    this.formData.invoiceDate = invoice.invoice_date.split('T')[0]; // Extract date part from ISO string
    this.formData.dueDate = invoice.invoice_due_date.split('T')[0]; // Extract date part from ISO string
    // this.formData.terms = invoice.payment_term_id.toString();
    this.formData.messageOnInvoice = invoice.message_on_invoice || invoice.notes || '';
    this.formData.billingAddress = invoice.billing_address || '';
    this.formData.customerEmail = invoice.customer?.email || '';

    console.log('Form data populated:', this.formData);

    // Set discount values from the new structure
    if (invoice.discount && parseFloat(invoice.discount.amount) > 0) {
      this.formData.discountValue = parseFloat(invoice.discount.percentage);
      this.formData.discountType = invoice.discount.method === 'percentage' ? 'percent' : 'value';
    }

    // Populate line items from items_list
    if (invoice.items_list && invoice.items_list.length > 0) {
      console.log('Processing line items:', invoice.items_list);
      this.lineItems = invoice.items_list.map(item => ({
        description: item.description || '',
        productName: item.description || '', // Using description as product name since there's no separate product field
        quantity: item.quantity || 1,
        rate: parseFloat(item.rate) || 0,
        gst: (parseFloat(item.gst) / parseFloat(item.cost) * 100).toString() // Calculate GST percentage
      }));
      console.log('Line items populated:', this.lineItems);
    } else {
      console.log('No line items found, using default');
      // Initialize with at least one empty line item
      this.lineItems = [{ description: '', productName: '', quantity: 1, rate: 0, gst: '' }];
    }

    // Initialize arrays for line items
    this.showProductSuggestions = new Array(this.lineItems.length).fill(false);
    this.filteredProducts = new Array(this.lineItems.length).fill([]);

    // Update calculations with the actual invoice data
    this.subtotal = parseFloat(invoice.subtotal) || 0;
    this.total = parseFloat(invoice.total) || 0;
    this.balanceDue = invoice.balance_due || 0;

    // Don't call onCustomerChange since we already have the customer details
    this.updateCalculations();
  }

  fetchDropdownData() {
    // Fetch contacts and payment terms
    this.invoiceService.getDropdownData(1).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.contacts = response.data.contacts;
          this.paymentTerms = response.data.payment_terms;
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error fetching dropdown data:', error);
        if (error.status === 401) {
          this.showErrorMessage('Authentication error: Please log in again.');
        } else {
          this.showErrorMessage('Failed to load dropdown data. Please try again.');
        }
      }
    });

    // Fetch products from the new endpoint
    this.invoiceService.getProducts(1).subscribe({
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
    if (this.formData.customer) {
      const contactId = parseInt(this.formData.customer, 10);
      this.invoiceService.getContactDetails(contactId).subscribe({
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
    this.lineItems.push({ description: '', productName: '', quantity: 1, rate: 0, gst: '' });
    const newIndex = this.lineItems.length - 1;
    this.showProductSuggestions[newIndex] = false;
    this.filteredProducts[newIndex] = [];
    this.updateCalculations();
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
    this.lineItems = [{ description: '', productName: '', quantity: 1, rate: 0, gst: '' }];
    this.showProductSuggestions = [false];
    this.filteredProducts = [[]];
    this.updateCalculations();
  }

  onFileSelected(event: any) {
    const files = event.target.files;
    this.addFiles(files);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    const files = event.dataTransfer?.files;
    if (files) {
      this.addFiles(files);
    }
  }

  private addFiles(files: FileList | null) {
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size <= 20 * 1024 * 1024) { // 20MB limit
          this.formData.attachments.push(file);
        } else {
          alert(`File ${file.name} is too large. Maximum size is 20MB.`);
        }
      }
    }
  }

  removeAttachment(index: number) {
    this.formData.attachments.splice(index, 1);
  }

  onProductNameInput(event: any, index: number) {
    const value = event.target.value;
    this.lineItems[index].productName = value;
    this.filterProducts(value, index);
    this.updateCalculations();
  }

  onProductNameFocus(index: number) {
    this.showProductSuggestions[index] = true;
    if (this.lineItems[index].productName) {
      this.filterProducts(this.lineItems[index].productName, index);
    }
  }

  onProductNameBlur(index: number) {
    // Delay hiding to allow click on suggestions
    setTimeout(() => {
      this.showProductSuggestions[index] = false;
    }, 200);
  }

  filterProducts(value: string, index: number) {
    if (!value) {
      this.filteredProducts[index] = [];
      return;
    }

    const filterValue = value.toLowerCase();
    this.filteredProducts[index] = this.products.filter(product =>
      product.text.toLowerCase().includes(filterValue)
    );
  }

  selectProduct(productText: string, index: number) {
    this.lineItems[index].productName = productText;
    this.showProductSuggestions[index] = false;
    this.updateCalculations();
  }

  getTodayDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  validateDates(): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const invoiceDate = new Date(this.formData.invoiceDate);
    const dueDate = new Date(this.formData.dueDate);

    if (invoiceDate < today) {
      alert('Invoice date cannot be before today.');
      return false;
    }

    if (dueDate <= invoiceDate) {
      alert('Due date must be greater than invoice date.');
      return false;
    }

    return true;
  }

  calculateGstAmount(item: LineItem): number {
    if (!item.gst || item.gst === '') return 0;
    const gstRate = parseFloat(item.gst);
    const lineTotal = item.quantity * item.rate;

    // Ensure values are valid numbers
    if (isNaN(gstRate) || isNaN(lineTotal)) {
      return 0;
    }

    // GST is always added on top of the rate
    return (lineTotal * gstRate) / 100;
  }

  getTotalGstAmount(): number {
    const total = this.lineItems.reduce((sum, item) => sum + this.calculateGstAmount(item), 0);
    return isNaN(total) ? 0 : total;
  }

  updateCalculations() {
    // Calculate subtotal (excluding GST)
    this.subtotal = this.lineItems.reduce((sum, item) => sum + (item.quantity * item.rate), 0);

    // Ensure subtotal is a valid number
    this.subtotal = isNaN(this.subtotal) ? 0 : this.subtotal;

    // Calculate total GST amount
    const totalGstAmount = this.lineItems.reduce((sum, item) => sum + this.calculateGstAmount(item), 0);

    this.taxableSubtotal = this.subtotal;

    // Calculate discount amount
    if (this.formData.discountValue > 0 && this.formData.discountValue <= (this.formData.discountType === 'percent' ? 100 : this.subtotal)) {
      if (this.formData.discountType === 'percent') {
        this.discountAmount = this.subtotal * (this.formData.discountValue / 100);
      } else if (this.formData.discountType === 'value') {
        this.discountAmount = this.formData.discountValue;
      } else {
        this.discountAmount = 0;
      }
    } else {
      this.discountAmount = 0;
    }

    // Ensure discount amount is a valid number
    this.discountAmount = isNaN(this.discountAmount) ? 0 : this.discountAmount;

    // Calculate total (subtotal - discount + GST)
    this.total = this.subtotal - this.discountAmount + totalGstAmount;

    // Balance due equals total
    this.balanceDue = this.total;

    // Ensure all values are valid numbers
    this.subtotal = isNaN(this.subtotal) ? 0 : this.subtotal;
    this.discountAmount = isNaN(this.discountAmount) ? 0 : this.discountAmount;
    this.total = isNaN(this.total) ? 0 : this.total;
    this.balanceDue = isNaN(this.balanceDue) ? 0 : this.balanceDue;

    // Ensure total is never negative
    if (this.total < 0) {
      this.total = 0;
      this.balanceDue = 0;
    }
  }

  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
  }

  saveForm() {
    // Validate dates
    if (!this.validateDates()) {
      return;
    }

    // Clean and validate discount fields before submission
    this.cleanDiscountFields();

    // Validate discount fields
    if (this.formData.discountValue > 0) {
      // Ensure discountValue is a valid number
      if (isNaN(this.formData.discountValue) || this.formData.discountValue < 0) {
        this.showErrorMessage('Discount amount must be a valid positive number.');
        return;
      }

      if (this.formData.discountType !== 'percent' && this.formData.discountType !== 'value') {
        this.showErrorMessage('Invalid discount method. Please select either percentage or fixed amount.');
        return;
      }

      if (this.formData.discountType === 'percent' && this.formData.discountValue > 100) {
        this.showErrorMessage('Discount percentage cannot exceed 100%.');
        return;
      }

      if (this.formData.discountType === 'value' && this.formData.discountValue > this.subtotal) {
        this.showErrorMessage('Fixed discount amount cannot exceed the subtotal.');
        return;
      }

      // Ensure discountValue is within valid ranges
      if (this.formData.discountType === 'percent' && this.formData.discountValue > 100) {
        this.formData.discountValue = 100;
      } else if (this.formData.discountType === 'value' && this.formData.discountValue > this.subtotal) {
        this.formData.discountValue = this.subtotal;
      }
    }

    const payload = {
      company_id: 1,
      sent_to: parseInt(this.formData.customer, 10) || 1,
      invoice_date: this.formData.invoiceDate,
      invoice_due_date: this.formData.dueDate,
      payment_term_id: parseInt(this.formData.terms, 10) || 1,
      discount_type: this.formData.discountValue > 0 ? this.formData.discountValue.toString() : '0',
      discount_method: this.formData.discountValue > 0 ? (this.formData.discountType === 'percent' ? 'percentage' : 'fixed') : 'percentage',
      discount_value: this.formData.discountValue > 0 ? this.formData.discountValue.toString() : '0',
      items: this.lineItems.map(item => ({
        item_description: item.description || '',
        item_product_name: item.productName || '',
        item_quantity: item.quantity || 0,
        item_rate: item.rate || 0,
        item_gst_rate: parseFloat(item.gst) || 0
      })),
      notes: this.formData.messageOnInvoice || '',
      terms: this.paymentTerms.find(term => term.id === parseInt(this.formData.terms))?.text || ''
    };

    // Validate line items before sending
    const validItems = payload.items.filter(item =>
      item.item_product_name && item.item_product_name.trim() !== '' &&
      item.item_quantity > 0 && item.item_rate > 0
    );

    if (validItems.length === 0) {
      this.showErrorMessage('Please add at least one valid line item with product name, quantity, and rate.');
      return;
    }

    // Ensure at least one line item has a valid product name
    const hasValidProductNames = payload.items.some(item =>
      item.item_product_name && item.item_product_name.trim() !== '' && item.item_product_name !== 'Product/Service'
    );

    if (!hasValidProductNames) {
      this.showErrorMessage('Please add at least one line item with a valid product or service name.');
      return;
    }

    // Validate line items have valid quantities and rates
    const invalidLineItems = payload.items.filter(item =>
      !item.item_product_name || item.item_product_name.trim() === '' ||
      isNaN(item.item_quantity) || item.item_quantity <= 0 ||
      isNaN(item.item_rate) || item.item_rate < 0
    );

    if (invalidLineItems.length > 0) {
      this.showErrorMessage('Please ensure all line items have valid product names, quantities, and rates.');
      return;
    }

    // Sanitize line items before sending
    payload.items.forEach((item, index) => {
      if (isNaN(item.item_quantity) || item.item_quantity < 0) {
        item.item_quantity = 0;
      }
      if (isNaN(item.item_rate) || item.item_rate < 0) {
        item.item_rate = 0;
      }
      if (isNaN(item.item_gst_rate) || item.item_gst_rate < 0) {
        item.item_gst_rate = 0;
      }

      // Ensure all values are valid numbers
      item.item_quantity = Math.max(0, item.item_quantity);
      item.item_rate = Math.max(0, item.item_rate);
      item.item_gst_rate = Math.max(0, item.item_gst_rate);

      // Ensure all values are within reasonable limits
      if (item.item_quantity > 999999) {
        item.item_quantity = 999999;
      }
      if (item.item_rate > 999999.99) {
        item.item_rate = 999999.99;
      }
      if (item.item_gst_rate > 100) {
        item.item_gst_rate = 100;
      }
    });

    // Ensure all required fields are present
    if (!this.formData.customer) {
      this.showErrorMessage('Please select a customer.');
      return;
    }

    if (!this.formData.invoiceDate) {
      this.showErrorMessage('Please select an invoice date.');
      return;
    }

    if (!this.formData.dueDate) {
      this.showErrorMessage('Please select a due date.');
      return;
    }

    if (!this.formData.terms) {
      this.showErrorMessage('Please select payment terms.');
      return;
    }

    // Final validation and formatting of discount fields
    if (this.formData.discountValue > 0) {
      // Ensure discount_type is sent as a number string
      payload.discount_type = this.formData.discountValue.toString();
      // Ensure discount_method is one of the valid values
      if (['percent', 'value'].includes(this.formData.discountType)) {
        payload.discount_method = this.formData.discountType === 'percent' ? 'percentage' : 'fixed';
      } else {
        payload.discount_method = 'percentage'; // Default to percentage if invalid
      }
      payload.discount_value = this.formData.discountValue.toString();
    } else {
      // Ensure discount fields are properly formatted when no discount
      payload.discount_type = '0';
      payload.discount_method = 'percentage';
      payload.discount_value = '0';
    }

    if (this.isEditMode) {
      // Update existing invoice
      this.invoiceService.updateinvoice(this.invoiceId, payload).subscribe({
        next: (response) => {
          console.log('Invoice updated successfully:', response);
          this.hideError();
          alert('Invoice updated successfully!');
          this.isEditMode = false;
          this.loadInvoice(); // Reload to get updated data
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error updating invoice:', error);

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
            this.showErrorMessage('Failed to update invoice. Please try again.');
          }
        }
      });
    } else {
      // Create new invoice (shouldn't happen in this component, but keeping for safety)
      this.invoiceService.saveInvoice(payload).subscribe({
        next: (response) => {
          console.log('Invoice saved successfully:', response);
          this.hideError();
          alert('Invoice saved successfully!');
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error saving invoice:', error);

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
            this.showErrorMessage('Failed to save invoice. Please try again.');
          }
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['admin/getallinvoice']);
  }

  // Payment popup methods
  openPaymentPopup() {
    this.showPaymentPopup = true;
  }

  closePaymentPopup() {
    this.showPaymentPopup = false;
  }

  onPaymentRecorded(paymentData: any) {
    console.log('Payment recorded:', paymentData);
    // Optionally reload invoice data or show success message
    this.loadInvoice();
  }

  // Attachment handling methods
  getImageAttachments(attachments: any[]): any[] {
    if (!attachments || !Array.isArray(attachments)) {
      return [];
    }
    return attachments.filter(attachment => this.isImageFile(attachment.filename || attachment.path));
  }

  getNonImageAttachments(attachments: any[]): any[] {
    if (!attachments || !Array.isArray(attachments)) {
      return [];
    }
    return attachments.filter(attachment => !this.isImageFile(attachment.filename || attachment.path));
  }

  isImageFile(filename: string | undefined): boolean {
    if (!filename) return false;
    const extension = filename.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension || '');
  }

getAttachmentUrl(attachment: any): string {
  if (!attachment || !attachment.path) {
    console.log('Attachment or path is missing:', attachment);
    return '';
  }

  // If path is already a complete URL, return it as-is
  if (attachment.path.startsWith('http://') || attachment.path.startsWith('https://')) {
    console.log('Using full URL:', attachment.path);
    return attachment.path;
  }

  // Construct the full URL using the base API URL
  const baseUrl = 'https://absdev-api.hokma.xyz/public'; // Update this if using environment variables
  const fullUrl = `${baseUrl}/${attachment.path}`;
  console.log('Constructed URL:', fullUrl);
  return fullUrl;
}


  openAttachment(attachment: any): void {
    const url = this.getAttachmentUrl(attachment);
    if (this.isImageFile(attachment.filename || attachment.path)) {
      // For images, open in modal
      this.selectedAttachmentUrl = url;
      this.showImageModal = true;
    } else {
      // For non-image files, trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = attachment.filename || 'attachment';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  openNonImageAttachments(attachments: any[]): void {
    const nonImageAttachments = this.getNonImageAttachments(attachments);
    nonImageAttachments.forEach(attachment => {
      const url = this.getAttachmentUrl(attachment);
      const link = document.createElement('a');
      link.href = url;
      link.download = attachment.filename || 'attachment';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }

  onImageError(event: any): void {
    // Handle image loading errors by hiding the broken image
    const imgElement = event.target as HTMLImageElement;
    imgElement.style.display = 'none';
  }
}