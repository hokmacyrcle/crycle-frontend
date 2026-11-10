import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BanktransactionsComponent } from './banktransactions.component';

describe('BanktransactionsComponent', () => {
  let component: BanktransactionsComponent;
  let fixture: ComponentFixture<BanktransactionsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BanktransactionsComponent]
    });
    fixture = TestBed.createComponent(BanktransactionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
