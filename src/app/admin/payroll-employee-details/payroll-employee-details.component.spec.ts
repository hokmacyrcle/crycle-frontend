import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayrollEmployeeDetailsComponent } from './payroll-employee-details.component';

describe('PayrollEmployeeDetailsComponent', () => {
  let component: PayrollEmployeeDetailsComponent;
  let fixture: ComponentFixture<PayrollEmployeeDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PayrollEmployeeDetailsComponent]
    });
    fixture = TestBed.createComponent(PayrollEmployeeDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
