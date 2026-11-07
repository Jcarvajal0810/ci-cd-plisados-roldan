import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of } from 'rxjs';
import { PublicApiClient } from '../api/public-api.client';

/**
 * Which optional public sections have published content. Empty sections are hidden from the
 * navigation instead of shown empty (spec US3 acceptance scenario 5).
 */
@Injectable({ providedIn: 'root' })
export class SiteSectionsService {
  private readonly api = inject(PublicApiClient);

  readonly hasSuccessCases = toSignal(
    this.api.successCases().pipe(
      map((cases) => cases.length > 0),
      catchError(() => of(false)),
    ),
    { initialValue: false },
  );

  readonly hasTestimonials = toSignal(
    this.api.testimonials().pipe(
      map((testimonials) => testimonials.length > 0),
      catchError(() => of(false)),
    ),
    { initialValue: false },
  );
}
