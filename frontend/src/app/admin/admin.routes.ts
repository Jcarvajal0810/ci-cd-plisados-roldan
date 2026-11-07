import { Routes } from '@angular/router';
import { adminGuard } from '../core/auth/admin.guard';
import { AdminLayoutComponent } from './layout/admin-layout.component';

/** Admin area (contracts/ui-routes.md); rendered in the browser only (app.routes.server.ts). */
export const adminRoutes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then((m) => m.LoginPage),
  },
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [adminGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./dashboard/dashboard.page').then((m) => m.DashboardPage),
      },
      {
        path: 'servicios',
        loadComponent: () =>
          import('./offerings/offerings-list.page').then((m) => m.OfferingsListPage),
      },
      {
        path: 'servicios/nuevo',
        loadComponent: () =>
          import('./offerings/offering-edit.page').then((m) => m.OfferingEditPage),
      },
      {
        path: 'servicios/:id',
        loadComponent: () =>
          import('./offerings/offering-edit.page').then((m) => m.OfferingEditPage),
      },
      {
        path: 'perfil',
        loadComponent: () => import('./profile/profile.page').then((m) => m.ProfilePage),
      },
      {
        path: 'casos',
        loadComponent: () =>
          import('./success-cases/success-cases-list.page').then((m) => m.SuccessCasesListPage),
      },
      {
        path: 'casos/nuevo',
        loadComponent: () =>
          import('./success-cases/success-case-edit.page').then((m) => m.SuccessCaseEditPage),
      },
      {
        path: 'casos/:id',
        loadComponent: () =>
          import('./success-cases/success-case-edit.page').then((m) => m.SuccessCaseEditPage),
      },
      {
        path: 'testimonios',
        loadComponent: () =>
          import('./testimonials/testimonials-list.page').then((m) => m.TestimonialsListPage),
      },
      {
        path: 'testimonios/nuevo',
        loadComponent: () =>
          import('./testimonials/testimonial-edit.page').then((m) => m.TestimonialEditPage),
      },
      {
        path: 'testimonios/:id',
        loadComponent: () =>
          import('./testimonials/testimonial-edit.page').then((m) => m.TestimonialEditPage),
      },
      {
        path: 'vista-previa/casos/:id',
        loadComponent: () =>
          import('./preview/success-case-preview.page').then((m) => m.SuccessCasePreviewPage),
      },
      {
        path: 'vista-previa/servicios/:id',
        loadComponent: () =>
          import('./preview/offering-preview.page').then((m) => m.OfferingPreviewPage),
      },
    ],
  },
];
