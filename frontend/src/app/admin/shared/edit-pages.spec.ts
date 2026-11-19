import { Location } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { AdminApiClient } from '../../core/api/admin-api.client';
import { ConfirmService } from '../../shared/ui/confirm.service';
import { OfferingEditPage } from '../offerings/offering-edit.page';
import { SuccessCaseEditPage } from '../success-cases/success-case-edit.page';
import { TestimonialEditPage } from '../testimonials/testimonial-edit.page';

/** What the three edit pages expose to their templates; reached here through a cast. */
interface EditPage {
  save(input: unknown): void;
  togglePublished(current: unknown): Promise<void> | void;
  reload(id: number): void;
  status(): string;
  error(): string;
  serverErrors(): Record<string, string>;
}

interface Case {
  name: string;
  page: Type<unknown>;
  item: Record<string, unknown>;
  input: Record<string, unknown>;
  load: string;
  create: string;
  update: string;
  publish: string;
  path: string;
  loadError: string;
  asksBeforePublishingWithoutPhotos: boolean;
}

const image = { id: 9, url: '/m/a.jpg', srcset: '', width: 1, height: 1, alt: '' };
const meta = { published: false, displayOrder: 1, updatedAt: '2026-11-19T00:00:00Z' };

const cases: Case[] = [
  {
    name: 'OfferingEditPage',
    page: OfferingEditPage,
    item: {
      id: 5,
      slug: 'plisado',
      name: 'Plisado',
      summary: 's',
      description: 'd',
      referencePriceCop: null,
      images: [],
      ...meta,
    },
    input: { name: 'Plisado', summary: 's', description: 'd' },
    load: 'offering',
    create: 'createOffering',
    update: 'updateOffering',
    publish: 'setOfferingPublished',
    path: '/admin/servicios/5',
    loadError: 'No pudimos cargar el servicio.',
    asksBeforePublishingWithoutPhotos: true,
  },
  {
    name: 'SuccessCaseEditPage',
    page: SuccessCaseEditPage,
    item: {
      id: 5,
      slug: 'boda',
      title: 'Boda',
      clientName: 'Ana',
      description: 'd',
      eventLabel: null,
      eventDate: null,
      featured: false,
      offerings: [],
      offeringIds: [],
      images: [],
      ...meta,
    },
    input: { title: 'Boda', clientName: 'Ana', description: 'd', featured: false },
    load: 'successCase',
    create: 'createSuccessCase',
    update: 'updateSuccessCase',
    publish: 'setSuccessCasePublished',
    path: '/admin/casos/5',
    loadError: 'No pudimos cargar el caso.',
    asksBeforePublishingWithoutPhotos: true,
  },
  {
    name: 'TestimonialEditPage',
    page: TestimonialEditPage,
    item: {
      id: 5,
      clientName: 'Laura',
      company: null,
      quote: 'Excelente',
      featured: false,
      photo: null,
      ...meta,
    },
    input: { clientName: 'Laura', quote: 'Excelente', featured: false },
    load: 'testimonial',
    create: 'createTestimonial',
    update: 'updateTestimonial',
    publish: 'setTestimonialPublished',
    path: '/admin/testimonios/5',
    loadError: 'No pudimos cargar el testimonio.',
    asksBeforePublishingWithoutPhotos: false,
  },
];

const badRequest = new HttpErrorResponse({
  status: 400,
  error: { errors: { name: 'Demasiado largo' } },
});
const serverDown = new HttpErrorResponse({ status: 500 });

