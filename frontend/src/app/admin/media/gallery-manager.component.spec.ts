import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AdminApiClient, offeringGallery } from '../../core/api/admin-api.client';
import { Image } from '../../core/api/models';
import { ConfirmService } from '../../shared/ui/confirm.service';
import { GalleryManagerComponent } from './gallery-manager.component';

const image = (id: number): Image => ({
  id,
  url: `/media/k${id}-960.jpg`,
  srcset: '',
  width: 960,
  height: 720,
  alt: `Foto ${id}`,
});

function setUp(confirmAnswer = true) {
  const api = {
    uploadImage: vi.fn(() => of(image(9))),
    reorderImages: vi.fn(() => of(undefined)),
    updateImageAlt: vi.fn(() => of(image(1))),
    deleteImage: vi.fn(() => of(undefined)),
  };
  const confirm = { ask: vi.fn(() => Promise.resolve(confirmAnswer)) };
  TestBed.configureTestingModule({
    imports: [GalleryManagerComponent],
    providers: [
      { provide: AdminApiClient, useValue: api },
      { provide: ConfirmService, useValue: confirm },
    ],
  });
  const fixture = TestBed.createComponent(GalleryManagerComponent);
  fixture.componentRef.setInput('gallery', offeringGallery(5));
  fixture.componentRef.setInput('images', [image(1), image(2), image(3)]);
  fixture.detectChanges();
  return { fixture, api, confirm };
}

function chooseFile(fixture: ComponentFixture<unknown>, file: File) {
  const input = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>(
    'input[type="file"]',
  )!;
  Object.defineProperty(input, 'files', { value: [file] });
  input.dispatchEvent(new Event('change'));
  fixture.detectChanges();
}

const button = (fixture: ComponentFixture<unknown>, label: string) =>
  Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('button')).filter(
    (b) => b.getAttribute('aria-label') === label || b.textContent?.trim() === label,
  );

describe('GalleryManagerComponent', () => {
  it('rejects files over 10 MB before uploading', () => {
    const { fixture, api } = setUp();
    const big = new File([new Uint8Array(1)], 'grande.jpg', { type: 'image/jpeg' });
    Object.defineProperty(big, 'size', { value: 10 * 1024 * 1024 + 1 });

    chooseFile(fixture, big);

    expect(api.uploadImage).not.toHaveBeenCalled();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('El archivo supera 10 MB');
  });

  it('rejects formats other than JPEG, PNG and WebP', () => {
    const { fixture, api } = setUp();
    chooseFile(fixture, new File(['%PDF'], 'doc.pdf', { type: 'application/pdf' }));

    expect(api.uploadImage).not.toHaveBeenCalled();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Formato no soportado');
  });

  it('uploads a valid image and reports the change', () => {
    const { fixture, api } = setUp();
    const changed = vi.fn();
    fixture.componentInstance.changed.subscribe(changed);

    chooseFile(fixture, new File([new Uint8Array(10)], 'foto.png', { type: 'image/png' }));

    expect(api.uploadImage).toHaveBeenCalled();
    expect(changed).toHaveBeenCalled();
  });

  it('moving an image down sends the full new order', () => {
    const { fixture, api } = setUp();

    button(fixture, 'Bajar Foto 1')[0].click();

    expect(api.reorderImages).toHaveBeenCalledWith(offeringGallery(5), [2, 1, 3]);
  });

  it('saves edited alternative text', () => {
    const { fixture, api } = setUp();
    const input = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>(
      'input[name="alt-1"]',
    )!;
    input.value = 'Detalle del pliegue';
    input.dispatchEvent(new Event('change'));

    expect(api.updateImageAlt).toHaveBeenCalledWith(offeringGallery(5), 1, 'Detalle del pliegue');
  });

  it('asks for confirmation before deleting', async () => {
    const { fixture, api, confirm } = setUp(false);

    button(fixture, 'Eliminar Foto 2')[0].click();
    await Promise.resolve();

    expect(confirm.ask).toHaveBeenCalled();
    expect(api.deleteImage).not.toHaveBeenCalled();
  });
});
