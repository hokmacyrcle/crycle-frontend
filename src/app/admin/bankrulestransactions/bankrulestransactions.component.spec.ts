import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BankrulestransactionsComponent } from './bankrulestransactions.component';

describe('BankrulestransactionsComponent', () => {
  let component: BankrulestransactionsComponent;
  let fixture: ComponentFixture<BankrulestransactionsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BankrulestransactionsComponent]
    });
    fixture = TestBed.createComponent(BankrulestransactionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
