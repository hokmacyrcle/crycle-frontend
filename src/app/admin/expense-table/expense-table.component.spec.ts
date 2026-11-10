import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseTableComponent } from './expense-table.component';

describe('ExpenseTableComponent', () => {
  let component: ExpenseTableComponent;
  let fixture: ComponentFixture<ExpenseTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ExpenseTableComponent]
    });
    fixture = TestBed.createComponent(ExpenseTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
