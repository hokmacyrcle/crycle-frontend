import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayEmployeesComponent } from './pay-employees.component';

describe('PayEmployeesComponent', () => {
  let component: PayEmployeesComponent;
  let fixture: ComponentFixture<PayEmployeesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PayEmployeesComponent]
    });
    fixture = TestBed.createComponent(PayEmployeesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
