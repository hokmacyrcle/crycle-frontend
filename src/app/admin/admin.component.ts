import { Component, HostListener, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
// import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { SessionService } from '../core/session.service';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import Swal from 'sweetalert2';
import {
  Client,
  DashboardService,
  ApiResponse,
} from '../services/dashboard.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
})
export class AdminComponent {
  isSidebarOpen = false;
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
    'actions',
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

  menuItems = [
    {
      section: 'dashboard',
      label: 'Dashboard',
      icon: 'assets/images/Dashboard/dashboardsidebar.png',
    },
    {
      section: 'banking',
      label: 'Banking',
      icon: 'assets/images/Dashboard/banklogo.png',
    },
    {
      section: 'expenses',
      label: 'Expenses',
      icon: 'assets/images/Dashboard/expenseslogo.png',
    },

    {
      section: 'sales',
      label: 'Sales',
      icon: 'assets/images/Dashboard/saleslogo.png',
    },
    {
      section: 'projects',
      label: 'Projects',
      icon: 'assets/images/Dashboard/projectlogo.png',
    },
    {
      section: 'workers',
      label: 'Workers',
      icon: 'assets/images/Dashboard/workerlogo.png',
    },
    {
      section: 'reports',
      label: 'Reports',
      icon: 'assets/images/Dashboard/reportlogo.png',
    },
    {
      section: 'taxes',
      label: 'Taxes',
      icon: 'assets/images/Dashboard/taxeslogo.png',
    },
    {
      section: 'account',
      label: 'My Account',
      icon: 'assets/images/Dashboard/accountlogo.png',
    },
  ];

  dashboardTabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'clients', label: 'Clients' },
    { id: 'contacts', label: 'Contacts' },
  ];

  // Bottom tabs on phones, chosen by role. Employees only get routes the roleGuard allows.
  tabs: { label: string; icon: string; route: string }[] = [];

  private buildTabs() {
    return this.session.role === 'employee'
      ? [{ label: 'Home', icon: 'home', route: '/admin/my-home' }]
      : [
          { label: 'Home', icon: 'home', route: '/admin/Dashboard' },
          { label: 'Sales', icon: 'receipt_long', route: '/admin/sales' },
          { label: 'Clients', icon: 'groups', route: '/admin/clients' },
          { label: 'Payroll', icon: 'payments', route: '/admin/payroll' },
          { label: 'Team', icon: 'badge', route: '/admin/Employees' },
        ];
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  constructor(
    private dashboardService: DashboardService,
    private router: Router,
    public session: SessionService
  ) {
    this.tabs = this.buildTabs(); // built once: a getter returning a new array every change-detection loops with routerLinkActive
    // Set up debounced search
    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((searchTerm) => {
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

  fetchClients(
    page: number = 1,
    pageSize: number = this.pageSize,
    search: string = this.searchTerm
  ) {
    this.loading = true;
    this.dashboardService.getClients(page, pageSize, search).subscribe({
      next: (response: ApiResponse) => {
        this.dataSource.data = response.data.data; // Fix for TS2740
        this.totalItems = response.data.total;
        this.currentPage = response.data.current_page;
        this.pageSize = response.data.per_page;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching clients:', error);
        // this.snackBar.open('Failed to load clients', 'Close', { duration: 3000 });
        this.loading = false;
      },
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

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  setActiveSection(section: string) {
    this.activeSection = section;
    if (window.innerWidth < 768) {
      this.isSidebarOpen = false;
    }
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    if (window.innerWidth >= 768) {
      this.isSidebarOpen = true;
    }
  }

  // edit button
  editClient(id: number) {
    this.router.navigate(['/updateclient', id]);
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
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.dashboardService.deleteClient(id).subscribe({
          next: () => {
            Swal.fire('Deleted!', 'Client has been deleted.', 'success');
            this.fetchClients(); // Reload or refetch list
          },
          error: () => {
            Swal.fire('Error', 'Failed to delete client.', 'error');
          },
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
      },
    });
  }
}
