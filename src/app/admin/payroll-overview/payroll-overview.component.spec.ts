import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayrollOverviewComponent } from './payroll-overview.component';

describe('PayrollOverviewComponent', () => {
  let component: PayrollOverviewComponent;
  let fixture: ComponentFixture<PayrollOverviewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PayrollOverviewComponent]
    });
    fixture = TestBed.createComponent(PayrollOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
