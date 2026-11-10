import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseCreateChequeComponent } from './expense-create-cheque.component';

describe('ExpenseCreateChequeComponent', () => {
  let component: ExpenseCreateChequeComponent;
  let fixture: ComponentFixture<ExpenseCreateChequeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ExpenseCreateChequeComponent]
    });
    fixture = TestBed.createComponent(ExpenseCreateChequeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
