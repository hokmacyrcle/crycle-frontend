import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GetallinvoicesComponent } from './getallinvoices.component';

describe('GetallinvoicesComponent', () => {
  let component: GetallinvoicesComponent;
  let fixture: ComponentFixture<GetallinvoicesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GetallinvoicesComponent]
    });
    fixture = TestBed.createComponent(GetallinvoicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
