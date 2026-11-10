import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseCreateSupplierCreditComponent } from './expense-create-supplier-credit.component';

describe('ExpenseCreateSupplierCreditComponent', () => {
  let component: ExpenseCreateSupplierCreditComponent;
  let fixture: ComponentFixture<ExpenseCreateSupplierCreditComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ExpenseCreateSupplierCreditComponent]
    });
    fixture = TestBed.createComponent(ExpenseCreateSupplierCreditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
