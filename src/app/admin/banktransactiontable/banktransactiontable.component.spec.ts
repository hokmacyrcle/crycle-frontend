import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BanktransactiontableComponent } from './banktransactiontable.component';

describe('BanktransactiontableComponent', () => {
  let component: BanktransactiontableComponent;
  let fixture: ComponentFixture<BanktransactiontableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BanktransactiontableComponent]
    });
    fixture = TestBed.createComponent(BanktransactiontableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
