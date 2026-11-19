import { TestBed } from '@angular/core/testing';
import { ConfirmDialogComponent } from './confirm-dialog.component';
import { ConfirmService } from './confirm.service';

async function render() {
  await TestBed.configureTestingModule({ imports: [ConfirmDialogComponent] }).compileComponents();
  const fixture = TestBed.createComponent(ConfirmDialogComponent);
  document.body.appendChild(fixture.nativeElement);
  const confirm = TestBed.inject(ConfirmService);
  const el = fixture.nativeElement as HTMLElement;
  /** Asks and renders the dialog; returns the pending answer (not awaited here). */
  const open = (message = '¿Eliminar "Plisado"?'): Promise<boolean> => {
    const answer = confirm.ask(message);
    fixture.detectChanges();
    return answer;
  };
  const buttons = () => Array.from(el.querySelectorAll('button'));
  const key = (name: string, shiftKey = false) =>
    el
      .querySelector('[role="alertdialog"]')!
      .dispatchEvent(new KeyboardEvent('keydown', { key: name, shiftKey, bubbles: true }));
  return { fixture, el, confirm, open, buttons, key };
}

describe('ConfirmDialogComponent', () => {
  afterEach(() => document.body.replaceChildren());

  it('shows nothing until something is asked', async () => {
    const { el } = await render();

    expect(el.querySelector('[role="alertdialog"]')).toBeNull();
  });

  it('shows the question, focuses Cancel and resolves true on confirm', async () => {
    const { el, open, buttons, fixture } = await render();

    const answer = open();

    expect(el.textContent).toContain('¿Eliminar "Plisado"?');
    expect(document.activeElement).toBe(buttons()[0]);
    buttons()[1].click();
    fixture.detectChanges();
    await expect(answer).resolves.toBe(true);
    expect(el.querySelector('[role="alertdialog"]')).toBeNull();
  });

  it('resolves false on Cancel', async () => {
    const { open, buttons } = await render();

    const answer = open();
    buttons()[0].click();

    await expect(answer).resolves.toBe(false);
  });

  it('resolves false on Escape', async () => {
    const { open, key } = await render();

    const answer = open();
    key('Escape');

    await expect(answer).resolves.toBe(false);
  });

  it('keeps Tab inside the dialog', async () => {
    const { open, buttons, key } = await render();
    void open();
    const [cancel, accept] = buttons();

    cancel.focus();
    key('Tab');
    expect(document.activeElement).toBe(accept);

    key('Tab');
    expect(document.activeElement).toBe(cancel);
  });

  it('cancels a pending question when a new one is asked', async () => {
    const { confirm } = await render();
    const first = confirm.ask('uno');

    void confirm.ask('dos', 'Publicar');

    await expect(first).resolves.toBe(false);
    expect(confirm.pending()?.confirmLabel).toBe('Publicar');
  });
});
