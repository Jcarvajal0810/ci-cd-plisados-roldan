import { TestBed } from '@angular/core/testing';
import { Meta } from '@angular/platform-browser';
import { Router, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { AdminLayoutComponent } from './admin-layout.component';

describe('AdminLayoutComponent', () => {
  async function render() {
    const auth = { logout: vi.fn(() => of(undefined)) };
    await TestBed.configureTestingModule({
      imports: [AdminLayoutComponent],
      providers: [provideRouter([]), { provide: AuthService, useValue: auth }],
    }).compileComponents();
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    const fixture = TestBed.createComponent(AdminLayoutComponent);
    fixture.detectChanges();
    return { el: fixture.nativeElement as HTMLElement, auth, navigate };
  }

  it('keeps the admin area out of search engines', async () => {
    await render();

    expect(TestBed.inject(Meta).getTag('name="robots"')?.content).toBe('noindex, nofollow');
  });

  it('logs out and goes back to the login page', async () => {
    const { el, auth, navigate } = await render();
    const button = Array.from(el.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Cerrar sesión'),
    )!;

    button.click();

    expect(auth.logout).toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith('/admin/login');
  });
});
