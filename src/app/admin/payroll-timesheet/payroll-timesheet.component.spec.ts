import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayrollTimesheetComponent } from './payroll-timesheet.component';

describe('PayrollTimesheetComponent', () => {
  let component: PayrollTimesheetComponent;
  let fixture: ComponentFixture<PayrollTimesheetComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PayrollTimesheetComponent]
    });
    fixture = TestBed.createComponent(PayrollTimesheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
