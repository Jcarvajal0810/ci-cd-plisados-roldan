import { Injectable, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { PublicApiClient } from '../api/public-api.client';
import { WhatsAppMessages, whatsappLink } from '../whatsapp/whatsapp-link.builder';

/** Business profile loaded once per app (per request during SSR) and shared by every page. */
@Injectable({ providedIn: 'root' })
export class BusinessProfileService {
  private readonly api = inject(PublicApiClient);

  readonly profile = toSignal(this.api.profile().pipe(catchError(() => of(null))), {
    initialValue: null,
  });

  readonly whatsappNumber = computed(() => this.profile()?.whatsappNumber ?? '');

  readonly genericWhatsappLink = computed(() =>
    whatsappLink(this.whatsappNumber(), WhatsAppMessages.generic()),
  );
}
