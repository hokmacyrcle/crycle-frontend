import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { InvoiceViewEditComponent } from './invoice-view-edit.component';
import { InvoiceService } from 'src/app/services/invoice.service';

describe('InvoiceViewEditComponent', () => {
  let component: InvoiceViewEditComponent;
  let fixture: ComponentFixture<InvoiceViewEditComponent>;
  let mockInvoiceService: jasmine.SpyObj<InvoiceService>;
  let mockActivatedRoute: jasmine.SpyObj<ActivatedRoute>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const invoiceServiceSpy = jasmine.createSpyObj('InvoiceService', [
      'getinvoicesById', 'getDropdownData', 'getProducts', 'getContactDetails'
    ]);
    const activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: { paramMap: { get: () => '13' } }
    });
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [ InvoiceViewEditComponent ],
      providers: [
        { provide: InvoiceService, useValue: invoiceServiceSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        { provide: Router, useValue: routerSpy }
      ]
    })
    .compileComponents();

    mockInvoiceService = TestBed.inject(InvoiceService) as jasmine.SpyObj<InvoiceService>;
    mockActivatedRoute = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  beforeEach(() => {
    // Setup default mock responses
    mockInvoiceService.getinvoicesById.and.returnValue(of({
      status: true,
      data: {
        id: 13,
        company_id: 1,
        sent_to: 1,
        invoice_date: '2024-01-01',
        invoice_due_date: '2024-01-31',
        payment_term_id: 1,
        discount_type: null,
        discount_method: null,
        discount_value: null,
        items: [],
        notes: 'Test invoice',
        terms: 'Net 30',
        total_amount: 100,
        status: 'Draft'
      }
    }));
    
    mockInvoiceService.getDropdownData.and.returnValue(of({
      success: true,
      data: {
        contacts: [{ id: 1, 'Contact Name': 'Test Customer' }],
        payment_terms: [{ id: 1, text: 'Net 30', description: 'Payment due in 30 days' }]
      }
    }));
    
    mockInvoiceService.getProducts.and.returnValue(of({
      success: true,
      data: { items: [] }
    }));

    fixture = TestBed.createComponent(InvoiceViewEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load invoice with ID 13', () => {
    expect(component.invoiceId).toBe(13);
    expect(mockInvoiceService.getinvoicesById).toHaveBeenCalledWith(13);
  });

  it('should start in view mode', () => {
    expect(component.isEditMode).toBeFalse();
  });

  it('should toggle edit mode', () => {
    component.toggleEditMode();
    expect(component.isEditMode).toBeTrue();
    
    component.toggleEditMode();
    expect(component.isEditMode).toBeFalse();
  });

  it('should navigate back to invoices list', () => {
    component.goBack();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin/getallinvoices']);
  });
});
