import { Component, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { ApiResponse, invoices, InvoiceService } from 'src/app/services/invoice.service';

@Component({
  selector: 'app-getallinvoices',
  templateUrl: './getallinvoices.component.html',
  styleUrls: ['./getallinvoices.component.scss']
})
export class GetallinvoicesComponent implements AfterViewInit, OnDestroy {
  displayedColumns: string[] = [
    'id',
    'invoice_date',
    'customer_name',
    'total_amount',
    'status',
    'payment_status',
    'due_date',
    'is_overdue',
    'actions'
  ];

  dataSource = new MatTableDataSource<invoices>([]);
  loading = false;
  totalItems = 0;
  pageSize = 5;
  currentPage = 1;
  searchTerm = '';
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private invoiceservice: InvoiceService,
    private router: Router,
    private dialog: MatDialog
  ) {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(searchTerm => {
      this.currentPage = 1;
      if (this.paginator) {
        this.paginator.pageIndex = 0; // Reset to first page
      }
      this.fetchinvoices(this.currentPage, this.pageSize, searchTerm);
    });
  }

  ngAfterViewInit() {
    console.log('ngAfterViewInit called');
    // Initialize paginator and sort before fetching data
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.fetchinvoices(); // Fetch initial data
  }

  fetchinvoices(page: number = 1, pageSize: number = this.pageSize, search: string = this.searchTerm) {
  console.log('Fetching invoices with page:', page, 'pageSize:', pageSize, 'search:', search);
  this.loading = true;
  this.invoiceservice.getinvoices(page, pageSize, search).subscribe({
    next: (response: ApiResponse<invoices>) => {
      console.log('API Response:', response);
      console.log('Total Items:', response.data.total);

      // Update dataSource with new data
      this.dataSource.data = response.data.data.map(invoice => ({
        ...invoice,
        total_amount: parseFloat(invoice.total_amount as string),
        invoice_date: new Date(invoice.invoice_date),
        due_date: new Date(invoice.due_date)
      }));

      // Update pagination properties
      this.totalItems = response.data.total || 0;
      this.currentPage = response.data.current_page;
      this.pageSize = response.data.per_page;

      // Update the paginator after the data has loaded
      setTimeout(() => {
        if (this.paginator) {
          this.paginator.length = this.totalItems;
          this.paginator.pageIndex = this.currentPage - 1;
          this.paginator.pageSize = this.pageSize;
        }

      });

      this.loading = false;
    },
    error: (error) => {
      console.error('Error fetching invoices:', error.message, error.status, error.statusText);
      this.loading = false;
      alert('Failed to load invoices. Error: ' + error.message);
    }
  });
}



  applyFilter(event: KeyboardEvent): void {
    const filterValue = (event.target as HTMLInputElement).value.trim();
    this.searchTerm = filterValue;
    this.currentPage = 1;
    if (this.paginator) {
      this.paginator.pageIndex = 0; // Reset to first page
    }
    this.searchSubject.next(this.searchTerm);
  }

  onPageChange(event: any): void {
    console.log('Page Change Event:', event);
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex + 1; // Convert 0-based index to 1-based page
    this.fetchinvoices(this.currentPage, this.pageSize, this.searchTerm);
  }

  invoiceview(id: number) {
    this.router.navigate(['admin/invoice', id]);
  }

  editInvoice(id: number): void {
    console.log('Edit invoice:', id);
    this.router.navigate(['admin/invoices/', id]);
  }

  deleteInvoice(id: number): void {
    console.log('Delete invoice:', id);
    // Implement delete logic
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}