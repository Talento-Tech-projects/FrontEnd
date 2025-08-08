import { TestBed } from '@angular/core/testing';

import { BeamApiService } from './beam-api';

describe('BeamApi', () => {
  let service: BeamApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BeamApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
