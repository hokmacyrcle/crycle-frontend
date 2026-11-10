import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingHolidaysComponent } from './setting-holidays.component';

describe('SettingHolidaysComponent', () => {
  let component: SettingHolidaysComponent;
  let fixture: ComponentFixture<SettingHolidaysComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SettingHolidaysComponent]
    });
    fixture = TestBed.createComponent(SettingHolidaysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
