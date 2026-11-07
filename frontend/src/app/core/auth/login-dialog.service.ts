import { Injectable, signal } from '@angular/core';
import { Observable, Subject, take } from 'rxjs';

/**
 * Asks the owner to log in again without leaving the page (spec edge case: session expired while
 * editing). Concurrent requests share one dialog.
 */
@Injectable({ providedIn: 'root' })
export class LoginDialogService {
  private result?: Subject<boolean>;

  readonly open = signal(false);

  /** Emits `true` after a successful login, `false` if the owner cancels. */
  requestLogin(): Observable<boolean> {
    if (!this.result) {
      this.result = new Subject<boolean>();
      this.open.set(true);
    }
    return this.result.pipe(take(1));
  }

  resolve(loggedIn: boolean): void {
    const result = this.result;
    this.result = undefined;
    this.open.set(false);
    result?.next(loggedIn);
    result?.complete();
  }
}
