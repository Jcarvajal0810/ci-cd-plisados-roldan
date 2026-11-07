import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { Meta, Title } from '@angular/platform-browser';
import { SeoService, describe155 } from './seo.service';

describe('SeoService', () => {
  let seo: SeoService;
  let meta: Meta;
  let doc: Document;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    seo = TestBed.inject(SeoService);
    meta = TestBed.inject(Meta);
    doc = TestBed.inject(DOCUMENT);
  });

  const content = (selector: string) => meta.getTag(selector)?.getAttribute('content');

  it('sets title, description, canonical and Open Graph tags', () => {
    seo.update({
      title: 'Plisado · Plisados Roldán',
      description: 'Pliegues precisos.',
      path: '/servicios/plisado',
      image: '/media/key-1600.jpg',
    });

    const origin = doc.location.origin;
    expect(TestBed.inject(Title).getTitle()).toBe('Plisado · Plisados Roldán');
    expect(content('name="description"')).toBe('Pliegues precisos.');
    expect(content('property="og:title"')).toBe('Plisado · Plisados Roldán');
    expect(content('property="og:description"')).toBe('Pliegues precisos.');
    expect(content('property="og:image"')).toBe(origin + '/media/key-1600.jpg');
    expect(content('property="og:url"')).toBe(origin + '/servicios/plisado');
    expect(content('property="og:type"')).toBe('website');
    expect(doc.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      origin + '/servicios/plisado',
    );
  });

  it('falls back to the default share image', () => {
    seo.update({ title: 'T', description: 'D', path: '/' });
    expect(content('property="og:image"')).toBe(doc.location.origin + '/og-default.jpg');
  });

  it('replaces tags instead of duplicating them on navigation', () => {
    seo.update({ title: 'Uno', description: 'Primera', path: '/a' });
    seo.update({ title: 'Dos', description: 'Segunda', path: '/b' });

    expect(doc.querySelectorAll('meta[name="description"]').length).toBe(1);
    expect(doc.querySelectorAll('link[rel="canonical"]').length).toBe(1);
    expect(content('name="description"')).toBe('Segunda');
  });

  it('can mark a page as not indexable', () => {
    seo.update({ title: 'T', description: 'D', path: '/x', noindex: true });
    expect(content('name="robots"')).toBe('noindex');
    seo.update({ title: 'T', description: 'D', path: '/y' });
    expect(meta.getTag('name="robots"')).toBeNull();
  });
});

describe('describe155', () => {
  it('keeps short text as is, collapsing whitespace', () => {
    expect(describe155('Hola\n\n  mundo')).toBe('Hola mundo');
  });

  it('cuts long text at a word boundary with an ellipsis', () => {
    const text = 'palabra '.repeat(40);
    const result = describe155(text);
    expect(result.length).toBeLessThanOrEqual(155);
    expect(result.endsWith('…')).toBe(true);
    expect(result).not.toMatch(/palab…$/);
  });
});
