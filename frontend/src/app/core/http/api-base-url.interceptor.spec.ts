import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { API_INTERNAL_URL, apiBaseUrlInterceptor } from './api-base-url.interceptor';

function setUp(platform: 'server' | 'browser') {
  TestBed.configureTestingModule({
    providers: [
      { provide: PLATFORM_ID, useValue: platform },
      { provide: API_INTERNAL_URL, useValue: 'http://backend:8080' },
      provideHttpClient(withInterceptors([apiBaseUrlInterceptor])),
      provideHttpClientTesting(),
    ],
  });
  return {
    http: TestBed.inject(HttpClient),
    backend: TestBed.inject(HttpTestingController),
  };
}

describe('apiBaseUrlInterceptor', () => {
  afterEach(() => TestBed.inject(HttpTestingController).verify());

  it('prefixes /api calls with the internal backend URL on the server', () => {
    const { http, backend } = setUp('server');
    http.get('/api/public/home').subscribe();
    backend.expectOne('http://backend:8080/api/public/home').flush({});
  });

  it('prefixes /sitemap.xml on the server', () => {
    const { http, backend } = setUp('server');
    http.get('/sitemap.xml', { responseType: 'text' }).subscribe();
    backend.expectOne('http://backend:8080/sitemap.xml').flush('');
  });

  it('leaves other URLs untouched on the server', () => {
    const { http, backend } = setUp('server');
    http.get('https://example.com/x').subscribe();
    backend.expectOne('https://example.com/x').flush({});
  });

  it('leaves relative URLs untouched in the browser', () => {
    const { http, backend } = setUp('browser');
    http.get('/api/public/home').subscribe();
    backend.expectOne('/api/public/home').flush({});
  });
});
