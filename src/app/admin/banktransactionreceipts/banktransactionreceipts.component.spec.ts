import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BanktransactionreceiptsComponent } from './banktransactionreceipts.component';

describe('BanktransactionreceiptsComponent', () => {
  let component: BanktransactionreceiptsComponent;
  let fixture: ComponentFixture<BanktransactionreceiptsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BanktransactionreceiptsComponent]
    });
    fixture = TestBed.createComponent(BanktransactionreceiptsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
