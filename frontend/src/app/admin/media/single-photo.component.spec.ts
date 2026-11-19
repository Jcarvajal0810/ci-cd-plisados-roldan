import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AdminApiClient } from '../../core/api/admin-api.client';
import { ConfirmService } from '../../shared/ui/confirm.service';
import { SinglePhotoComponent } from './single-photo.component';

function setUp(withPhoto: boolean, confirmAnswer = true) {
  const api = {
    setTestimonialPhoto: vi.fn(() => of({ id: 9 })),
    deleteTestimonialPhoto: vi.fn(() => of(undefined)),
  };
  const confirm = { ask: vi.fn(() => Promise.resolve(confirmAnswer)) };
  TestBed.configureTestingModule({
    imports: [SinglePhotoComponent],
    providers: [
      { provide: AdminApiClient, useValue: api },
      { provide: ConfirmService, useValue: confirm },
    ],
  });
  const fixture = TestBed.createComponent(SinglePhotoComponent);
  fixture.componentRef.setInput('testimonialId', 4);
  fixture.componentRef.setInput(
    'photo',
    withPhoto ? { id: 3, url: '/media/k-960.jpg', srcset: '', width: 1, height: 1, alt: 'Laura' } : null,
  );
  fixture.detectChanges();
  return { fixture, api, confirm };
}

function choose(fixture: ComponentFixture<unknown>, file: File) {
  const input = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>(
    'input[type="file"]',
  )!;
  Object.defineProperty(input, 'files', { value: [file] });
  input.dispatchEvent(new Event('change'));
  fixture.detectChanges();
}

describe('SinglePhotoComponent', () => {
  it('uploads a new photo and reports the change', () => {
    const { fixture, api } = setUp(false);
    const changed = vi.fn();
    fixture.componentInstance.changed.subscribe(changed);

    choose(fixture, new File([new Uint8Array(3)], 'foto.webp', { type: 'image/webp' }));

    expect(api.setTestimonialPhoto).toHaveBeenCalledWith(4, expect.any(File));
    expect(changed).toHaveBeenCalled();
  });

  it('applies the same file rules as galleries', () => {
    const { fixture, api } = setUp(false);
    choose(fixture, new File(['x'], 'doc.pdf', { type: 'application/pdf' }));
    expect(api.setTestimonialPhoto).not.toHaveBeenCalled();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Formato no soportado');
  });

  it('removes the photo only after confirmation', async () => {
    const { fixture, api, confirm } = setUp(true, false);
    (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLButtonElement>('button[aria-label="Quitar foto"]')!
      .click();
    await Promise.resolve();
    expect(confirm.ask).toHaveBeenCalled();
    expect(api.deleteTestimonialPhoto).not.toHaveBeenCalled();
  });
});
