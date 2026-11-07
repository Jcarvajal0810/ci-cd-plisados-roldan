import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { AdminApiClient, offeringGallery, successCaseGallery } from './admin-api.client';

describe('AdminApiClient', () => {
  let client: AdminApiClient;
  let backend: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    client = TestBed.inject(AdminApiClient);
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => backend.verify());

  const input = { name: 'Plisado', summary: 'S', description: 'D', referencePriceCop: null };

  it('lists, gets, creates, updates and deletes offerings', async () => {
    const list = firstValueFrom(client.offerings());
    backend.expectOne({ method: 'GET', url: '/api/admin/offerings' }).flush([]);
    expect(await list).toEqual([]);

    const one = firstValueFrom(client.offering(5));
    backend.expectOne({ method: 'GET', url: '/api/admin/offerings/5' }).flush({ id: 5 });
    expect(await one).toEqual({ id: 5 });

    const created = firstValueFrom(client.createOffering(input));
    const post = backend.expectOne({ method: 'POST', url: '/api/admin/offerings' });
    expect(post.request.body).toEqual(input);
    post.flush({ id: 7 });
    expect(await created).toEqual({ id: 7 });

    const updated = firstValueFrom(client.updateOffering(7, input));
    backend.expectOne({ method: 'PUT', url: '/api/admin/offerings/7' }).flush({ id: 7 });
    await updated;

    const deleted = firstValueFrom(client.deleteOffering(7));
    backend.expectOne({ method: 'DELETE', url: '/api/admin/offerings/7' }).flush(null);
    await deleted;
  });

  it('sets publication and order', async () => {
    const published = firstValueFrom(client.setOfferingPublished(5, true));
    const put = backend.expectOne({ method: 'PUT', url: '/api/admin/offerings/5/publication' });
    expect(put.request.body).toEqual({ published: true });
    put.flush(null);
    await published;

    const ordered = firstValueFrom(client.reorderOfferings([3, 1, 2]));
    const order = backend.expectOne({ method: 'PUT', url: '/api/admin/offerings/order' });
    expect(order.request.body).toEqual({ ids: [3, 1, 2] });
    order.flush(null);
    await ordered;
  });

  it('manages gallery images through a gallery path', async () => {
    const gallery = offeringGallery(5);
    const file = new File([new Uint8Array([1, 2, 3])], 'foto.jpg', { type: 'image/jpeg' });

    const uploaded = firstValueFrom(client.uploadImage(gallery, file, 'Detalle'));
    const upload = backend.expectOne({ method: 'POST', url: '/api/admin/offerings/5/images' });
    const body = upload.request.body as FormData;
    expect(body.get('file')).toBeInstanceOf(File);
    expect(body.get('altText')).toBe('Detalle');
    upload.flush({ id: 9 });
    expect(await uploaded).toEqual({ id: 9 });

    const reordered = firstValueFrom(client.reorderImages(gallery, [9, 8]));
    const order = backend.expectOne({ method: 'PUT', url: '/api/admin/offerings/5/images/order' });
    expect(order.request.body).toEqual({ ids: [9, 8] });
    order.flush(null);
    await reordered;

    const alt = firstValueFrom(client.updateImageAlt(gallery, 9, 'Nuevo'));
    const patch = backend.expectOne({ method: 'PATCH', url: '/api/admin/offerings/5/images/9' });
    expect(patch.request.body).toEqual({ altText: 'Nuevo' });
    patch.flush({ id: 9 });
    await alt;

    const removed = firstValueFrom(client.deleteImage(gallery, 9));
    backend.expectOne({ method: 'DELETE', url: '/api/admin/offerings/5/images/9' }).flush(null);
    await removed;
  });

  it('manages success cases and their gallery path', async () => {
    const caseInput = {
      title: 'Pasarela',
      clientName: 'Marca',
      description: 'D',
      featured: true,
      offeringIds: [1],
    };
    const list = firstValueFrom(client.successCases());
    backend.expectOne({ method: 'GET', url: '/api/admin/success-cases' }).flush([]);
    await list;

    const created = firstValueFrom(client.createSuccessCase(caseInput));
    const post = backend.expectOne({ method: 'POST', url: '/api/admin/success-cases' });
    expect(post.request.body).toEqual(caseInput);
    post.flush({ id: 3 });
    await created;

    const updated = firstValueFrom(client.updateSuccessCase(3, caseInput));
    backend.expectOne({ method: 'PUT', url: '/api/admin/success-cases/3' }).flush({ id: 3 });
    await updated;

    const published = firstValueFrom(client.setSuccessCasePublished(3, true));
    backend.expectOne({ method: 'PUT', url: '/api/admin/success-cases/3/publication' }).flush(null);
    await published;

    const ordered = firstValueFrom(client.reorderSuccessCases([3]));
    backend.expectOne({ method: 'PUT', url: '/api/admin/success-cases/order' }).flush(null);
    await ordered;

    const deleted = firstValueFrom(client.deleteSuccessCase(3));
    backend.expectOne({ method: 'DELETE', url: '/api/admin/success-cases/3' }).flush(null);
    await deleted;

    expect(successCaseGallery(3)).toBe('/api/admin/success-cases/3/images');
  });

  it('manages testimonials and their single photo', async () => {
    const input = { clientName: 'Laura', company: null, quote: 'Gracias', featured: false };
    const created = firstValueFrom(client.createTestimonial(input));
    backend.expectOne({ method: 'POST', url: '/api/admin/testimonials' }).flush({ id: 4 });
    await created;

    const one = firstValueFrom(client.testimonial(4));
    backend.expectOne({ method: 'GET', url: '/api/admin/testimonials/4' }).flush({ id: 4 });
    await one;

    const file = new File([new Uint8Array([1])], 'foto.jpg', { type: 'image/jpeg' });
    const photo = firstValueFrom(client.setTestimonialPhoto(4, file));
    const put = backend.expectOne({ method: 'PUT', url: '/api/admin/testimonials/4/photo' });
    expect((put.request.body as FormData).get('file')).toBeInstanceOf(File);
    put.flush({ id: 9 });
    await photo;

    const removed = firstValueFrom(client.deleteTestimonialPhoto(4));
    backend.expectOne({ method: 'DELETE', url: '/api/admin/testimonials/4/photo' }).flush(null);
    await removed;

    const list = firstValueFrom(client.testimonials());
    backend.expectOne({ method: 'GET', url: '/api/admin/testimonials' }).flush([]);
    await list;
  });

  it('reads and saves the business profile', async () => {
    const profile = firstValueFrom(client.profile());
    backend.expectOne({ method: 'GET', url: '/api/admin/profile' }).flush({ slogan: 's' });
    expect(await profile).toEqual({ slogan: 's' });

    const saved = firstValueFrom(client.saveProfile({ slogan: 'n' } as never));
    backend.expectOne({ method: 'PUT', url: '/api/admin/profile' }).flush({ slogan: 'n' });
    expect(await saved).toEqual({ slogan: 'n' });
  });
});
