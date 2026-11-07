import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TestimonialInput } from '../../core/api/models';
import { TestimonialFormComponent } from './testimonial-form.component';

async function render(): Promise<ComponentFixture<TestimonialFormComponent>> {
  await TestBed.configureTestingModule({ imports: [TestimonialFormComponent] }).compileComponents();
  const fixture = TestBed.createComponent(TestimonialFormComponent);
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

describe('TestimonialFormComponent', () => {
  it('requires client name and quote', async () => {
    const fixture = await render();
    submit(fixture);
    expect(root(fixture).textContent?.match(/Este campo es obligatorio/g)?.length).toBe(2);
  });

  it('enforces the data-model limits', async () => {
    const fixture = await render();
    type(fixture, 'clientName', 'x'.repeat(121));
    type(fixture, 'company', 'x'.repeat(121));
    type(fixture, 'quote', 'x'.repeat(601));
    submit(fixture);
    const text = root(fixture).textContent ?? '';
    expect(text.match(/Máximo 120 caracteres/g)?.length).toBe(2);
    expect(text).toContain('Máximo 600 caracteres');
  });

  it('emits the testimonial with an optional company and featured flag', async () => {
    const fixture = await render();
    const saved: TestimonialInput[] = [];
    fixture.componentInstance.save.subscribe((v) => saved.push(v));
    type(fixture, 'clientName', 'Laura Gómez');
    type(fixture, 'quote', 'Excelente trabajo.');
    root(fixture).querySelector<HTMLInputElement>('[name="featured"]')!.click();
    submit(fixture);

    expect(saved).toEqual([
      { clientName: 'Laura Gómez', company: null, quote: 'Excelente trabajo.', featured: true },
    ]);
  });
});
