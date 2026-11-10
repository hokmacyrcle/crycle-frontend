import { Component, ViewChild, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { InvoiceService } from 'src/app/services/invoice.service';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import Swal from 'sweetalert2';

interface LineItem {
  description: string;
  quantity: number;
  rate: number;
  gst: string;
  gstAmount?: number;
}

interface FormData {
  customer: string;
  terms: string;
  invoiceDate: string;
  dueDate: string;
  messageOnInvoice: string;
  discountType: string;
  discountValue: number;
  salesTaxRate: number;
}

interface Contact {
  id: number;
  'Contact Name': string;
}

interface ContactDetails {
  id: number;
  name: string;
  type: string;
  email: string;
  phone: string;
  billing_address: string;
  address_components: {
    line_1: string;
    line_2: string;
    line_3: string;
    city: string;
    state: string;
    post_code: string;
    country: string;
  };
}

interface PaymentTerm {
  id: number;
  text: string;
  description: string;
}

interface Item {
  id: string;
  text: string;
}

interface Attachment {
  file: File;
  url: SafeUrl;
  fileName: string;
  isImage: boolean;
}

// interface Attachment {
//   base64: string;
//   url: SafeUrl;
//   fileName: string;
// }

@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.scss']
})
export class InvoiceComponent implements OnInit {
  attachments: Attachment[] = [];
  @ViewChild('invoiceForm') invoiceForm!: NgForm;
  invoiceAttachment: string | null = null;
  formData: FormData = {
    customer: '',
    terms: '',
    invoiceDate: new Date().toISOString().split('T')[0], // Set to today
    dueDate: '',
    messageOnInvoice: '',
    discountType: 'percent',
    discountValue: 0,
    salesTaxRate: 0,
  };

  lineItems: LineItem[] = [
    {
      description: '',
      quantity: 1,
      rate: 0,
      gst: '',
      gstAmount: 0
    }
  ];

  contacts: Contact[] = [];
  paymentTerms: PaymentTerm[] = [];
  items: Item[] = [];
  contactDetails: ContactDetails | null = null;

  subtotal = 0;
  totalGST = 0;
  subtotalWithGST = 0;
  taxableSubtotal = 0;
  discountAmount = 0;
  total = 0;
  balanceDue = 0;
  private invoiceId: number | null = null;
  minInvoiceDate: string = new Date().toISOString().split('T')[0]; // For disabling past dates

