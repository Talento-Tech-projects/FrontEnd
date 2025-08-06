// src/app/sites/beam-analysis/beam-analysis.spec.ts

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BeamAnalysis } from './beam-analysis';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('BeamAnalysis', () => {
  let component: BeamAnalysis;
  let fixture: ComponentFixture<BeamAnalysis>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BeamAnalysis],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BeamAnalysis);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});