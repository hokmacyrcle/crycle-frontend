import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseCreateExpenseComponent } from './expense-create-expense.component';

describe('ExpenseCreateExpenseComponent', () => {
  let component: ExpenseCreateExpenseComponent;
  let fixture: ComponentFixture<ExpenseCreateExpenseComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ExpenseCreateExpenseComponent]
    });
    fixture = TestBed.createComponent(ExpenseCreateExpenseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
