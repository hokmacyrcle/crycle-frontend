import { Component, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { ApiResponse, Quote, QuotesService } from 'src/app/services/quotes.service';

@Component({
  selector: 'app-quotes',
  templateUrl: './quotes.component.html',
  styleUrls: ['./quotes.component.scss']
})
export class QuotesComponent implements AfterViewInit, OnDestroy {
  displayedColumns: string[] = [
    'select',
    'quote_date',
    'quote_number',
    'contact_name',
    'amount',
    'status',
    'actions'
  ];

  dataSource = new MatTableDataSource<Quote>([]);
  selection = new SelectionModel<Quote>(true, []);
  showBatchMenu = false;
  loading = false;
  convertingQuotes = new Set<number>(); // Track which quotes are being converted
  totalItems = 0;
  pageSize = 15;
  currentPage = 1;
  searchTerm = '';
  statusFilter = 'All';
  dateFilter = 'Last 12 months';
  sortBy = 'quote_date';
  sortOrder = 'desc';
  successMessage = '';
  showSuccessMessage = false;
  
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private quotesService: QuotesService,
    private router: Router,
    private dialog: MatDialog
  ) {
    // Debounced search
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(searchTerm => {
      this.currentPage = 1;
      this.fetchQuotes();
    });
  }

  ngAfterViewInit() {
    console.log('ngAfterViewInit called');
    this.fetchQuotes();
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    
    // Close batch menu when clicking outside
    document.addEventListener('click', this.onDocumentClick);
  }

  fetchQuotes() {
    this.loading = true;
    const filters: any = {
      date: this.dateFilter,
      search: this.searchTerm,
      sort_by: this.sortBy,
      sort_order: this.sortOrder,
      per_page: this.pageSize,
      page: this.currentPage
    };
    
    // Add status filter - send "All" if no specific status selected
    filters.status = this.statusFilter && this.statusFilter.trim() !== '' ? this.statusFilter : 'All';

    this.quotesService.getQuotes(filters).subscribe({
      next: (response: ApiResponse<Quote>) => {
        console.log('Raw API Response:', response);
        console.log('API Response Data:', response.data);
        console.log('API Response Data Array:', response.data.data);
        this.dataSource.data = response.data.data.map(quote => ({
          ...quote,
          // Handle both new and old field names with proper defaults
          amount: String(quote.amount || quote.total_amount || '0'),
          contact_name: quote.contact_name || quote.customer_name || 'Unknown',
          quote_number: quote.quote_number || quote.reference_number || 'N/A',
          // Parse dates if they exist
          quote_date: quote.quote_date ? new Date(quote.quote_date) : new Date(),
          valid_until: quote.valid_until ? new Date(quote.valid_until) : new Date()
        }));
        console.log('Processed DataSource Data:', this.dataSource.data);
        this.totalItems = response.data.total;
        this.currentPage = response.data.current_page;
        this.pageSize = response.data.per_page;
        this.dataSource._updateChangeSubscription(); // Force table update
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching quotes:', error);
        console.error('Error details:', error.error);
        this.loading = false;
        alert('Failed to load quotes. Please try again later.');
      }
    });
  }

  applyFilter(event: KeyboardEvent): void {
    const filterValue = (event.target as HTMLInputElement).value.trim();
    this.searchTerm = filterValue;
    this.searchSubject.next(this.searchTerm);
  }

  onStatusFilterChange(): void {
    this.currentPage = 1;
    this.fetchQuotes();
  }

  onDateFilterChange(): void {
    this.currentPage = 1;
    this.fetchQuotes();
  }

  onSortChange(): void {
    this.currentPage = 1;
    this.fetchQuotes();
  }

  onPageChange(event: any): void {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex + 1;
    this.fetchQuotes();
  }

  viewQuote(id: number): void {
    this.router.navigate(['/admin/quote', id]);
  }

  editQuote(id: number): void {
    console.log('Edit quote:', id);
    // Implement navigation or dialog for editing
    // this.router.navigate(['/quotes/edit', id]);
  }

  deleteQuote(id: number): void {
    console.log('Delete quote:', id);
    // Implement delete logic with confirmation dialog
  }

  convertQuoteToInvoice(quoteId: number): void {
    if (confirm('Are you sure you want to convert this quote to an invoice?')) {
      this.convertingQuotes.add(quoteId);
      this.quotesService.convertQuoteToInvoice(quoteId).subscribe({
        next: (response) => {
          console.log('Quote converted to invoice:', response);
          this.convertingQuotes.delete(quoteId);
          this.showSuccessMessage = true;
          this.successMessage = 'Quote successfully converted to invoice!';
          // Hide success message after 3 seconds
          setTimeout(() => {
            this.showSuccessMessage = false;
            this.successMessage = '';
          }, 3000);
          // Refresh the quotes list
          this.fetchQuotes();
          // Optionally navigate to the invoice
          // this.router.navigate(['/admin/invoice']);
        },
        error: (error) => {
          console.error('Error converting quote to invoice:', error);
          this.convertingQuotes.delete(quoteId);
          alert('Failed to convert quote to invoice. Please try again.');
        }
      });
    }
  }

  createQuote(): void {
    this.router.navigate(['/admin/create-quote']);
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }

  /** Handle batch actions */
  onBatchAction(action: string): void {
    const selectedQuotes = this.selection.selected;
    if (selectedQuotes.length === 0) {
      alert('Please select quotes to perform batch actions');
      return;
    }
    
    console.log(`Performing ${action} on ${selectedQuotes.length} quotes:`, selectedQuotes);
    
    switch (action) {
      case 'approve':
        // Implement approve logic
        alert('Approve functionality not implemented yet');
        break;
      case 'reject':
        // Implement reject logic
        alert('Reject functionality not implemented yet');
        break;
      case 'convert-to-invoice':
        this.convertMultipleQuotesToInvoice(selectedQuotes);
        break;
      case 'delete':
        // Implement delete logic
        alert('Delete functionality not implemented yet');
        break;
      case 'send':
        // Implement send logic
        alert('Send functionality not implemented yet');
        break;
      default:
        alert(`Action "${action}" not implemented yet`);
    }
  }

  private convertMultipleQuotesToInvoice(quotes: Quote[]): void {
    if (confirm(`Are you sure you want to convert ${quotes.length} quotes to invoices?`)) {
      this.loading = true;
      let successCount = 0;
      let errorCount = 0;
      
      // Process quotes sequentially using RxJS
      const processQuotes = () => {
        let currentIndex = 0;
        
        const processNext = () => {
          if (currentIndex >= quotes.length) {
            // All quotes processed
            this.loading = false;
            this.selection.clear();
            
            if (successCount > 0) {
              alert(`Successfully converted ${successCount} quotes to invoices!`);
              this.fetchQuotes(); // Refresh the list
            }
            
            if (errorCount > 0) {
              alert(`Failed to convert ${errorCount} quotes. Please check the console for details.`);
            }
            return;
          }
          
          const quote = quotes[currentIndex];
          currentIndex++;
          
          this.quotesService.convertQuoteToInvoice(quote.quote_id).subscribe({
            next: () => {
              successCount++;
              processNext(); // Process next quote
            },
            error: (error) => {
              console.error(`Error converting quote ${quote.quote_id}:`, error);
              errorCount++;
              processNext(); // Process next quote even if this one failed
            }
          });
        };
        
        processNext(); // Start processing
      };
      
      processQuotes();
    }
  }

  isExpired(date: string | Date): boolean {
    return new Date(date) < new Date();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    
    // Remove event listener
    document.removeEventListener('click', this.onDocumentClick);
  }

  private onDocumentClick = (event: Event) => {
    const target = event.target as HTMLElement;
    if (!target.closest('.batch-actions-dropdown')) {
      this.showBatchMenu = false;
    }
  }
}
