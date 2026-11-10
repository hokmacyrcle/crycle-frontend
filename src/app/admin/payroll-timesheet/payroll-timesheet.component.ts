import { Component, OnInit } from '@angular/core';
import { PayrollService, Employees, ApiResponse } from 'src/app/services/payroll.service';
import { Router, ActivatedRoute } from '@angular/router';

type EmployeeWithSelect = Employees & { selected?: boolean };

@Component({
  selector: 'app-payroll-timesheet',
  templateUrl: './payroll-timesheet.component.html',
  styleUrls: ['./payroll-timesheet.component.scss']
})
export class PayrollTimesheetComponent implements OnInit {
  // Dropdown state
  employees: EmployeeWithSelect[] = [];
  periods: string[] = [];   // keep only one array for periods

  // UI state
  isLoading: boolean = false;
  errorMessage: string | null = null;
  showModal: boolean = false;

  // Selections
  selectedEmployee: string = '';
  selectedPeriod: string = '';

  // Timesheet data for child component
  timesheetData: { employee_id: number; period: string } | null = null;

  // Router child check
  hasChild: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private payrollService: PayrollService
  ) {
    // Detect child routes
    this.router.events.subscribe(() => {
      this.hasChild = this.route.firstChild != null;
    });
  }

  ngOnInit(): void {
    this.loadEmployees();
    this.loadTimePeriods();
  }

  // Modal functions
  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedEmployee = '';
    this.selectedPeriod = '';
  }

  // Load Employees from API
  loadEmployees(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.payrollService.getEmployeesfordropdown().subscribe({
      next: (res: ApiResponse<Employees>) => {
        if (res?.status && res.data && Array.isArray(res.data.data)) {
          this.employees = res.data.data.map(emp => ({
            ...emp,
            selected: false
          }));
        } else {
          this.errorMessage = res?.message || 'Unexpected API response';
          this.employees = [];
        }
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Failed to load employees';
        this.employees = [];
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
  // Load Time Periods from API
  loadTimePeriods(): void {
    // this.isLoading = true;
    // this.errorMessage = null;

    // this.payrollService.getTimeperiodDropdowns().subscribe({
    //   next: (res: string[]) => {
    //     this.periods = res;
    //   },
    //   error: (err) => {
    //     this.errorMessage = err?.error?.message || 'Failed to load time periods';
    //     this.periods = [];
    //   },
    //   complete: () => {
    //     this.isLoading = false;
    //   }
    // });
  }

  // Load timesheet data for selected employee + period
  loadTimesheet() {
    if (!this.selectedEmployee || !this.selectedPeriod) {
      this.errorMessage = 'Please select both Employee and Period';
      return;
    }

    this.payrollService.getTimesheets(+this.selectedEmployee, this.selectedPeriod).subscribe({
      next: (res: any) => {
        if (res.status) {
          // res.data.data is a list → take first item
          this.timesheetData = res.data.data?.[0] || null;
          this.errorMessage = '';
          console.log('Timesheet data:', this.timesheetData);
        } else {
          this.errorMessage = res.message;
        }
      },
      error: () => {
        this.errorMessage = 'Failed to load timesheet';
      }
    });
  }

  // Save selected employee + period to child
  onAdd() {
    if (this.selectedEmployee && this.selectedPeriod) {
      this.timesheetData = {
        employee_id: Number(this.selectedEmployee),
        period: this.selectedPeriod
      };
      this.showModal = false;
    }
  }
}
