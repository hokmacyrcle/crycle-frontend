import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingSuperannuationComponent } from './setting-superannuation.component';

describe('SettingSuperannuationComponent', () => {
  let component: SettingSuperannuationComponent;
  let fixture: ComponentFixture<SettingSuperannuationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SettingSuperannuationComponent]
    });
    fixture = TestBed.createComponent(SettingSuperannuationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
