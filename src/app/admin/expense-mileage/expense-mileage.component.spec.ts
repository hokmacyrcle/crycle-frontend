import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseMileageComponent } from './expense-mileage.component';

describe('ExpenseMileageComponent', () => {
  let component: ExpenseMileageComponent;
  let fixture: ComponentFixture<ExpenseMileageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ExpenseMileageComponent]
    });
    fixture = TestBed.createComponent(ExpenseMileageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
