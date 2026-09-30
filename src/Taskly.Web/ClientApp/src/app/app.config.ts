import { ErrorHandler, inject, provideAppInitializer, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import type { ApplicationConfig, EnvironmentProviders } from '@angular/core';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideRouter, RouteReuseStrategy } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withFetch, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { of, switchMap, catchError } from 'rxjs';
import { routes } from './app.routes';
import { SessionContextService } from './core/services/project/session-context.service';
import { TaskRouteReuseStrategy } from './core/routing/task-route-reuse.strategy';
import { GlobalErrorHandler } from './core/services/error-handling/global-error-handler.service';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { AuthStore } from './core/state/auth.store';
import { NotificationStore } from './core/state/notification.store';
import { DemoHydrationService } from './core/services/demo/demo-hydration.service';

// Only include hydration in production builds (SSR)
// Dev builds are CSR-only and hydration causes JIT compiler errors
const hydrationProvider: EnvironmentProviders[] = import.meta.env.PROD
  ? [provideClientHydration(withEventReplay())]
  : [];

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    ...hydrationProvider,
    provideHttpClient(withInterceptors([errorInterceptor]), withInterceptorsFromDi(), withFetch()),
    // Note: provideAnimationsAsync() is deprecated as of Angular v20.2 (removal planned for v23).
    // Angular Material components require animations for smooth UI transitions (dialogs, menus, ripples, etc.).
    // The new animate.enter/animate.leave API will be the replacement. Keep this until migration path is documented.
    provideAnimationsAsync(),
    provideCharts(withDefaultRegisterables()),
    provideAppInitializer(() => {
      const authStore = inject(AuthStore);
      const session = inject(SessionContextService);
      const notificationStore = inject(NotificationStore);
      const hydration = inject(DemoHydrationService);

      // Demo build: every visitor gets the seeded demo workspace produced by the backend
      // factory orchestrator. Hydrate the local collections from GET /api/demo/seed (once per
      // trial), ensure a 7-day trial is running, materialize the demo identity, then load the
      // active project + notifications.
      return hydration.ensureHydrated().pipe(
        switchMap(() => {
          authStore.ensureTrialStarted();
          return authStore.init();
        }),
        switchMap(() => {
          if (authStore.isExpired()) {
            // Expired trials are routed to the splash; don't load data.
            session.setActiveProject(null);
            return of(undefined);
          }
          notificationStore.initialize();
          return session.init();
        }),
        catchError((err) => {
          console.error('[AppInit] Initialization failed:', err);
          return of(undefined);
        })
      );
    }),
    { provide: RouteReuseStrategy, useClass: TaskRouteReuseStrategy },
    { provide: ErrorHandler, useClass: GlobalErrorHandler }
  ]
};
