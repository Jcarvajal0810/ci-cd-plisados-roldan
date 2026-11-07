import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * Public pages render on every request so admin edits show up immediately and crawlers get full
 * HTML; admin pages render only in the browser (research R4).
 */
export const serverRoutes: ServerRoute[] = [
  { path: 'admin/**', renderMode: RenderMode.Client },
  { path: '**', renderMode: RenderMode.Server },
];
