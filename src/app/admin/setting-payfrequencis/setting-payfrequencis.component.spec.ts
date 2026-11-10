import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingPayfrequencisComponent } from './setting-payfrequencis.component';

describe('SettingPayfrequencisComponent', () => {
  let component: SettingPayfrequencisComponent;
  let fixture: ComponentFixture<SettingPayfrequencisComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SettingPayfrequencisComponent]
    });
    fixture = TestBed.createComponent(SettingPayfrequencisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
