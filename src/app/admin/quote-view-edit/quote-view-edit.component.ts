import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { QuotesService } from 'src/app/services/quotes.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

interface LineItem {
  id?: number;
  product_service?: string;
  description?: string;
  class?: string | null;
  quantity: any;
  rate: any;
  amount: any;
  gst: any;
}

interface QuoteData {
  id?: number;
  quote_number?: string;
  customer_name?: string;
  customer_id?: number;
  quote_date?: string;
  valid_until?: string;
  status?: string;
  customer_email?: string;
  billing_address?: string;
  message_on_quote?: string | null;
  notes?: string | null;
  items?: LineItem[];
  discount?: {
    amount: number;
    method?: string;
  };
  subtotal?: number;
  gst_total?: number;
  total?: number;
  paid_amount?: number;
  credits?: number;
  attachments?: any[];
}

interface Contact {
  id: number;
  'Contact Name': string;
}

@Component({
  selector: 'app-quote-view-edit',
  templateUrl: './quote-view-edit.component.html',
  styleUrls: ['./quote-view-edit.component.scss']
})
export class QuoteViewEditComponent implements OnInit {
  @ViewChild('quoteForm') quoteForm!: NgForm;
  
  quoteId: number | null = null;
  loading = false;
  isSubmitting = false;
  quoteData: QuoteData = {};
  contacts: Contact[] = [];
  
  subtotal = 0;
  discountAmount = 0;
  total = 0;
  balanceDue = 0;
  
  showError = false;
  errorMessage = '';
  validationErrors: { [key: string]: string[] } = {};

