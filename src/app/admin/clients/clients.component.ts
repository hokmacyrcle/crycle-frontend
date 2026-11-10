import { Component, HostListener, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
// import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { Client, DashboardService, ApiResponse } from 'src/app/services/dashboard.service';
import Swal from 'sweetalert2';
import { AddClientComponent } from '../add-client/add-client.component'; // adjust path
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.scss']
})
export class ClientsComponent {

  activeSection = 'dashboard';
  activeTab = 'clients';
  displayedColumns: string[] = [
    'id',
    'company_name',
    'email',
    'phone',
    'website',
    'vat_number',
    'gst_number',
    'address',
    'status',
    'actions'
  ];
  dataSource = new MatTableDataSource<Client>([]);
  loading = false;
  totalItems = 0;
  pageSize = 5;
  currentPage = 1;
  searchTerm = ''; // Added to fix TS2339
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;



  dashboardTabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'clients', label: 'Clients' },
    { id: 'contacts', label: 'Contacts' }
  ];

  constructor(private dashboardService: DashboardService, private router: Router, private dialog: MatDialog) {
    // Set up debounced search
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(searchTerm => {
      this.currentPage = 1; // Reset to first page
      this.fetchClients(this.currentPage, this.pageSize, searchTerm);
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.fetchClients();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fetchClients(page: number = 1, pageSize: number = this.pageSize, search: string = this.searchTerm) {
  this.loading = true;
  this.dashboardService.getClients(page, pageSize, search).subscribe({
    next: (response: ApiResponse) => {
      this.dataSource.data = response.data.data;
      
      // Update pagination properties
      this.totalItems = response.data.total;
      this.currentPage = response.data.current_page;
      this.pageSize = response.data.per_page;
      
      // Update the paginator after the data is loaded
      setTimeout(() => {
        if (this.paginator) {
          this.paginator.length = this.totalItems;
          this.paginator.pageIndex = this.currentPage - 1; // Convert to 0-based index
          this.paginator.pageSize = this.pageSize;
        }
      });
      
      this.loading = false;
    },
    error: (error) => {
      console.error('Error fetching clients:', error);
      this.loading = false;
    }
  });
}

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim();
    this.searchTerm = filterValue;
    this.searchSubject.next(filterValue);
  }

  clearSearch() {
    this.searchTerm = '';
    this.searchSubject.next('');
  }

  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex + 1; // MatPaginator is 0-based, API is 1-based
    this.pageSize = event.pageSize;
    this.fetchClients(this.currentPage, this.pageSize, this.searchTerm);
  }


  // setActiveSection(section: string) {
  //   this.activeSection = section;
  //   if (window.innerWidth < 768) {
  //     this.isSidebarOpen = false;
  //   }
  // }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  // @HostListener('window:resize', ['$event'])
  // onResize(event: Event) {
  //   if (window.innerWidth >= 768) {
  //     this.isSidebarOpen = true;
  //   }
  // }


  // edit button
  editClient(id: number) {
    this.router.navigate(['admin/updateclient/', id]);
  }
  // delete client 
  deleteClient(id: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.dashboardService.deleteClient(id).subscribe({
          next: () => {
            Swal.fire('Deleted!', 'Client has been deleted.', 'success');
            this.fetchClients(); // Reload or refetch list
          },
          error: () => {
            Swal.fire('Error', 'Failed to delete client.', 'error');
          }
        });
      }
    });
  }

  toggleClientStatus(id: number, currentStatus: string): void {
    this.dashboardService.toggleClientStatus(id).subscribe({
      next: (response) => {
        const newStatus = response.data.status;

        Swal.fire({
          icon: 'success',
          title: 'Status Updated',
          text: `Client status updated to "${newStatus}".`,
          timer: 1500,
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
        });

        this.fetchClients(this.currentPage, this.pageSize, this.searchTerm); // Refresh list
      },
      error: () => {
        Swal.fire('Error', 'Failed to update client status.', 'error');
      }
    });
  }


  openAddClientDialog(): void {
  const dialogRef = this.dialog.open(AddClientComponent, {
    width: '600px',
    disableClose: true
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result === 'saved') {
      this.fetchClients(); // Refresh list
    }
  });
}



}