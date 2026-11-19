import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Observable, of, throwError } from 'rxjs';
import { AdminApiClient } from '../../core/api/admin-api.client';
import { BusinessProfile } from '../../core/api/models';
import { ProfilePage } from './profile.page';

const profile: BusinessProfile = {
  businessName: 'Plisados Roldán',
  slogan: 'Plisados a mano',
  aboutText: 'Desde 1980.',
  whatsappNumber: '573116254705',
  locationText: 'Medellín',
  scheduleText: 'Lunes a viernes',
};

async function render(load: () => Observable<BusinessProfile> = () => of(profile)) {
  const api = {
    profile: vi.fn(load),
    saveProfile: vi.fn((p: BusinessProfile) => of(p)),
  };
  await TestBed.configureTestingModule({
    imports: [ProfilePage],
    providers: [{ provide: AdminApiClient, useValue: api }],
  }).compileComponents();
  const fixture = TestBed.createComponent(ProfilePage);
  fixture.detectChanges();
  await fixture.whenStable();
  const el = fixture.nativeElement as HTMLElement;
  const input = (name: string) =>
    el.querySelector<HTMLInputElement | HTMLTextAreaElement>(`[name="${name}"]`)!;
  const type = (name: string, value: string) => {
    input(name).value = value;
    input(name).dispatchEvent(new Event('input'));
  };
  const submit = () => {
    el.querySelector('form')!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
  };
  return { fixture, el, api, input, type, submit };
}

describe('ProfilePage', () => {
  it('fills the form with the stored profile', async () => {
    const { input } = await render();

    expect(input('businessName').value).toBe('Plisados Roldán');
    expect(input('aboutText').tagName).toBe('TEXTAREA');
  });

  it('shows an error when the profile cannot be loaded', async () => {
    const { el, fixture } = await render(() => throwError(() => new Error('down')));
    fixture.detectChanges();

    expect(el.querySelector('[role="alert"]')?.textContent).toContain('No pudimos cargar');
  });

  it('saves a valid profile', async () => {
    const { api, el, type, submit } = await render();
    type('slogan', 'Nuevo eslogan');

    submit();

    expect(api.saveProfile).toHaveBeenCalledWith({ ...profile, slogan: 'Nuevo eslogan' });
    expect(el.querySelector('[role="status"]')?.textContent).toContain('Guardado');
  });

  it('does not save and explains an invalid WhatsApp number', async () => {
    const { api, el, type, submit } = await render();
    type('whatsappNumber', '12ab');

    submit();

    expect(api.saveProfile).not.toHaveBeenCalled();
    expect(el.textContent).toContain('Solo números, con indicativo de país');
  });

  it('marks empty required fields', async () => {
    const { api, el, type, submit } = await render();
    type('businessName', '');

    submit();

    expect(api.saveProfile).not.toHaveBeenCalled();
    expect(el.textContent).toContain('Este campo es obligatorio');
  });

  it('shows the field errors returned by the server', async () => {
    const { api, el, submit } = await render();
    api.saveProfile.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 400,
            error: { errors: { slogan: 'Eslogan repetido' } },
          }),
      ),
    );

    submit();

    expect(el.textContent).toContain('Eslogan repetido');
    expect(el.querySelector('[role="alert"]')?.textContent).toContain('No pudimos guardar');
  });

  it('shows a generic error when the server fails', async () => {
    const { api, el, submit } = await render();
    api.saveProfile.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 500 })));

    submit();

    expect(el.querySelector('[role="alert"]')?.textContent).toContain('No pudimos guardar');
  });
});
