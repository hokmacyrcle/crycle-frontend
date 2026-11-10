import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { QuoteViewComponent } from './quote-view.component';
import { QuotesService } from 'src/app/services/quotes.service';

describe('QuoteViewComponent', () => {
  let component: QuoteViewComponent;
  let fixture: ComponentFixture<QuoteViewComponent>;
  let mockQuotesService: jasmine.SpyObj<QuotesService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;

  beforeEach(async () => {
    mockQuotesService = jasmine.createSpyObj('QuotesService', ['getQuoteById', 'convertQuoteToInvoice']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockActivatedRoute = {
      params: of({ id: '1' })
    };

    await TestBed.configureTestingModule({
      declarations: [ QuoteViewComponent ],
      providers: [
        { provide: QuotesService, useValue: mockQuotesService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QuoteViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load quote on init', () => {
    const mockQuoteData = { id: 1, quote_number: 'Q001' };
    mockQuotesService.getQuoteById.and.returnValue(of({ data: mockQuoteData }));

    component.ngOnInit();

    expect(mockQuotesService.getQuoteById).toHaveBeenCalledWith(1);
    expect(component.quoteData).toEqual(mockQuoteData);
  });

  it('should navigate back to quotes', () => {
    component.goBack();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin/quotes']);
  });

  it('should navigate to edit quote', () => {
    component.quoteId = 1;
    component.editQuote();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin/quote-edit', 1]);
  });
});
