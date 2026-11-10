import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GetallcustomerComponent } from './getallcustomer.component';

describe('GetallcustomerComponent', () => {
  let component: GetallcustomerComponent;
  let fixture: ComponentFixture<GetallcustomerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GetallcustomerComponent]
    });
    fixture = TestBed.createComponent(GetallcustomerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
