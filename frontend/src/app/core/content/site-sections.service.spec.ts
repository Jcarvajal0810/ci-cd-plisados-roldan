import { TestBed } from '@angular/core/testing';
import { Observable, of, throwError } from 'rxjs';
import { PublicApiClient } from '../api/public-api.client';
import { SiteSectionsService } from './site-sections.service';

function setUp(successCases: Observable<unknown[]>, testimonials: Observable<unknown[]>) {
  TestBed.configureTestingModule({
    providers: [
      {
        provide: PublicApiClient,
        useValue: { successCases: () => successCases, testimonials: () => testimonials },
      },
    ],
  });
  return TestBed.inject(SiteSectionsService);
}

describe('SiteSectionsService', () => {
  it('reports the sections that have published content', () => {
    const sections = setUp(of([{}]), of([]));

    expect(sections.hasSuccessCases()).toBe(true);
    expect(sections.hasTestimonials()).toBe(false);
  });

  it('hides both sections when the API fails', () => {
    const fail = throwError(() => new Error('down'));
    const sections = setUp(fail, fail);

    expect(sections.hasSuccessCases()).toBe(false);
    expect(sections.hasTestimonials()).toBe(false);
  });
});
