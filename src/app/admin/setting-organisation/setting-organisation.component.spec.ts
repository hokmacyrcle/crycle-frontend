import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingOrganisationComponent } from './setting-organisation.component';

describe('SettingOrganisationComponent', () => {
  let component: SettingOrganisationComponent;
  let fixture: ComponentFixture<SettingOrganisationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SettingOrganisationComponent]
    });
    fixture = TestBed.createComponent(SettingOrganisationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
