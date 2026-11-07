import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { AdminApiClient } from '../../core/api/admin-api.client';
import { AdminOffering } from '../../core/api/models';
import { ConfirmService } from '../../shared/ui/confirm.service';
import { OfferingsListPage } from './offerings-list.page';

const offering = (id: number, name: string, published: boolean, images = 1): AdminOffering => ({
  id,
  slug: name.toLowerCase(),
  name,
  summary: 's',
  description: 'd',
  images: Array.from({ length: images }, (_, i) => ({
    id: id * 10 + i,
    url: '',
    srcset: '',
    width: 1,
    height: 1,
    alt: '',
  })),
  published,
  displayOrder: id,
  updatedAt: '2026-11-07T00:00:00Z',
});

async function render(confirmAnswer: boolean, items: AdminOffering[]) {
  const api = {
    offerings: vi.fn(() => of(items)),
    deleteOffering: vi.fn(() => of(undefined)),
    setOfferingPublished: vi.fn(() => of(undefined)),
    reorderOfferings: vi.fn(() => of(undefined)),
  };
  const confirm = { ask: vi.fn(() => Promise.resolve(confirmAnswer)) };
  await TestBed.configureTestingModule({
    imports: [OfferingsListPage],
    providers: [
      provideRouter([]),
      { provide: AdminApiClient, useValue: api },
      { provide: ConfirmService, useValue: confirm },
    ],
  }).compileComponents();
  const fixture = TestBed.createComponent(OfferingsListPage);
  await fixture.whenStable();
  fixture.detectChanges();
  return { fixture, api, confirm };
}

const click = async (fixture: ComponentFixture<unknown>, label: string) => {
  const el = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('button')).find(
    (b) => b.getAttribute('aria-label') === label,
  )!;
  el.click();
  await new Promise((resolve) => setTimeout(resolve));
};

describe('OfferingsListPage', () => {
  const items = [offering(1, 'Plisado', true), offering(2, 'Trillado', false, 0)];

  it('deletes only after confirmation naming the item', async () => {
    const { fixture, api, confirm } = await render(true, items);

    await click(fixture, 'Eliminar Plisado');

    expect(confirm.ask).toHaveBeenCalledWith(expect.stringContaining('Plisado'));
    expect(api.deleteOffering).toHaveBeenCalledWith(1);
  });

  it('does not delete when the owner cancels', async () => {
    const { fixture, api } = await render(false, items);
    await click(fixture, 'Eliminar Plisado');
    expect(api.deleteOffering).not.toHaveBeenCalled();
  });

  it('toggles publication', async () => {
    const { fixture, api } = await render(true, items);
    await click(fixture, 'Despublicar Plisado');
    expect(api.setOfferingPublished).toHaveBeenCalledWith(1, false);
  });

  it('warns before publishing an offering without photos', async () => {
    const { fixture, api, confirm } = await render(false, items);

    await click(fixture, 'Publicar Trillado');

    expect(confirm.ask).toHaveBeenCalledWith(expect.stringContaining('no tiene fotos'), 'Publicar');
    expect(api.setOfferingPublished).not.toHaveBeenCalled();
  });

  it('reorders with the full list of IDs', async () => {
    const { fixture, api } = await render(true, items);
    await click(fixture, 'Subir Trillado');
    expect(api.reorderOfferings).toHaveBeenCalledWith([2, 1]);
  });
});