  constructor(
    private invoiceService: InvoiceService,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    this.fetchDropdownData();
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.invoiceId = +id;
        this.fetchInvoice(this.invoiceId);
      } else {
        this.updateCalculations();
      }
    });
  }

  fetchDropdownData() {
    this.invoiceService.getDropdownData(1).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.contacts = response.data.contacts;
          this.paymentTerms = response.data.payment_terms;
          this.items = response.data.items;
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
  }

  fetchContactDetails() {
    if (this.formData.customer) {
      this.invoiceService.getContactDetails(parseInt(this.formData.customer)).subscribe({
        next: (response: any) => {
          if (response.success) {
            this.contactDetails = response.data;
          }
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error fetching contact details:', error);
          this.contactDetails = null;
          if (error.status === 401) {
            alert('Authentication error: Please log in again.');
          } else {
            alert('Failed to load contact details. Please try again.');
          }
        }
      });
    } else {
      this.contactDetails = null;
    }
  }

  addLine() {
    this.lineItems.push({ description: '', quantity: 1, rate: 0, gst: '', gstAmount: 0 });
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

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      Array.from(input.files).forEach((file: File) => {
        if (file.size > 20 * 1024 * 1024) {  // 20MB check
          alert(`File ${file.name} exceeds 20MB limit.`);
          return;
        }
        const isImage = file.type.startsWith('image/');
        this.attachments.push({
          file,
          url: this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(file)),
          fileName: file.name,
          isImage
        });
      });
    }
  }

  invoiceAttachmentUrl: any;

  fetchInvoice(id: number) {
    this.invoiceService.getInvoiceById(id).subscribe({
      next: (response: any) => {
        if (response.success) {
          const data = response.data;
          this.formData.customer = data.sent_to.toString();
          this.formData.terms = data.payment_term_id.toString();
          this.formData.invoiceDate = data.invoice_date.split('T')[0];
          this.formData.dueDate = data.invoice_due_date.split('T')[0];
          this.formData.messageOnInvoice = data.message_on_invoice === 'N/A' ? '' : data.message_on_invoice;
          this.formData.discountType = data.discount.method === 'percentage' ? 'percent' : 'value';
          this.formData.discountValue = parseFloat(data.discount.percentage || data.discount.type) || 0;
          this.formData.salesTaxRate = parseFloat(data.tax.rate) || 0;
          this.invoiceAttachment = data.invoice_attachment;
          if (data.invoice_attachment) {
            const base64 = data.invoice_attachment;
            const mimeType = base64.startsWith('iVBORw0KGgo') ? 'image/png' : 'image/jpeg';
            this.invoiceAttachmentUrl = this.sanitizer.bypassSecurityTrustUrl(`data:${mimeType};base64,${base64}`);
          }
          this.attachments = data.attachments.map((base64: string, index: number) => {
            const isImage = base64.startsWith('iVBORw0KGgo') || base64.startsWith('/9j/');
            const mimeType = isImage ? (base64.startsWith('iVBORw0KGgo') ? 'image/png' : 'image/jpeg') : 'application/octet-stream';
            return {
              base64,
              url: this.sanitizer.bypassSecurityTrustUrl(`data:${mimeType};base64,${base64}`),
              fileName: `attachment_${index + 1}${isImage ? (base64.startsWith('iVBORw0KGgo') ? '.png' : '.jpg') : ''}`,
              isImage
            };
          });
          this.lineItems = data.items_list.map((item: any) => ({
            description: item.description,
            quantity: item.quantity,
            rate: parseFloat(item.rate),
            gst: item.gst !== undefined && item.gst !== null ? parseFloat(item.gst).toString() : '',
            gstAmount: parseFloat(item.gst) * (item.quantity * parseFloat(item.rate)) / 100
          }));
          this.invoiceAttachment = data.invoice_attachment;
          this.contactDetails = {
            id: data.customer.id,
            name: data.customer.name,
            type: data.customer.type,
            email: data.customer.email,
            phone: data.customer.phone,
            billing_address: data.billing_address,
            address_components: {
              line_1: '',
              line_2: '',
              line_3: '',
              city: '',
              state: '',
              post_code: '',
              country: ''
            }
          };
          this.updateCalculations();
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error fetching invoice:', error);
        if (error.status === 401) {
          alert('Authentication error: Please log in again.');
        } else {
          alert('Failed to load invoice. Please try again.');
        }
      }
    });
  }

  clearLines() {
    this.lineItems = [{ description: '', quantity: 1, rate: 0, gst: '', gstAmount: 0 }];
    this.updateCalculations();
  }

  updateCalculations() {
    this.subtotal = this.lineItems.reduce((sum, item) => {
      const amount = item.quantity * item.rate;
      item.gstAmount = item.gst ? (amount * parseFloat(item.gst)) / 100 : 0;
      return sum + amount;
    }, 0);

    this.totalGST = this.lineItems.reduce((sum, item) => sum + (item.gstAmount || 0), 0);
    this.subtotalWithGST = this.subtotal + this.totalGST;
    this.taxableSubtotal = this.subtotalWithGST;
    // Apply discount only to subtotal (excluding GST)
    this.discountAmount = this.formData.discountType === 'percent'
      ? (this.subtotal * this.formData.discountValue) / 100
      : this.formData.discountValue;
    const taxAmount = this.taxableSubtotal * (this.formData.salesTaxRate / 100);
    this.total = this.subtotal - this.discountAmount + this.totalGST + taxAmount;
    this.balanceDue = this.total;
  }
  saveForm(): void {
    // Build payload
    const payload: any = {
      company_id: 1,
      sent_to: this.formData.customer,
      invoice_date: this.formData.invoiceDate,
      invoice_due_date: this.formData.dueDate,
      terms: this.formData.terms,
      discount_type: this.formData.discountType,
      discount_value: this.formData.discountValue,
      notes: this.formData.messageOnInvoice || '',
      items: this.lineItems.map(item => ({
        description: item.description,
        quantity: item.quantity,
        rate: item.rate,
        gst: item.gst || 0
      })),
      attachments: this.attachments.map(att => att.file)
    };

    this.invoiceService.saveInvoice(payload).subscribe({
      next: (res: any) => {
        if (res.success) {
          // Show SweetAlert with backend data
          Swal.fire({
            icon: 'success',
            title: 'Invoice Created',
            html: `
            <p><strong>Invoice ID:</strong> ${res.data.invoice_id}</p>
            <p><strong>Customer:</strong> ${res.data.customer?.name}</p>
            <p><strong>Invoice Date:</strong> ${new Date(res.data.invoice_date).toLocaleDateString()}</p>
            <p><strong>Due Date:</strong> ${new Date(res.data.invoice_due_date).toLocaleDateString()}</p>
          `,
            confirmButtonText: 'OK'
          });

          // Optional: Reset form or navigate
          // this.invoiceForm.resetForm();
          // this.router.navigate(['/invoices']); // if router is injected
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Failed to Save Invoice',
            text: res.message || 'An unknown error occurred.'
          });
        }
      },
      error: (err: any) => {
        console.error('Error saving invoice:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to save the invoice. Please try again later.'
        });
      }
    });
  }





}