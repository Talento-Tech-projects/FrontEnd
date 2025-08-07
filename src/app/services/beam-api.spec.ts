import { TestBed } from '@angular/core/testing';

import { BeamApi } from './beam-api';

describe('BeamApi', () => {
  let service: BeamApi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BeamApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
