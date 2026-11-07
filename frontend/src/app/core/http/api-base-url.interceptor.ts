import { isPlatformServer } from '@angular/common';
import { HttpInterceptorFn } from '@angular/common/http';
import { InjectionToken, PLATFORM_ID, inject } from '@angular/core';

/** Backend URL reachable from the SSR server (e.g. http://backend:8080). Server only. */
export const API_INTERNAL_URL = new InjectionToken<string>('API_INTERNAL_URL');

const BACKEND_PATHS = ['/api/', '/sitemap.xml'];

/**
 * During server-side rendering there is no browser origin, so relative backend URLs are sent
 * straight to the backend's internal URL (research R5). In the browser, relative URLs go through
 * the SSR server's proxy and stay unchanged.
 */
export const apiBaseUrlInterceptor: HttpInterceptorFn = (request, next) => {
  if (!isPlatformServer(inject(PLATFORM_ID))) {
    return next(request);
  }
  const isBackendCall = BACKEND_PATHS.some((path) => request.url.startsWith(path));
  if (!isBackendCall) {
    return next(request);
  }
  const baseUrl = inject(API_INTERNAL_URL).replace(/\/$/, '');
  return next(request.clone({ url: baseUrl + request.url }));
};
