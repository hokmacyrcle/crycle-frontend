import { Component, Input, OnInit, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { PayrollService } from 'src/app/services/payroll.service';
import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-payroll-timesheet-details',
  templateUrl: './payroll-timesheet-details.component.html',
  styleUrls: ['./payroll-timesheet-details.component.scss']
})
export class PayrollTimesheetDetailsComponent implements OnInit, OnChanges {
  timesheet: any[] = [];
  showProjectModal = false;
  selectedProject: string = '';
  staffList = ['Rakesh Chandra T', 'Employee A', 'Employee B'];

  @Input() employeeId!: number;
  @Input() period!: string;
  @Output() close = new EventEmitter<void>();

  employeeData: any = null;
  isLoading = false;
  errorMessage: string | null = null;

  constructor(private payrollService: PayrollService) { }


  ngOnInit(): void {
    if (this.employeeId) {
      this.fetchEmployeeData(this.employeeId, this.period);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['employeeId'] && this.employeeId) {
      this.fetchEmployeeData(this.employeeId, this.period);
    }
  }

  fetchEmployeeData(id: number, period: string): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.payrollService.getEmployeeById(id).subscribe({ //add dynamic period here
      next: (res) => {
        // agar API { status, data, message } return karti hai:
        this.employeeData = res?.data || res;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load employee details';
        this.isLoading = false;
      }
    });
  }
  closeDetails() {
    this.close.emit();
  }

  confirmDelete() {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this timesheet?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteAll();
        Swal.fire('Deleted!', 'Timesheet has been deleted.', 'success');
      }
    });
  }

  saveDraft() {
    // TODO: API call to save draft
    Swal.fire('Saved!', 'Timesheet saved as draft.', 'success');
  }

  approveTimesheet() {
    // TODO: API call to approve timesheet
    Swal.fire('Approved!', 'Timesheet has been approved.', 'success');
  }



  addRow() {
    this.timesheet.push({
      earningRate: '',
      days: { fri: 0, sat: 0, sun: 0, mon: 0, tue: 0, wed: 0, thu: 0 },
      hours: 0
    });
  }

  deleteRow(index: number) {
    this.timesheet.splice(index, 1);
  }

  deleteAll() {
    this.timesheet = [];
  }

  openProjectModal() {
    this.showProjectModal = true;
  }

  closeProjectModal() {
    this.showProjectModal = false;
    this.selectedProject = '';
  }

  addProjectRow() {
    if (this.selectedProject) {
      this.timesheet.push({
        earningRate: `Project - ${this.selectedProject}`,
        days: { fri: 0, sat: 0, sun: 0, mon: 0, tue: 0, wed: 0, thu: 0 },
        hours: 20.25
      });
      this.closeProjectModal();
    }
  }

}
