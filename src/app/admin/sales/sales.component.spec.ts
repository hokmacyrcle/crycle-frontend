import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SalesComponent } from './sales.component';

describe('SalesComponent', () => {
  let component: SalesComponent;
  let fixture: ComponentFixture<SalesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SalesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default active tab as overview', () => {
    expect(component.activeTab).toBe('overview');
  });

  it('should change active tab when setActiveTab is called', () => {
    component.setActiveTab('invoices');
    expect(component.activeTab).toBe('invoices');
  });
});
