import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuoteViewEditComponent } from './quote-view-edit.component';

describe('QuoteViewEditComponent', () => {
  let component: QuoteViewEditComponent;
  let fixture: ComponentFixture<QuoteViewEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuoteViewEditComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuoteViewEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
