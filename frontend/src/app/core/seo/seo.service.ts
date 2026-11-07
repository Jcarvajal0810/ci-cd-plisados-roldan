import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Image } from '../api/models';

export interface PageSeo {
  title: string;
  description: string;
  /** Path of the page, e.g. `/servicios/plisado` (used for canonical and og:url). */
  path: string;
  /** Relative or absolute image URL for link previews; defaults to the brand image. */
  image?: string;
  noindex?: boolean;
}

const DEFAULT_SHARE_IMAGE = '/og-default.jpg';
const DESCRIPTION_MAX = 155;

/**
 * Title, description, canonical URL and Open Graph tags for each public page (FR-010,
 * contracts/ui-routes.md). Runs during server rendering, so crawlers and link-preview bots see the
 * tags without JavaScript.
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);

  update(page: PageSeo): void {
    const url = this.absolute(page.path);
    const description = describe155(page.description);
    this.title.setTitle(page.title);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: page.title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({
      property: 'og:image',
      content: this.absolute(page.image ?? DEFAULT_SHARE_IMAGE),
    });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    if (page.noindex) {
      this.meta.updateTag({ name: 'robots', content: 'noindex' });
    } else {
      this.meta.removeTag('name="robots"');
    }
    this.canonical(url);
  }

  private canonical(url: string): void {
    let link = this.document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  private absolute(url: string): string {
    return /^https?:\/\//.test(url) ? url : this.document.location.origin + url;
  }
}

/** Whitespace collapsed and cut at a word boundary to fit a meta description. */
export function describe155(text: string): string {
  const flat = text.replace(/\s+/g, ' ').trim();
  if (flat.length <= DESCRIPTION_MAX) {
    return flat;
  }
  const cut = flat.slice(0, DESCRIPTION_MAX - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut).replace(/[,.;:]$/, '') + '…';
}

/** The largest stored variant of an image, best for link previews. */
export function shareImage(image: Image | undefined): string | undefined {
  return image?.url.replace(/-960\.jpg$/, '-1600.jpg');
}
