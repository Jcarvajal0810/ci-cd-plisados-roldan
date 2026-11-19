import { Directive, inject, output, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { AdminApiClient } from '../../core/api/admin-api.client';
import { ConfirmService } from '../../shared/ui/confirm.service';
import { ACCEPT_ATTRIBUTE, chosenImageFile } from './image-file';

/** State and request handling shared by the photo editors (gallery and single photo). */
@Directive()
export abstract class MediaEditor {
  readonly changed = output<void>();

  protected readonly api = inject(AdminApiClient);
  protected readonly confirm = inject(ConfirmService);

  protected readonly accept = ACCEPT_ATTRIBUTE;
  protected readonly busy = signal(false);
  protected readonly message = signal('');

  /** Validates the chosen file and sends it; clears the input once it is uploaded. */
  protected uploadChosen(event: Event, send: (file: File) => Observable<unknown>): void {
    const chosen = chosenImageFile(event, (problem) => this.message.set(problem));
    if (chosen) {
      this.run(send(chosen.file), 'No pudimos subir la foto', () => {
        chosen.input.value = '';
      });
    }
  }

  /** Runs a request while busy and reports the API error (or `failure`) when it fails. */
  protected run(request: Observable<unknown>, failure: string, done?: () => void): void {
    this.busy.set(true);
    request.subscribe({
      next: () => {
        this.busy.set(false);
        done?.();
        this.changed.emit();
      },
      error: (error: { error?: { detail?: string } }) => {
        this.busy.set(false);
        this.message.set(error?.error?.detail ?? failure);
      },
    });
  }
}
