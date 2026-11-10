import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { ApiResponse, Contact, CustomersService } from 'src/app/services/customers.service';

@Component({
  selector: 'app-getallcustomer',
  templateUrl: './getallcustomer.component.html',
  styleUrls: ['./getallcustomer.component.scss']
})
export class GetallcustomerComponent {
  displayedColumns: string[] = [
    'id',
    'name',
    'type',
    'email',
    'phone',
    'mobile',
    'company_name',
    'address',
    'category',
    'status',
    'actions'
  ];

  dataSource = new MatTableDataSource<Contact>([]);
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
    private contactService: CustomersService,
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
      this.fetchContacts(this.currentPage, this.pageSize, searchTerm);
    });
  }

  ngAfterViewInit() {
    console.log('ngAfterViewInit called');
    // Initialize paginator and sort before fetching data
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.fetchContacts(); // Fetch initial data
  }

  fetchContacts(page: number = 1, pageSize: number = this.pageSize, search: string = this.searchTerm) {
    console.log('Fetching contacts with page:', page, 'pageSize:', pageSize, 'search:', search);
    this.loading = true;
    this.contactService.getContacts(page, pageSize, search).subscribe({
      next: (response: ApiResponse) => {
        console.log('API Response:', response);
        console.log('Total Items:', response.data.pagination.total);

        // Update dataSource with new data
        this.dataSource.data = response.data.contacts.map(contact => ({
          ...contact,
          created_at: new Date(contact.created_at),
          updated_at: new Date(contact.updated_at)
        }));

        // Update pagination properties
        this.totalItems = response.data.pagination.total || 0;
        this.currentPage = response.data.pagination.current_page;
        this.pageSize = response.data.pagination.per_page;

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
        console.error('Error fetching contacts:', error.message, error.status, error.statusText);
        this.loading = false;
        alert('Failed to load contacts. Error: ' + error.message);
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
    this.fetchContacts(this.currentPage, this.pageSize, this.searchTerm);
  }

  editContact(id: number): void {
    console.log('Edit contact:', id);
    this.router.navigate(['admin/update-contact/', id]);
  }

  deleteContact(id: number): void {
    console.log('Delete contact:', id);
    // Implement delete logic
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}