  // Image preview modal
  showImagePreview = false;
  selectedImageUrl: SafeUrl | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private quotesService: QuotesService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.quoteId = +params['id'];
      if (this.quoteId) {
        this.fetchDropdownData();
        this.loadQuote();
      }
    });
    
    if (!this.quoteData.discount) {
      this.quoteData.discount = {
        amount: 0,
        method: 'percentage'
      };
    }
  }

  loadQuote(): void {
    if (!this.quoteId) return;
    
    this.loading = true;
    this.quotesService.getQuoteById(this.quoteId).subscribe({
      next: (response) => {
        const data = response.data as any;
        this.quoteData = {
          id: data.quote_id,
          quote_number: data.quote_number,
          customer_name: data.customer_name,
          customer_id: data.customer_id,
          quote_date: typeof data.quote_date === 'string' ? data.quote_date : data.quote_date?.toISOString().split('T')[0],
          valid_until: data.expire_date,
          status: data.status,
          customer_email: data.email || '',
          billing_address: data.billing_address || '',
          message_on_quote: data.message_on_quote,
          notes: data.message_on_statement,
          items: (data.items || []).map((item: any) => ({
            id: item.item_id,
            product_service: item.product_service,
            description: item.description || '', // Map to API field, ensure non-null
            class: item.class,
            quantity: parseFloat(item.quantity) || 1, // Map to API field
            rate: parseFloat(item.rate) || 0, // Map to API field
            amount: parseFloat(item.amount) || 0,
            gst: parseFloat(item.gst) || 0
          })),
          discount: {
            amount: parseFloat(data.discount_amount) || parseFloat(data.discount_percent) || 0,
            method: data.discount_type === '0' ? 'percentage' : 'fixed' // Map numeric to string
          },
          subtotal: parseFloat(data.subtotal) || 0,
          gst_total: parseFloat(data.tax_amount) || 0,
          total: parseFloat(data.total) || 0,
          paid_amount: parseFloat(data.paid_amount) || 0,
          credits: parseFloat(data.credits) || 0,
          attachments: data.attachments || []
        };
        
        // Match customer_name to contact if customer_id is not provided
        if (this.quoteData.customer_name && !this.quoteData.customer_id && this.contacts.length > 0) {
          const matchedContact = this.contacts.find(c => c['Contact Name'] === this.quoteData.customer_name);
          if (matchedContact) {
            this.quoteData.customer_id = matchedContact.id;
            this.onCustomerChange();
          }
        }
        
        this.loading = false;
        this.updateCalculations();
      },
      error: (error) => {
        this.showError = true;
        this.errorMessage = 'Failed to load quote. Please try again.';
        this.loading = false;
      }
    });
  }

  fetchDropdownData(): void {
    this.quotesService.getDropdownData(1).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.contacts = response.data.contacts;
          // Match customer_name to contact if loaded after contacts
          if (this.quoteData.customer_name && !this.quoteData.customer_id) {
            const matchedContact = this.contacts.find(c => c['Contact Name'] === this.quoteData.customer_name);
            if (matchedContact) {
              this.quoteData.customer_id = matchedContact.id;
              this.onCustomerChange();
            }
          }
        }
      },
      error: (error) => {
        console.error('Error fetching dropdown data:', error);
      }
    });
  }

  onCustomerChange(): void {
    if (this.quoteData.customer_id) {
      const contactId = typeof this.quoteData.customer_id === 'string' 
        ? parseInt(this.quoteData.customer_id, 10) 
        : this.quoteData.customer_id;
      
      this.quotesService.getContactDetails(contactId).subscribe({
        next: (response: any) => {
          if (response.success && response.data) {
            this.quoteData.customer_email = response.data.email || this.quoteData.customer_email;
            this.quoteData.billing_address = response.data.billing_address || this.quoteData.billing_address;
            const selectedContact = this.contacts.find(c => c.id === contactId);
            if (selectedContact) {
              this.quoteData.customer_name = selectedContact['Contact Name'];
            }
          }
        },
        error: (error) => {
          console.error('Error fetching contact details:', error);
        }
      });
    }
  }

  openImagePreview(path: string): void {
    const baseUrl = 'https://cyrcle-api.hokma.co.in/';
    this.selectedImageUrl = this.sanitizer.bypassSecurityTrustUrl(baseUrl + path);
    this.showImagePreview = true;
  }

  closeImagePreview(): void {
    this.showImagePreview = false;
    this.selectedImageUrl = null;
  }

  goBack(): void {
    this.router.navigate(['/admin/quotes']);
  }

  addLineItem(): void {
    const items = this.quoteData.items || [];
    items.push({
      quantity: 1,
      rate: 0,
      amount: 0,
      gst: 0,
      description: '' // Initialize description to avoid undefined
    });
    this.quoteData.items = items;
    this.updateCalculations();
  }

  deleteLineItem(index: number): void {
    const items = this.quoteData.items || [];
    if (items.length > 1) {
      items.splice(index, 1);
      this.updateCalculations();
    }
  }

  updateLineItem(index: number): void {
    const items = this.quoteData.items || [];
    if (items[index]) {
      const item = items[index];
      item.amount = (item.quantity || 0) * (item.rate || 0);
      item.gst = item.amount * 0.1; // Assuming 10% GST
      this.updateCalculations();
    }
  }

  updateCalculations(): void {
    const items = this.quoteData.items || [];
    
    this.subtotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);
    this.quoteData.gst_total = items.reduce((sum, item) => sum + (item.gst || 0), 0);

    if (this.quoteData.discount?.amount && this.quoteData.discount.amount > 0) {
      this.discountAmount = this.quoteData.discount.method === 'percentage'
        ? this.subtotal * (this.quoteData.discount.amount / 100)
        : this.quoteData.discount.amount;
    } else {
      this.discountAmount = 0;
    }

    this.total = this.subtotal + (this.quoteData.gst_total || 0) - this.discountAmount;
    this.quoteData.subtotal = this.subtotal;
    this.quoteData.total = this.total;
    this.balanceDue = this.getBalanceDue();
  }

  onDiscountMethodChange(): void {
    if (this.quoteData.discount?.amount && this.quoteData.discount.amount > 0) {
      if (this.quoteData.discount.method === 'percentage' && this.quoteData.discount.amount > 100) {
        this.quoteData.discount.amount = 100;
      } else if (this.quoteData.discount.method === 'fixed' && this.quoteData.discount.amount > this.subtotal) {
        this.quoteData.discount.amount = this.subtotal;
      }
    }
    this.updateCalculations();
  }

  validateDiscountInput(): void {
    if (this.quoteData.discount?.amount && this.quoteData.discount.amount > 0) {
      if (this.quoteData.discount.method === 'percentage' && this.quoteData.discount.amount > 100) {
        this.quoteData.discount.amount = 100;
      } else if (this.quoteData.discount.method === 'fixed' && this.quoteData.discount.amount > this.subtotal) {
        this.quoteData.discount.amount = this.subtotal;
      }
    }
    this.updateCalculations();
  }

  validateForm(): boolean {
    if (!this.quoteForm.valid) {
      this.showErrorMessage('Please fill in all required fields.');
      return false;
    }

    const items = this.quoteData.items || [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.description || item.quantity == null || item.rate == null) {
        this.showErrorMessage(`Line item ${i + 1} is missing required fields: description, quantity, or rate.`);
        return false;
      }
    }
    return true;
  }

  saveQuote(): void {
    if (!this.quoteId || !this.validateForm()) return;

    this.isSubmitting = true;
    
    const updateData = {
      quote_id: this.quoteData.id,
      quote_number: this.quoteData.quote_number,
      customer_name: this.quoteData.customer_name,
      customer_id: this.quoteData.customer_id,
      quote_date: this.quoteData.quote_date,
      expire_date: this.quoteData.valid_until,
      status: this.quoteData.status,
      email: this.quoteData.customer_email,
      billing_address: this.quoteData.billing_address,
      message_on_quote: this.quoteData.message_on_quote,
      message_on_statement: this.quoteData.notes,
      items: (this.quoteData.items || []).map(item => ({
      item_id: item.id,
      product_service: item.product_service || '',
      description: item.description || '', // Ensure this matches API
      class: item.class || null,
      quantity: parseFloat(item.quantity) || 1, // Changed from item.quantity
      rate: parseFloat(item.rate) || 0, // Changed from item.rate
      amount: parseFloat(item.amount) || 0,
      gst: parseFloat(item.gst) || 0
    })),

    
      discount_type: this.quoteData.discount?.method === 'percentage' ? 0 : 1, // Send as number
      discount_amount: this.quoteData.discount?.amount || 0,
      subtotal: this.quoteData.subtotal,
      tax_amount: this.quoteData.gst_total,
      total: this.quoteData.total
    };

    this.quotesService.updateQuote(this.quoteId, updateData).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        alert('Quote updated successfully!');
        this.goBack();
      },
      error: (error) => {
        this.isSubmitting = false;
        this.showError = true;
        this.errorMessage = 'Failed to update quote. Please try again.';
        if (error.error?.errors) {
          this.validationErrors = error.error.errors;
        }
      }
    });
  }

  showErrorMessage(message: string, errors?: { [key: string]: string[] }): void {
    this.errorMessage = message;
    this.validationErrors = errors || {};
    this.showError = true;
    setTimeout(() => this.hideError(), 5000);
  }

  hideError(): void {
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

  getSubtotal(): number {
    return this.quoteData.subtotal || 0;
  }

  getGstTotal(): number {
    return this.quoteData.gst_total || 0;
  }

  getTotal(): number {
    return this.quoteData.total || 0;
  }

  getBalanceDue(): number {
    const total = this.getTotal();
    const paidAmount = this.quoteData.paid_amount || 0;
    const credits = this.quoteData.credits || 0;
    return total - paidAmount - credits;
  }
}