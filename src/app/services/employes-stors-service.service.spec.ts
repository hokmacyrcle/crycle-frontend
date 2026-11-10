import { TestBed } from '@angular/core/testing';

import { EmployesStorsServiceService } from './employes-stors-service.service';

describe('EmployesStorsServiceService', () => {
  let service: EmployesStorsServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmployesStorsServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
