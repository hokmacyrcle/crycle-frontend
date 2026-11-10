import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpensePurchaseComponent } from './expense-purchase.component';

describe('ExpensePurchaseComponent', () => {
  let component: ExpensePurchaseComponent;
  let fixture: ComponentFixture<ExpensePurchaseComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ExpensePurchaseComponent]
    });
    fixture = TestBed.createComponent(ExpensePurchaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
