import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { AdminApiClient } from '../../core/api/admin-api.client';
import { DashboardPage } from './dashboard.page';

describe('DashboardPage', () => {
  it('counts published and draft offerings', async () => {
    const offerings = [{ published: true }, { published: false }, { published: true }];
    await TestBed.configureTestingModule({
      imports: [DashboardPage],
      providers: [
        provideRouter([]),
        { provide: AdminApiClient, useValue: { offerings: () => of(offerings) } },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(DashboardPage);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      '2 publicados · 1 borradores',
    );
  });
});
