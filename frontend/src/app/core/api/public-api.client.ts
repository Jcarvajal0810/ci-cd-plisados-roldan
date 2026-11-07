import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, of, throwError } from 'rxjs';
import {
  BusinessProfile,
  HomeView,
  OfferingDetail,
  OfferingSummary,
  SuccessCaseDetail,
  SuccessCaseSummary,
  Testimonial,
} from './models';

/** Read-only client for the public API (contracts/openapi.yaml, tag "public"). */
@Injectable({ providedIn: 'root' })
export class PublicApiClient {
  private readonly http = inject(HttpClient);

  home(): Observable<HomeView> {
    return this.http.get<HomeView>('/api/public/home');
  }

  profile(): Observable<BusinessProfile> {
    return this.http.get<BusinessProfile>('/api/public/profile');
  }

  offerings(): Observable<OfferingSummary[]> {
    return this.http.get<OfferingSummary[]>('/api/public/offerings');
  }

  successCases(): Observable<SuccessCaseSummary[]> {
    return this.http.get<SuccessCaseSummary[]>('/api/public/success-cases');
  }

  /** The published success case, or `null` when it does not exist or is not published. */
  successCase(slug: string): Observable<SuccessCaseDetail | null> {
    return this.http
      .get<SuccessCaseDetail>(`/api/public/success-cases/${encodeURIComponent(slug)}`)
      .pipe(catchError(nullOnNotFound));
  }

  testimonials(): Observable<Testimonial[]> {
    return this.http.get<Testimonial[]>('/api/public/testimonials');
  }

  /** The published offering, or `null` when it does not exist or is not published. */
  offering(slug: string): Observable<OfferingDetail | null> {
    return this.http
      .get<OfferingDetail>(`/api/public/offerings/${encodeURIComponent(slug)}`)
      .pipe(catchError(nullOnNotFound));
  }
}

function nullOnNotFound(error: unknown): Observable<null> {
  return error instanceof HttpErrorResponse && error.status === 404
    ? of(null)
    : throwError(() => error);
}
