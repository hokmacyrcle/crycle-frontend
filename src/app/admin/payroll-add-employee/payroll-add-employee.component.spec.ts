import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayrollAddEmployeeComponent } from './payroll-add-employee.component';

describe('PayrollAddEmployeeComponent', () => {
  let component: PayrollAddEmployeeComponent;
  let fixture: ComponentFixture<PayrollAddEmployeeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PayrollAddEmployeeComponent]
    });
    fixture = TestBed.createComponent(PayrollAddEmployeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
