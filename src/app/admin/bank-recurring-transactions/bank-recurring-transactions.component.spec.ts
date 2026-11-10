import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BankRecurringTransactionsComponent } from './bank-recurring-transactions.component';

describe('BankRecurringTransactionsComponent', () => {
  let component: BankRecurringTransactionsComponent;
  let fixture: ComponentFixture<BankRecurringTransactionsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BankRecurringTransactionsComponent]
    });
    fixture = TestBed.createComponent(BankRecurringTransactionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
