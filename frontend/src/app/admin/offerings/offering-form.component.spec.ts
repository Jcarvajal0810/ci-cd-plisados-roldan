import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OfferingInput } from '../../core/api/models';
import { OfferingFormComponent } from './offering-form.component';

async function render(): Promise<ComponentFixture<OfferingFormComponent>> {
  await TestBed.configureTestingModule({ imports: [OfferingFormComponent] }).compileComponents();
  const fixture = TestBed.createComponent(OfferingFormComponent);
  await fixture.whenStable();
  return fixture;
}

function type(fixture: ComponentFixture<unknown>, name: string, value: string) {
  const el = (fixture.nativeElement as HTMLElement).querySelector<
    HTMLInputElement | HTMLTextAreaElement
  >(`[name="${name}"]`)!;
  el.value = value;
  el.dispatchEvent(new Event('input'));
  el.dispatchEvent(new Event('blur'));
}

function submit(fixture: ComponentFixture<unknown>) {
  (fixture.nativeElement as HTMLElement).querySelector('form')!.dispatchEvent(new Event('submit'));
  fixture.detectChanges();
}

const text = (fixture: ComponentFixture<unknown>) =>
  (fixture.nativeElement as HTMLElement).textContent ?? '';

describe('OfferingFormComponent', () => {
  it('shows required messages and does not save an empty form', async () => {
    const fixture = await render();
    const saved: OfferingInput[] = [];
    fixture.componentInstance.save.subscribe((v) => saved.push(v));

    submit(fixture);

    expect(saved).toHaveLength(0);
    expect(text(fixture).match(/Este campo es obligatorio/g)?.length).toBe(3);
  });

  it('enforces the length limits from the data model', async () => {
    const fixture = await render();
    type(fixture, 'name', 'a'.repeat(81));
    type(fixture, 'summary', 'a'.repeat(201));
    type(fixture, 'description', 'a'.repeat(5001));
    submit(fixture);

    expect(text(fixture)).toContain('Máximo 80 caracteres');
    expect(text(fixture)).toContain('Máximo 200 caracteres');
    expect(text(fixture)).toContain('Máximo 5000 caracteres');
  });

  it('accepts an optional whole-number price of at least 1', async () => {
    const fixture = await render();
    type(fixture, 'name', 'Plisado');
    type(fixture, 'summary', 'Resumen');
    type(fixture, 'description', 'Texto');
    type(fixture, 'referencePriceCop', '0');
    submit(fixture);
    expect(text(fixture)).toContain('El precio debe ser un número entero mayor que cero');

    const saved: OfferingInput[] = [];
    fixture.componentInstance.save.subscribe((v) => saved.push(v));
    type(fixture, 'referencePriceCop', '');
    submit(fixture);
    expect(saved).toEqual([
      { name: 'Plisado', summary: 'Resumen', description: 'Texto', referencePriceCop: null },
    ]);

    type(fixture, 'referencePriceCop', '120000');
    submit(fixture);
    expect(saved[1].referencePriceCop).toBe(120000);
  });

  it('shows server-side field errors', async () => {
    const fixture = await render();
    fixture.componentRef.setInput('serverErrors', { name: 'Ya existe un servicio con ese nombre' });
    fixture.detectChanges();
    expect(text(fixture)).toContain('Ya existe un servicio con ese nombre');
  });
});
