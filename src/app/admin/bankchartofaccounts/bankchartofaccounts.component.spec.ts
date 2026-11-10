import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BankchartofaccountsComponent } from './bankchartofaccounts.component';

describe('BankchartofaccountsComponent', () => {
  let component: BankchartofaccountsComponent;
  let fixture: ComponentFixture<BankchartofaccountsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BankchartofaccountsComponent]
    });
    fixture = TestBed.createComponent(BankchartofaccountsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
