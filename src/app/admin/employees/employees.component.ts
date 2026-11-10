import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { ApiResponse, Employee, EmployeeService } from 'src/app/services/employee.service';
import Swal from 'sweetalert2';
import { AddEmployeeComponent } from '../add-employee/add-employee.component';

@Component({
  selector: 'app-employees',
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.scss']
})
export class EmployeesComponent {
  activeSection = 'dashboard';
  activeTab = 'clients';
  dashboardTabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'clients', label: 'Clients' },
    { id: 'contacts', label: 'Contacts' }
  ];
  displayedColumns: string[] = [
    'emp_id',
    'emp_first_name',
    'emp_middle_name',
    'emp_last_name',
    'emp_email_address',
    'emp_phone_number',
    'emp_status',
    'actions'
  ];

  dataSource = new MatTableDataSource<Employee>([]);
  loading = false;
  totalItems = 0;
  pageSize = 5;
  currentPage = 0; // Changed to 0 for Material paginator compatibility
  searchTerm = '';
  errorMessage: any;
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  constructor(
    private employeeService: EmployeeService,
    private router: Router,
    private dialog: MatDialog
  ) {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(searchTerm => {
      this.currentPage = 0; // Reset to first page when searching
      this.fetchEmployees(this.currentPage + 1, this.pageSize, searchTerm); // API uses 1-based index
    });
  }

  ngAfterViewInit() {
    // Set up paginator after view initialization
    this.paginator.page
      .pipe(takeUntil(this.destroy$))
      .subscribe((event: PageEvent) => {
        this.onPageChange(event);
      });
    
    this.fetchEmployees();
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fetchEmployees(page: number = 1, pageSize: number = this.pageSize, search: string = this.searchTerm) {
    this.loading = true;
    this.errorMessage = null;
    
    this.employeeService.getEmployees(page, pageSize, search).subscribe({
      next: (response: ApiResponse<Employee>) => {
        this.dataSource.data = response.data.data;
        this.totalItems = response.data.total;
        this.currentPage = response.data.current_page - 1; // Convert to 0-based for UI
        this.pageSize = response.data.per_page;
        this.loading = false;
        
        // Update paginator length
        if (this.paginator) {
          this.paginator.length = this.totalItems;
        }
        
        if (this.dataSource.data.length === 0) {
          this.errorMessage = 'No employees found';
        }
      },
      error: (error) => {
        this.loading = false;
        this.dataSource.data = [];
        console.error('Error fetching employees:', error);
        
        if (error.status === 403) {
          this.errorMessage = error.error.message || 'User must be associated with a company to access employees';
          Swal.fire({
            icon: 'error',
            title: 'Access Denied',
            text: this.errorMessage,
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'OK'
          });
        } else {
          this.errorMessage = 'Failed to fetch employees. Please try again later.';
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: this.errorMessage,
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'OK'
          });
        }
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
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.fetchEmployees(this.currentPage + 1, this.pageSize, this.searchTerm); // API uses 1-based index
  }

  editEmployee(id: number) {
    this.router.navigate(['admin/employees/edit/', id]);
  }

  deleteEmployee(id: number) {
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
        this.employeeService.deleteEmployee(id).subscribe({
          next: () => {
            Swal.fire('Deleted!', 'Employee has been deleted.', 'success');
            // Reset to first page after deletion
            this.currentPage = 0;
            this.fetchEmployees(1, this.pageSize, this.searchTerm);
          },
          error: () => {
            Swal.fire('Error', 'Failed to delete employee.', 'error');
          }
        });
      }
    });
  }

  toggleEmployeeStatus(employee_id: any, currentStatus: string) {
    this.employeeService.toggleEmployeeStatus(employee_id).subscribe({
      next: (response) => {
        const newStatus = response.data.status;
        Swal.fire({
          icon: 'success',
          title: 'Status Updated',
          text: `Employee status updated to "${newStatus}".`,
          timer: 1500,
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
        });
        this.fetchEmployees(this.currentPage + 1, this.pageSize, this.searchTerm);
      },
      error: () => {
        Swal.fire('Error', 'Failed to update employee status.', 'error');
      }
    });
  }

  openAddEmployeeDialog() {
    const dialogRef = this.dialog.open(AddEmployeeComponent, {
      width: '600px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'saved') {
        // Reset to first page after adding a new employee
        this.currentPage = 0;
        this.fetchEmployees();
      }
    });
  }
}