import { provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideCaribeNG } from '@caribeng/ui';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

// La docs app arranca en modo *zoneless* para validar ese criterio del SPEC.
bootstrapApplication(AppComponent, {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'top',
        anchorScrolling: 'enabled',
      }),
    ),
    provideCaribeNG({ theme: 'light', persistTheme: true, currency: 'COP', numberLocale: 'es-CO' }),
  ],
}).catch((err) => console.error(err));
