import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AuthService, LoginResult } from '../../core/auth/auth.service';
import { LoginFormComponent } from './login-form.component';

async function render(result: LoginResult) {
  const auth = { login: vi.fn(() => of(result)) };
  await TestBed.configureTestingModule({
    imports: [LoginFormComponent],
    providers: [{ provide: AuthService, useValue: auth }],
  }).compileComponents();
  const fixture = TestBed.createComponent(LoginFormComponent);
  const loggedIn = vi.fn();
  fixture.componentInstance.loggedIn.subscribe(loggedIn);
  fixture.detectChanges();
  const el = fixture.nativeElement as HTMLElement;
  const type = (id: string, value: string) => {
    const input = el.querySelector<HTMLInputElement>(`#${id}`)!;
    input.value = value;
    input.dispatchEvent(new Event('input'));
  };
  const submit = () => {
    el.querySelector('form')!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
  };
  const alert = () => el.querySelector('[role="alert"]')?.textContent?.trim();
  return { auth, loggedIn, type, submit, alert };
}

describe('LoginFormComponent', () => {
  it('asks for both fields before calling the server', async () => {
    const { auth, submit, alert } = await render('ok');

    submit();

    expect(auth.login).not.toHaveBeenCalled();
    expect(alert()).toBe('Escribe tu correo y tu contraseña');
  });

  it('logs in with the trimmed email and emits loggedIn', async () => {
    const { auth, loggedIn, type, submit, alert } = await render('ok');
    type('login-email', '  admin@plisados.co ');
    type('login-password', 'secreto');

    submit();

    expect(auth.login).toHaveBeenCalledWith('admin@plisados.co', 'secreto');
    expect(loggedIn).toHaveBeenCalled();
    expect(alert()).toBeUndefined();
  });

  it.each([
    ['invalid', 'Correo o contraseña incorrectos'],
    ['throttled', 'Demasiados intentos, intenta en 15 minutos'],
    ['error', 'No pudimos iniciar sesión. Inténtalo de nuevo.'],
  ] as const)('shows the message for a %s result', async (result, message) => {
    const { loggedIn, type, submit, alert } = await render(result);
    type('login-email', 'admin@plisados.co');
    type('login-password', 'x');

    submit();

    expect(loggedIn).not.toHaveBeenCalled();
    expect(alert()).toBe(message);
  });
});