describe.each(cases)('$name', (c) => {
  let api: Record<string, ReturnType<typeof vi.fn>>;
  let confirm: { ask: ReturnType<typeof vi.fn> };
  let location: { replaceState: ReturnType<typeof vi.fn> };

  async function render(
    id?: string,
    load: () => Observable<unknown> = () => of({ ...c.item }),
  ): Promise<{ fixture: ComponentFixture<unknown>; page: EditPage }> {
    api = {
      offerings: vi.fn(() => of([{ id: 1, name: 'Plisado' }])),
      [c.load]: vi.fn(load),
      [c.create]: vi.fn(() => of({ ...c.item })),
      [c.update]: vi.fn(() => of({ ...c.item })),
      [c.publish]: vi.fn(() => of(undefined)),
    };
    confirm = { ask: vi.fn(() => Promise.resolve(true)) };
    location = { replaceState: vi.fn() };
    await TestBed.configureTestingModule({
      imports: [c.page],
      providers: [
        provideRouter([]),
        { provide: AdminApiClient, useValue: api },
        { provide: ConfirmService, useValue: confirm },
        { provide: Location, useValue: location },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(c.page);
    if (id) {
      fixture.componentRef.setInput('id', id);
    }
    fixture.detectChanges();
    await fixture.whenStable();
    return { fixture, page: fixture.componentInstance as EditPage };
  }

  it('starts empty on the "nuevo" route and does not load anything', async () => {
    const { page } = await render();

    expect(api[c.load]).not.toHaveBeenCalled();
    expect(page.status()).toBe('');
  });

  it('loads the item named by the route', async () => {
    const { fixture } = await render('5');

    expect(api[c.load]).toHaveBeenCalledWith(5);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Publicar');
  });

  it('shows an error when the item cannot be loaded', async () => {
    const { page } = await render('5', () => throwError(() => serverDown));

    expect(page.error()).toBe(c.loadError);
  });

  it('creates a new item and moves the URL to its id', async () => {
    const { page } = await render();

    page.save(c.input);

    expect(api[c.create]).toHaveBeenCalledWith(c.input);
    expect(page.status()).toBe('Guardado');
    expect(location.replaceState).toHaveBeenCalledWith(c.path);
  });

  it('updates an existing item without touching the URL', async () => {
    const { page } = await render('5');

    page.save(c.input);

    expect(api[c.update]).toHaveBeenCalledWith(5, c.input);
    expect(location.replaceState).not.toHaveBeenCalled();
  });

  it('shows field errors from a 400 response', async () => {
    const { page } = await render();
    api[c.create].mockReturnValue(throwError(() => badRequest));

    page.save(c.input);

    expect(page.serverErrors()).toEqual({ name: 'Demasiado largo' });
    expect(page.error()).toBe('Revisa los campos marcados.');
  });

  it('shows a generic error when saving fails for another reason', async () => {
    const { page } = await render();
    api[c.create].mockReturnValue(throwError(() => serverDown));

    page.save(c.input);

    expect(page.serverErrors()).toEqual({});
    expect(page.error()).toBe('No pudimos guardar. Inténtalo de nuevo.');
  });

  it('publishes and reloads the item', async () => {
    const { page } = await render('5');

    await page.togglePublished({ ...c.item });

    expect(api[c.publish]).toHaveBeenCalledWith(5, true);
    expect(page.status()).toBe('Publicado');
    expect(api[c.load]).toHaveBeenCalledTimes(2);
  });

  it('unpublishes a published item', async () => {
    const { page } = await render('5');

    await page.togglePublished({ ...c.item, published: true });

    expect(api[c.publish]).toHaveBeenCalledWith(5, false);
    expect(page.status()).toBe('Despublicado');
  });

  it('shows an error when publishing fails', async () => {
    const { page } = await render('5');
    api[c.publish].mockReturnValue(throwError(() => serverDown));

    await page.togglePublished({ ...c.item });

    expect(page.error()).toBe('No pudimos guardar. Inténtalo de nuevo.');
  });

  if (c.asksBeforePublishingWithoutPhotos) {
    it('does not publish an item without photos when the owner cancels', async () => {
      const { page } = await render('5');
      confirm.ask.mockResolvedValue(false);

      await page.togglePublished({ ...c.item, images: [] });

      expect(confirm.ask).toHaveBeenCalled();
      expect(api[c.publish]).not.toHaveBeenCalled();
    });

    it('publishes without asking when the item has photos', async () => {
      const { page } = await render('5');

      await page.togglePublished({ ...c.item, images: [image] });

      expect(confirm.ask).not.toHaveBeenCalled();
      expect(api[c.publish]).toHaveBeenCalledWith(5, true);
    });
  }
});
