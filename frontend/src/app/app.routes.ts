import { Routes } from '@angular/router';
import { PublicLayoutComponent } from './public/layout/public-layout.component';

/** Routes from contracts/ui-routes.md. Admin comes first so the public catch-all can't hide it. */
export const routes: Routes = [
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.routes').then((m) => m.adminRoutes),
  },
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./public/home/home.page').then((m) => m.HomePage),
      },
      {
        path: 'nosotros',
        loadComponent: () => import('./public/about/about.page').then((m) => m.AboutPage),
      },
      {
        path: 'servicios',
        loadComponent: () =>
          import('./public/offerings/offerings-list.page').then((m) => m.OfferingsListPage),
      },
      {
        path: 'servicios/:slug',
        loadComponent: () =>
          import('./public/offerings/offering-detail.page').then((m) => m.OfferingDetailPage),
      },
      {
        path: 'casos-de-exito',
        loadComponent: () =>
          import('./public/success-cases/success-cases-list.page').then(
            (m) => m.SuccessCasesListPage,
          ),
      },
      {
        path: 'casos-de-exito/:slug',
        loadComponent: () =>
          import('./public/success-cases/success-case-detail.page').then(
            (m) => m.SuccessCaseDetailPage,
          ),
      },
      {
        path: 'testimonios',
        loadComponent: () =>
          import('./public/testimonials/testimonials.page').then((m) => m.TestimonialsPage),
      },
      {
        path: 'contacto',
        loadComponent: () => import('./public/contact/contact.page').then((m) => m.ContactPage),
      },
      {
        path: '**',
        loadComponent: () =>
          import('./public/not-found/not-found.page').then((m) => m.NotFoundPage),
      },
    ],
  },
];
