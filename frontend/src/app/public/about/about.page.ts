import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { BusinessProfileService } from '../../core/profile/business-profile.service';
import { SeoService } from '../../core/seo/seo.service';

@Component({
  selector: 'app-about-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="section">
      <div class="container narrow">
        <h1>Nosotros</h1>
        @for (paragraph of paragraphs(); track $index) {
          <p>{{ paragraph }}</p>
        }
        @if (profileService.profile(); as profile) {
          <p class="muted">{{ profile.locationText }}</p>
        }
      </div>
    </section>
  `,
  styles: `
    .narrow {
      max-width: 46rem;
    }
  `,
})
export class AboutPage {
  protected readonly profileService = inject(BusinessProfileService);

  /** The owner's text, split into paragraphs on blank lines. */
  protected readonly paragraphs = computed(() =>
    (this.profileService.profile()?.aboutText ?? '')
      .split(/\n\s*\n/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean),
  );

  constructor() {
    const seo = inject(SeoService);
    effect(() => {
      const profile = this.profileService.profile();
      if (profile) {
        seo.update({
          title: 'Nosotros · Plisados Roldán',
          description: profile.aboutText,
          path: '/nosotros',
        });
      }
    });
  }
}
