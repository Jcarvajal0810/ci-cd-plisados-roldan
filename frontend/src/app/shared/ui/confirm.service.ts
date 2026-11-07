import { Injectable, signal } from '@angular/core';

export interface ConfirmRequest {
  message: string;
  confirmLabel: string;
  resolve: (confirmed: boolean) => void;
}

/** Asks the owner to confirm a destructive or unusual action (FR-020). */
@Injectable({ providedIn: 'root' })
export class ConfirmService {
  readonly pending = signal<ConfirmRequest | null>(null);

  ask(message: string, confirmLabel = 'Eliminar'): Promise<boolean> {
    this.pending()?.resolve(false);
    return new Promise((resolve) => this.pending.set({ message, confirmLabel, resolve }));
  }

  answer(confirmed: boolean): void {
    const request = this.pending();
    this.pending.set(null);
    request?.resolve(confirmed);
  }
}
