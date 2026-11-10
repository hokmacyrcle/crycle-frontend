import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaytemplateComponent } from './paytemplate.component';

describe('PaytemplateComponent', () => {
  let component: PaytemplateComponent;
  let fixture: ComponentFixture<PaytemplateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PaytemplateComponent]
    });
    fixture = TestBed.createComponent(PaytemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
