import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  AdminOffering,
  AdminSuccessCase,
  AdminTestimonial,
  BusinessProfile,
  Image,
  OfferingInput,
  SuccessCaseInput,
  TestimonialInput,
} from './models';

/** Base path of an item's image gallery, e.g. `/api/admin/offerings/5/images`. */
export type GalleryPath = `/api/admin/${string}/images`;

export const offeringGallery = (offeringId: number): GalleryPath =>
  `/api/admin/offerings/${offeringId}/images`;

export const successCaseGallery = (successCaseId: number): GalleryPath =>
  `/api/admin/success-cases/${successCaseId}/images`;

/** Client for the authenticated admin API (contracts/openapi.yaml, tag "admin"). */
@Injectable({ providedIn: 'root' })
export class AdminApiClient {
  private readonly http = inject(HttpClient);

  offerings(): Observable<AdminOffering[]> {
    return this.http.get<AdminOffering[]>('/api/admin/offerings');
  }

  offering(id: number): Observable<AdminOffering> {
    return this.http.get<AdminOffering>(`/api/admin/offerings/${id}`);
  }

  createOffering(input: OfferingInput): Observable<AdminOffering> {
    return this.http.post<AdminOffering>('/api/admin/offerings', input);
  }

  updateOffering(id: number, input: OfferingInput): Observable<AdminOffering> {
    return this.http.put<AdminOffering>(`/api/admin/offerings/${id}`, input);
  }

  deleteOffering(id: number): Observable<void> {
    return this.http.delete<void>(`/api/admin/offerings/${id}`);
  }

  setOfferingPublished(id: number, published: boolean): Observable<void> {
    return this.http.put<void>(`/api/admin/offerings/${id}/publication`, { published });
  }

  reorderOfferings(ids: number[]): Observable<void> {
    return this.http.put<void>('/api/admin/offerings/order', { ids });
  }

  uploadImage(gallery: GalleryPath, file: File, altText?: string): Observable<Image> {
    const body = new FormData();
    body.append('file', file);
    if (altText) {
      body.append('altText', altText);
    }
    return this.http.post<Image>(gallery, body);
  }

  reorderImages(gallery: GalleryPath, ids: number[]): Observable<void> {
    return this.http.put<void>(`${gallery}/order`, { ids });
  }

  updateImageAlt(gallery: GalleryPath, imageId: number, altText: string | null): Observable<Image> {
    return this.http.patch<Image>(`${gallery}/${imageId}`, { altText });
  }

  deleteImage(gallery: GalleryPath, imageId: number): Observable<void> {
    return this.http.delete<void>(`${gallery}/${imageId}`);
  }

  successCases(): Observable<AdminSuccessCase[]> {
    return this.http.get<AdminSuccessCase[]>('/api/admin/success-cases');
  }

  successCase(id: number): Observable<AdminSuccessCase> {
    return this.http.get<AdminSuccessCase>(`/api/admin/success-cases/${id}`);
  }

  createSuccessCase(input: SuccessCaseInput): Observable<AdminSuccessCase> {
    return this.http.post<AdminSuccessCase>('/api/admin/success-cases', input);
  }

  updateSuccessCase(id: number, input: SuccessCaseInput): Observable<AdminSuccessCase> {
    return this.http.put<AdminSuccessCase>(`/api/admin/success-cases/${id}`, input);
  }

  deleteSuccessCase(id: number): Observable<void> {
    return this.http.delete<void>(`/api/admin/success-cases/${id}`);
  }

  setSuccessCasePublished(id: number, published: boolean): Observable<void> {
    return this.http.put<void>(`/api/admin/success-cases/${id}/publication`, { published });
  }

  reorderSuccessCases(ids: number[]): Observable<void> {
    return this.http.put<void>('/api/admin/success-cases/order', { ids });
  }

  testimonials(): Observable<AdminTestimonial[]> {
    return this.http.get<AdminTestimonial[]>('/api/admin/testimonials');
  }

  testimonial(id: number): Observable<AdminTestimonial> {
    return this.http.get<AdminTestimonial>(`/api/admin/testimonials/${id}`);
  }

  createTestimonial(input: TestimonialInput): Observable<AdminTestimonial> {
    return this.http.post<AdminTestimonial>('/api/admin/testimonials', input);
  }

  updateTestimonial(id: number, input: TestimonialInput): Observable<AdminTestimonial> {
    return this.http.put<AdminTestimonial>(`/api/admin/testimonials/${id}`, input);
  }

  deleteTestimonial(id: number): Observable<void> {
    return this.http.delete<void>(`/api/admin/testimonials/${id}`);
  }

  setTestimonialPublished(id: number, published: boolean): Observable<void> {
    return this.http.put<void>(`/api/admin/testimonials/${id}/publication`, { published });
  }

  reorderTestimonials(ids: number[]): Observable<void> {
    return this.http.put<void>('/api/admin/testimonials/order', { ids });
  }

  setTestimonialPhoto(id: number, file: File): Observable<Image> {
    const body = new FormData();
    body.append('file', file);
    return this.http.put<Image>(`/api/admin/testimonials/${id}/photo`, body);
  }

  deleteTestimonialPhoto(id: number): Observable<void> {
    return this.http.delete<void>(`/api/admin/testimonials/${id}/photo`);
  }

  profile(): Observable<BusinessProfile> {
    return this.http.get<BusinessProfile>('/api/admin/profile');
  }

  saveProfile(profile: BusinessProfile): Observable<BusinessProfile> {
    return this.http.put<BusinessProfile>('/api/admin/profile', profile);
  }
}
