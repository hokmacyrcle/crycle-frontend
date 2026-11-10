import { Component, OnInit, HostListener, ViewChild, AfterViewInit } from '@angular/core';
import { PayrollService, Employees, ApiResponse } from 'src/app/services/payroll.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { SelectionModel } from '@angular/cdk/collections';

type EmployeeWithSelect = Employees & { selected?: boolean };

@Component({
  selector: 'app-payroll-employee',
  templateUrl: './payroll-employee.component.html',
  styleUrls: ['./payroll-employee.component.scss']
})
export class PayrollEmployeeComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = [
    'select',
    'first_name',
    'last_name',
    'calendar',
    'employee_group',
    'next_payment_date',
    'action'
  ];

  dataSource = new MatTableDataSource<EmployeeWithSelect>([]);
  selection = new SelectionModel<EmployeeWithSelect>(true, []);

  isLoading = false;
  errorMessage: string | null = null;

  activeTab: string = 'current';
  dropdown1Open: boolean = false;
  dropdown2Open: boolean = false;
  hasChild = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private payrollService: PayrollService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.router.events.subscribe(() => {
      this.hasChild = this.route.firstChild != null;
    });
  }

  ngOnInit(): void {
    this.loadEmployees();

    this.dataSource.filterPredicate = (data: EmployeeWithSelect, filter: string) => {
      const searchStr = (data.first_name + ' ' + data.last_name + ' ' + data.employee_group)
        .toLowerCase();
      return searchStr.includes(filter);
    };
  }


  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  // Load Employees from API
  loadEmployees(page: number = 1, perPage: number = 15): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.payrollService.getEmployees(page, perPage).subscribe({
      next: (res: ApiResponse<Employees>) => {
        if (res?.status && res.data && Array.isArray(res.data.data)) {
          const employees: EmployeeWithSelect[] = res.data.data.map(emp => ({
            ...emp,
            selected: false
          }));
          this.dataSource.data = employees;
        } else {
          this.errorMessage = res?.message || 'Unexpected API response';
          this.dataSource.data = [];
        }
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Failed to load employees';
        this.dataSource.data = [];
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }


  // Checkbox Selection
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.dataSource.data.forEach(row => this.selection.select(row));
  }

  // Tabs toggle
  setTab(tab: string) {
    this.activeTab = tab;
  }

  // Dropdown toggle
  toggleDropdown(drop: number) {
    if (drop === 1) {
      this.dropdown1Open = !this.dropdown1Open;
      this.dropdown2Open = false;
    } else {
      this.dropdown2Open = !this.dropdown2Open;
      this.dropdown1Open = false;
    }
  }

  closeDropdowns() {
    this.dropdown1Open = false;
    this.dropdown2Open = false;
  }

  // Document click listener
  @HostListener('document:click', ['$event'])
  handleClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative')) {
      this.closeDropdowns();
    }
  }
}
