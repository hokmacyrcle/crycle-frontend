import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';

import { QuotesComponent } from './quotes.component';
import { QuotesService } from 'src/app/services/quotes.service';

describe('QuotesComponent', () => {
  let component: QuotesComponent;
  let fixture: ComponentFixture<QuotesComponent>;
  let quotesService: QuotesService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuotesComponent ],
      imports: [
        HttpClientTestingModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatFormFieldModule,
        MatInputModule,
        MatProgressSpinnerModule,
        MatDialogModule,
        FormsModule,
        BrowserAnimationsModule,
        RouterTestingModule
      ],
      providers: [ QuotesService ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuotesComponent);
    component = fixture.componentInstance;
    quotesService = TestBed.inject(QuotesService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default values', () => {
    expect(component.statusFilter).toBe('Pending');
    expect(component.dateFilter).toBe('Last 12 months');
    expect(component.sortBy).toBe('quote_date');
    expect(component.sortOrder).toBe('desc');
    expect(component.pageSize).toBe(15);
  });

  it('should have correct displayed columns', () => {
    const expectedColumns = [
      'id',
      'quote_date',
      'customer_name',
      'company_name',
      'reference_number',
      'total_amount',
      'status',
      'valid_until',
      'actions'
    ];
    expect(component.displayedColumns).toEqual(expectedColumns);
  });
});
