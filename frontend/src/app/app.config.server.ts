import { ApplicationConfig, mergeApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';
import { API_INTERNAL_URL } from './core/http/api-base-url.interceptor';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    {
      provide: API_INTERNAL_URL,
      useFactory: () => process.env['API_INTERNAL_URL'] ?? 'http://localhost:8080',
    },
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
