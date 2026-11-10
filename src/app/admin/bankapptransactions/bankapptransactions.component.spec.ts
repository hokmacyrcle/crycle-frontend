import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BankapptransactionsComponent } from './bankapptransactions.component';

describe('BankapptransactionsComponent', () => {
  let component: BankapptransactionsComponent;
  let fixture: ComponentFixture<BankapptransactionsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BankapptransactionsComponent]
    });
    fixture = TestBed.createComponent(BankapptransactionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
