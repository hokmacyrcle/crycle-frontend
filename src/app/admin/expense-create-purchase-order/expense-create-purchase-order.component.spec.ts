import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseCreatePurchaseOrderComponent } from './expense-create-purchase-order.component';

describe('ExpenseCreatePurchaseOrderComponent', () => {
  let component: ExpenseCreatePurchaseOrderComponent;
  let fixture: ComponentFixture<ExpenseCreatePurchaseOrderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ExpenseCreatePurchaseOrderComponent]
    });
    fixture = TestBed.createComponent(ExpenseCreatePurchaseOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
