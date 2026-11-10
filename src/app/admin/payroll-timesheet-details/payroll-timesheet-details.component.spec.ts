import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayrollTimesheetDetailsComponent } from './payroll-timesheet-details.component';

describe('PayrollTimesheetDetailsComponent', () => {
  let component: PayrollTimesheetDetailsComponent;
  let fixture: ComponentFixture<PayrollTimesheetDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PayrollTimesheetDetailsComponent]
    });
    fixture = TestBed.createComponent(PayrollTimesheetDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
