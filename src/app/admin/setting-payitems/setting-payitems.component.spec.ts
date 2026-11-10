import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingPayitemsComponent } from './setting-payitems.component';

describe('SettingPayitemsComponent', () => {
  let component: SettingPayitemsComponent;
  let fixture: ComponentFixture<SettingPayitemsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SettingPayitemsComponent]
    });
    fixture = TestBed.createComponent(SettingPayitemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
