import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayEmployeesDetailsComponent } from './pay-employees-details.component';

describe('PayEmployeesDetailsComponent', () => {
  let component: PayEmployeesDetailsComponent;
  let fixture: ComponentFixture<PayEmployeesDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PayEmployeesDetailsComponent]
    });
    fixture = TestBed.createComponent(PayEmployeesDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
