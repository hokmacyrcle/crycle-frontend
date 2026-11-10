import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseCreateBillComponent } from './expense-create-bill.component';

describe('ExpenseCreateBillComponent', () => {
  let component: ExpenseCreateBillComponent;
  let fixture: ComponentFixture<ExpenseCreateBillComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ExpenseCreateBillComponent]
    });
    fixture = TestBed.createComponent(ExpenseCreateBillComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
