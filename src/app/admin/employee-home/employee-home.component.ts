import { Component } from '@angular/core';
import { SessionService } from '../../core/session.service';

@Component({
  selector: 'app-employee-home',
  templateUrl: './employee-home.component.html',
})
export class EmployeeHomeComponent {
  constructor(public session: SessionService) {}

  // Phase 1 placeholder tiles. Wired to real screens in the payroll phase.
  tiles = [
    { label: 'My payslips', hint: 'Coming with payroll', icon: 'receipt_long' },
    { label: 'My leave', hint: 'Coming with payroll', icon: 'beach_access' },
    { label: 'My timesheets', hint: 'Coming with payroll', icon: 'schedule' },
    { label: 'My details', hint: 'Coming soon', icon: 'person' },
  ];
}
