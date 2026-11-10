import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpeningbalanceComponent } from './openingbalance.component';

describe('OpeningbalanceComponent', () => {
  let component: OpeningbalanceComponent;
  let fixture: ComponentFixture<OpeningbalanceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OpeningbalanceComponent]
    });
    fixture = TestBed.createComponent(OpeningbalanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
