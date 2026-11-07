import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SuccessCaseInput } from '../../core/api/models';
import { SuccessCaseFormComponent } from './success-case-form.component';

async function render(): Promise<ComponentFixture<SuccessCaseFormComponent>> {
  await TestBed.configureTestingModule({ imports: [SuccessCaseFormComponent] }).compileComponents();
  const fixture = TestBed.createComponent(SuccessCaseFormComponent);
  fixture.componentRef.setInput('offerings', [
    { id: 1, name: 'Plisado' },
    { id: 2, name: 'Trillado' },
  ]);
  await fixture.whenStable();
  return fixture;
}

const root = (fixture: ComponentFixture<unknown>) => fixture.nativeElement as HTMLElement;

function type(fixture: ComponentFixture<unknown>, name: string, value: string) {
  const el = root(fixture).querySelector<HTMLInputElement | HTMLTextAreaElement>(
    `[name="${name}"]`,
  )!;
  el.value = value;
  el.dispatchEvent(new Event('input'));
}

function submit(fixture: ComponentFixture<unknown>) {
  root(fixture).querySelector('form')!.dispatchEvent(new Event('submit'));
  fixture.detectChanges();
}

describe('SuccessCaseFormComponent', () => {
  it('requires title, client and description', async () => {
    const fixture = await render();
    submit(fixture);
    expect(root(fixture).textContent?.match(/Este campo es obligatorio/g)?.length).toBe(3);
  });

  it('enforces the data-model limits', async () => {
    const fixture = await render();
    type(fixture, 'title', 'x'.repeat(121));
    type(fixture, 'clientName', 'x'.repeat(121));
    type(fixture, 'description', 'x'.repeat(5001));
    type(fixture, 'eventLabel', 'x'.repeat(121));
    submit(fixture);
    const text = root(fixture).textContent ?? '';
    expect(text.match(/Máximo 120 caracteres/g)?.length).toBe(3);
    expect(text).toContain('Máximo 5000 caracteres');
  });

  it('emits featured and the selected related offerings', async () => {
    const fixture = await render();
    const saved: SuccessCaseInput[] = [];
    fixture.componentInstance.save.subscribe((v) => saved.push(v));
    type(fixture, 'title', 'Pasarela 2026');
    type(fixture, 'clientName', 'Marca Aliada');
    type(fixture, 'description', 'Faldas plisadas.');
    type(fixture, 'eventDate', '2026-07-20');
    root(fixture).querySelector<HTMLInputElement>('[name="featured"]')!.click();
    root(fixture).querySelector<HTMLInputElement>('[name="offering-2"]')!.click();
    submit(fixture);

    expect(saved).toEqual([
      {
        title: 'Pasarela 2026',
        clientName: 'Marca Aliada',
        description: 'Faldas plisadas.',
        eventLabel: null,
        eventDate: '2026-07-20',
        featured: true,
        offeringIds: [2],
      },
    ]);
  });
});
