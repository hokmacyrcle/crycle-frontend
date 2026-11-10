import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayrollLeaveComponent } from './payroll-leave.component';

describe('PayrollLeaveComponent', () => {
  let component: PayrollLeaveComponent;
  let fixture: ComponentFixture<PayrollLeaveComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PayrollLeaveComponent]
    });
    fixture = TestBed.createComponent(PayrollLeaveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
