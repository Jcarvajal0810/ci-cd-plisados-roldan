import { RESPONSE_INIT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BusinessProfileService } from '../../core/profile/business-profile.service';
import { NotFoundPage } from './not-found.page';

describe('NotFoundPage', () => {
  const profileService = { genericWhatsappLink: () => 'https://wa.me/573116254705?text=hola' };

  it('sets HTTP status 404 when rendered on the server', () => {
    const responseInit: ResponseInit = {};
    TestBed.configureTestingModule({
      imports: [NotFoundPage],
      providers: [
        provideRouter([]),
        { provide: RESPONSE_INIT, useValue: responseInit },
        { provide: BusinessProfileService, useValue: profileService },
      ],
    });
    TestBed.createComponent(NotFoundPage).detectChanges();

    expect(responseInit.status).toBe(404);
  });

  it('renders in the browser without a response object', () => {
    TestBed.configureTestingModule({
      imports: [NotFoundPage],
      providers: [provideRouter([]), { provide: BusinessProfileService, useValue: profileService }],
    });
    const fixture = TestBed.createComponent(NotFoundPage);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Página no encontrada');
  });
});
