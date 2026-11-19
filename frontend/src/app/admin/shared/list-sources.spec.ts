import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { firstValueFrom, of } from 'rxjs';
import { AdminApiClient } from '../../core/api/admin-api.client';
import { ConfirmService } from '../../shared/ui/confirm.service';
import { SuccessCasesListPage } from '../success-cases/success-cases-list.page';
import { TestimonialsListPage } from '../testimonials/testimonials-list.page';
import { AdminListSource } from './admin-content-list.component';

interface Case {
  name: string;
  page: Type<unknown>;
  list: string;
  reorder: string;
  publish: string;
  remove: string;
  rows: Record<string, unknown>[];
  expected: Record<string, unknown>;
  question: string;
}

const cases: Case[] = [
  {
    name: 'TestimonialsListPage',
    page: TestimonialsListPage,
    list: 'testimonials',
    reorder: 'reorderTestimonials',
    publish: 'setTestimonialPublished',
    remove: 'deleteTestimonial',
    rows: [{ id: 3, clientName: 'Laura', published: true, featured: false }],
    expected: {
      id: 3,
      title: 'Laura',
      published: true,
      featured: false,
      editLink: ['/admin/testimonios', 3],
    },
    question: '¿Eliminar el testimonio de "Laura"?',
  },
  {
    name: 'SuccessCasesListPage',
    page: SuccessCasesListPage,
    list: 'successCases',
    reorder: 'reorderSuccessCases',
    publish: 'setSuccessCasePublished',
    remove: 'deleteSuccessCase',
    rows: [{ id: 3, title: 'Boda', published: false, featured: true, images: [{}, {}] }],
    expected: {
      id: 3,
      title: 'Boda',
      published: false,
      featured: true,
      photoCount: 2,
      editLink: ['/admin/casos', 3],
    },
    question: '¿Eliminar el caso "Boda" y sus fotos?',
  },
];

describe.each(cases)('$name', (c) => {
  async function render() {
    const api = {
      [c.list]: vi.fn(() => of(c.rows)),
      [c.reorder]: vi.fn(() => of(undefined)),
      [c.publish]: vi.fn(() => of(undefined)),
      [c.remove]: vi.fn(() => of(undefined)),
    };
    await TestBed.configureTestingModule({
      imports: [c.page],
      providers: [
        provideRouter([]),
        { provide: AdminApiClient, useValue: api },
        { provide: ConfirmService, useValue: { ask: vi.fn(() => Promise.resolve(true)) } },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(c.page);
    fixture.detectChanges();
    await fixture.whenStable();
    const source = (fixture.componentInstance as { source: AdminListSource }).source;
    return { api, source, el: fixture.nativeElement as HTMLElement };
  }

  it('lists the items with their edit links', async () => {
    const { source, el } = await render();

    expect(await firstValueFrom(source.load())).toEqual([c.expected]);
    expect(el.textContent).toContain(String(c.expected['title']));
  });

  it('delegates reorder, publish and delete to the API', async () => {
    const { api, source } = await render();

    source.reorder([3, 1]).subscribe();
    source.setPublished(3, true).subscribe();
    source.remove(3).subscribe();

    expect(api[c.reorder]).toHaveBeenCalledWith([3, 1]);
    expect(api[c.publish]).toHaveBeenCalledWith(3, true);
    expect(api[c.remove]).toHaveBeenCalledWith(3);
  });

  it('names the item in the delete question', async () => {
    const { source } = await render();
    const [item] = await firstValueFrom(source.load());

    expect(source.deleteQuestion(item)).toBe(c.question);
  });
});
