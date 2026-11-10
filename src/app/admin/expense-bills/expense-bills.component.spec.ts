import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseBillsComponent } from './expense-bills.component';

describe('ExpenseBillsComponent', () => {
  let component: ExpenseBillsComponent;
  let fixture: ComponentFixture<ExpenseBillsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ExpenseBillsComponent]
    });
    fixture = TestBed.createComponent(ExpenseBillsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
