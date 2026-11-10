import { Component, ViewChild } from '@angular/core';
import { AddCompanyComponent } from '../add-company/add-company.component';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { ApiResponse, CompaniesService, Company } from 'src/app/services/companies.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-companies',
  templateUrl: './companies.component.html',
  styleUrls: ['./companies.component.scss']
})
export class CompaniesComponent {
  activeSection = 'dashboard';
  activeTab = 'companies';
  displayedColumns: string[] = [
    'company_id',
    'company_name',
    'company_abn',
    'company_acn',
    'gst_number',
    'company_type',
    'address',
    // 'location_status',
    'actions'
  ];
  dataSource = new MatTableDataSource<Company>([]);
  loading = false;
  totalItems = 0;
  pageSize = 5;
  currentPage = 1;
  searchTerm = '';
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  dashboardTabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'clients', label: 'Clients' },
    { id: 'companies', label: 'Companies' },
    { id: 'contacts', label: 'Contacts' }
  ];

  constructor(
    private dashboardService: CompaniesService,
    private router: Router,
    private dialog: MatDialog
  ) {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(searchTerm => {
      this.currentPage = 1;
      this.fetchCompanies(this.currentPage, this.pageSize, searchTerm);
    });
  }

 
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.fetchCompanies();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fetchCompanies(page: number = 1, pageSize: number = this.pageSize, search: string = this.searchTerm) {
    this.loading = true;
    this.dashboardService.getCompanies(page, pageSize, search).subscribe({
      next: (response: ApiResponse) => {
        this.dataSource.data = response.data.data.map((company: any) => ({
          ...company,
          location_status: company.location_status || (company.locations[0]?.location_status === 'Active' ? 'active' : 'inactive') // Adjust based on API
        }));
        this.totalItems = response.data.total;
        this.currentPage = response.data.current_page;
        this.pageSize = response.data.per_page;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching companies:', error);
        Swal.fire('Error', 'Failed to load companies.', 'error');
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
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.fetchCompanies(this.currentPage, this.pageSize, this.searchTerm);
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  editCompany(id: number) {
    this.router.navigate(['admin/updatecompany/', id]);
  }

  deleteCompany(id: number): void {
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
        this.dashboardService.deleteCompany(id).subscribe({
          next: () => {
            Swal.fire('Deleted!', 'Company has been deleted.', 'success');
            this.fetchCompanies();
          },
          error: () => {
            Swal.fire('Error', 'Failed to delete company.', 'error');
          }
        });
      }
    });
  }

  toggleCompanyStatus(company_id: number, currentStatus: string): void {
    this.dashboardService.toggleCompanyStatus(company_id).subscribe({
      next: (response) => {
        const newStatus = response.data.status;
        Swal.fire({
          icon: 'success',
          title: 'Status Updated',
          text: `Company status updated to "${newStatus}".`,
          timer: 1500,
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
        });
        this.fetchCompanies(this.currentPage, this.pageSize, this.searchTerm);
      },
      error: () => {
        Swal.fire('Error', 'Failed to update company status.', 'error');
      }
    });
  }

  openAddCompanyDialog(): void {
    const dialogRef = this.dialog.open(AddCompanyComponent, {
      width: '600px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'saved') {
        this.fetchCompanies();
      }
    });
  }

  getPrimaryAddress(locations: any[]): string {
    if (!locations || locations.length === 0) return 'N/A';
    const primary = locations[0]; // Assuming first location is primary
    return `${primary.address_line_1}, ${primary.address_line_2 || ''}, ${primary.city}, ${primary.state} ${primary.postcode}, ${primary.country}`;
  }
}