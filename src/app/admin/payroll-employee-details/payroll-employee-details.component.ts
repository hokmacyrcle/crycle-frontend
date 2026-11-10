import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { EmployeePayrollDetailsModel, PayrollService } from 'src/app/services/payroll.service';

@Component({
  selector: 'app-payroll-employee-details',
  templateUrl: './payroll-employee-details.component.html',
  styleUrls: ['./payroll-employee-details.component.scss']
})
export class PayrollEmployeeDetailsComponent implements OnInit {
  employeeId!: number;
  selectedEmployee: EmployeePayrollDetailsModel | null = null;

  constructor(
    private route: ActivatedRoute,
    private payrollService: PayrollService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params: ParamMap) => {
      const id = params.get('id');
      if (id) {
        this.employeeId = +id;
        this.loadEmployeeById(this.employeeId);
      }
    });
  }

  loadEmployeeById(id: number): void {
    this.payrollService.getEmployeeById(id).subscribe({
      next: (res) => {
        this.selectedEmployee = res.data;
        console.log('✅ Employee loaded:', this.selectedEmployee);
      },
      error: (err) => {
        console.error('❌ Error loading employee:', err);
      }
    });
  }

  getEmployeeDetails(): void {
    if (!this.employeeId) return;

    this.payrollService.getEmployeeById(this.employeeId).subscribe({
      next: (res) => {
        this.selectedEmployee = res.data;
        console.log('👨‍👩‍👧 Employee details fetched:', this.selectedEmployee);
      },
      error: (err) => {
        console.error('❌ Error fetching employee:', err);
      }
    });
  }
}
