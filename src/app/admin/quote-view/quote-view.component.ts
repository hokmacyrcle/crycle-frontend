import { Component, HostListener, OnInit } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { QuotesService } from 'src/app/services/quotes.service';

@Component({
  selector: 'app-quote-view',
  templateUrl: './quote-view.component.html',
  styleUrls: ['./quote-view.component.scss']
})
export class QuoteViewComponent implements OnInit {
  quoteId: number | null = null;
  loading = false;
  quoteData: any = null;
  quoteAttachmentUrls: SafeUrl[] = []; // Array to store sanitized attachment URLs
  selectedImageUrl: SafeUrl | null = null; // For modal display
  showImageModal = false; // Control modal visibility
  showError = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private quotesService: QuotesService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.quoteId = +params['id'];
      if (this.quoteId) {
        this.loadQuote();
      }
    });
  }

  loadQuote(): void {
    if (!this.quoteId) return;

    this.loading = true;
    this.quotesService.getQuoteById(this.quoteId).subscribe({
      next: (response) => {
        this.quoteData = response.data;
        console.log('Quote data:', this.quoteData);

        // Process all attachments
        this.quoteAttachmentUrls = []; // Reset array
        if (this.quoteData.attachments && this.quoteData.attachments.length > 0) {
          this.quoteAttachmentUrls = this.quoteData.attachments.map((attachment: any) => {
            if (attachment.data) {
              // Handle base64 image
              const mimeType = attachment.filename.endsWith('.png') ? 'image/png' : 'image/jpeg';
              return this.sanitizer.bypassSecurityTrustUrl(
                `data:${mimeType};base64,${attachment.data}`
              );
            } else if (attachment.path) {
              // Handle URL-based attachment
              const baseUrl = 'https://cyrcle-api.hokma.co.in';
              return this.sanitizer.bypassSecurityTrustUrl(
                `${baseUrl}/public/${attachment.path}`
              );
            }
            return null;
          }).filter((url: SafeUrl | null) => url !== null); // Filter out null URLs
          console.log('Attachment URLs set:', this.quoteAttachmentUrls);
        } else {
          console.log('No attachments found');
        }

        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading quote:', error);
        this.showError = true;
        this.errorMessage = 'Failed to load quote. Please try again.';
        this.loading = false;
      }
    });
  }

  openImageModal(imageUrl: SafeUrl): void {
    console.log('Opening image modal for:', imageUrl);
    this.selectedImageUrl = imageUrl;
    this.showImageModal = true;
  }

  closeImageModal(): void {
    console.log('Closing image modal');
    this.showImageModal = false;
    this.selectedImageUrl = null;
  }

  onImageError(event: any): void {
    console.error('Image failed to load:', event);
    const imgElement = event.target as HTMLImageElement;
    imgElement.style.display = 'none';
  }

  @HostListener('document:keydown.escape', ['$event'])
  handleEscapeKey(event: KeyboardEvent): void {
    if (this.showImageModal) {
      this.closeImageModal();
    }
  }

  goBack(): void {
    this.router.navigate(['/admin/quotes']);
  }

  editQuote(): void {
    this.router.navigate(['/admin/quote/edit', this.quoteId]);
  }

  convertToInvoice(): void {
    if (!this.quoteId) return;

    if (confirm('Are you sure you want to convert this quote to an invoice?')) {
      this.loading = true;
      this.quotesService.convertQuoteToInvoice(this.quoteId).subscribe({
        next: (response) => {
          this.loading = false;
          alert('Quote successfully converted to invoice!');
        },
        error: (error) => {
          this.showError = true;
          this.errorMessage = 'Failed to convert quote to invoice. Please try again.';
          this.loading = false;
        }
      });
    }
  }

  updateStatus(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const newStatus = target.value;

    if (!this.quoteId) return;

    if (newStatus === 'Closed') {
      const balanceDue = this.getBalanceDue();
      if (balanceDue > 0) {
        this.showError = true;
        this.errorMessage = `Cannot close quote. Balance due amount is $${balanceDue.toFixed(2)}. Please ensure all amounts are settled before closing.`;
        return;
      }
    }

    if (confirm(`Are you sure you want to change the status to "${newStatus}"?`)) {
      this.loading = true;
      this.quotesService.updateQuoteStatus(this.quoteId, newStatus).subscribe({
        next: (response) => {
          this.loading = false;
          this.quoteData.status = newStatus;
          alert(`Quote status successfully updated to ${newStatus}!`);
        },
        error: (error) => {
          this.showError = true;
          this.errorMessage = 'Failed to update quote status. Please try again.';
          this.loading = false;
        }
      });
    }
  }

  hideError(): void {
    this.showError = false;
    this.errorMessage = '';
  }

  getStatusColor(status: string): string {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getSubtotal(): number {
    const items = this.quoteData?.items || this.quoteData?.line_items || [];
    if (!Array.isArray(items)) {
      return 0;
    }
    return items.reduce((sum: number, item: any) => {
      return sum + parseFloat(item.amount || '0');
    }, 0);
  }

  getGstTotal(): number {
    const items = this.quoteData?.items || this.quoteData?.line_items || [];
    if (!Array.isArray(items)) {
      return 0;
    }
    return items.reduce((sum: number, item: any) => {
      return sum + parseFloat(item.gst || '0');
    }, 0);
  }

  getTotal(): number {
    const subtotal = this.getSubtotal();
    const gstTotal = this.getGstTotal();
    const discount = this.quoteData?.discount?.amount ? parseFloat(this.quoteData.discount.amount) : 0;

    return subtotal + gstTotal - discount;
  }

  getBalanceDue(): number {
    const total = this.getTotal();
    const paidAmount = this.quoteData?.paid_amount ? parseFloat(this.quoteData.paid_amount) : 0;
    const credits = this.quoteData?.credits ? parseFloat(this.quoteData.credits) : 0;

    return total - paidAmount - credits;
  }
}