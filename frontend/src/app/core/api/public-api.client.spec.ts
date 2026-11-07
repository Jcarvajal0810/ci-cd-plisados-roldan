import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { PublicApiClient } from './public-api.client';

describe('PublicApiClient', () => {
  let client: PublicApiClient;
  let backend: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    client = TestBed.inject(PublicApiClient);
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => backend.verify());

  it('loads the home view', async () => {
    const result = firstValueFrom(client.home());
    backend.expectOne('/api/public/home').flush({ offerings: [] });
    expect(await result).toEqual({ offerings: [] });
  });

  it('loads the profile', async () => {
    const result = firstValueFrom(client.profile());
    backend.expectOne('/api/public/profile').flush({ businessName: 'Plisados Roldán' });
    expect((await result).businessName).toBe('Plisados Roldán');
  });

  it('loads the offerings', async () => {
    const result = firstValueFrom(client.offerings());
    backend.expectOne('/api/public/offerings').flush([{ slug: 'plisado' }]);
    expect(await result).toHaveLength(1);
  });

  it('loads one offering by slug, URL-encoded', async () => {
    const result = firstValueFrom(client.offering('plisado'));
    backend.expectOne('/api/public/offerings/plisado').flush({ slug: 'plisado' });
    expect(await result).toEqual({ slug: 'plisado' });
  });

  it('maps a 404 offering to null', async () => {
    const result = firstValueFrom(client.offering('no-existe'));
    backend
      .expectOne('/api/public/offerings/no-existe')
      .flush({ status: 404 }, { status: 404, statusText: 'Not Found' });
    expect(await result).toBeNull();
  });

  it('loads success cases and testimonials', async () => {
    const cases = firstValueFrom(client.successCases());
    backend.expectOne('/api/public/success-cases').flush([{ slug: 'pasarela' }]);
    expect(await cases).toHaveLength(1);

    const quotes = firstValueFrom(client.testimonials());
    backend.expectOne('/api/public/testimonials').flush([]);
    expect(await quotes).toEqual([]);
  });

  it('loads one success case, mapping 404 to null', async () => {
    const found = firstValueFrom(client.successCase('pasarela'));
    backend.expectOne('/api/public/success-cases/pasarela').flush({ slug: 'pasarela' });
    expect(await found).toEqual({ slug: 'pasarela' });

    const missing = firstValueFrom(client.successCase('no-existe'));
    backend
      .expectOne('/api/public/success-cases/no-existe')
      .flush({}, { status: 404, statusText: 'Not Found' });
    expect(await missing).toBeNull();
  });

  it('propagates other errors', async () => {
    const result = firstValueFrom(client.offering('plisado'));
    backend
      .expectOne('/api/public/offerings/plisado')
      .flush({}, { status: 500, statusText: 'Server Error' });
    await expect(result).rejects.toBeTruthy();
  });
});
