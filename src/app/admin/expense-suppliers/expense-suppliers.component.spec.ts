import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseSuppliersComponent } from './expense-suppliers.component';

describe('ExpenseSuppliersComponent', () => {
  let component: ExpenseSuppliersComponent;
  let fixture: ComponentFixture<ExpenseSuppliersComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ExpenseSuppliersComponent]
    });
    fixture = TestBed.createComponent(ExpenseSuppliersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
