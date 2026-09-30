// =============================================================================
// Base Test Providers
// =============================================================================
// Common provider configurations for testing
// Import with: import { getBaseTestProviders } from '@testing/test-helpers';

import {
  provideZonelessChangeDetection,
  PLATFORM_ID,
  Component,
  type Provider,
  type EnvironmentProviders
} from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter, type Routes } from '@angular/router';

// Dummy component for catch-all route in tests
@Component({ standalone: true, template: '' })
class EmptyComponent {}

// =============================================================================
// Provider Configurations
// =============================================================================

/**
 * Base providers for component testing.
 * Includes zoneless change detection, HTTP client with testing, animations, and router.
 *
 * @param routes - Optional routes for the test (default: empty)
 * @returns Array of providers for TestBed
 *
 * @example
 * await TestBed.configureTestingModule({
 *   imports: [MyComponent],
 *   providers: getBaseTestProviders()
 * }).compileComponents();
 */
export function getBaseTestProviders(routes: Routes = []): (Provider | EnvironmentProviders)[] {
  // Add catch-all route to prevent unhandled route matching errors in tests
  const routesWithFallback: Routes = [
    ...routes,
    { path: '**', component: EmptyComponent }
  ];
  return [
    provideZonelessChangeDetection(),
    provideNoopAnimations(),
    provideHttpClient(),
    provideHttpClientTesting(),
    provideRouter(routesWithFallback),
    { provide: PLATFORM_ID, useValue: 'browser' }
  ];
}

/**
 * Providers for server-side rendering tests.
 * Uses 'server' as the platform ID.
 */
export function getServerTestProviders(routes: Routes = []): (Provider | EnvironmentProviders)[] {
  // Add catch-all route to prevent unhandled route matching errors in tests
  const routesWithFallback: Routes = [
    ...routes,
    { path: '**', component: EmptyComponent }
  ];
  return [
    provideZonelessChangeDetection(),
    provideNoopAnimations(),
    provideHttpClient(),
    provideHttpClientTesting(),
    provideRouter(routesWithFallback),
    { provide: PLATFORM_ID, useValue: 'server' }
  ];
}

/**
 * Minimal providers for pure form components (no HTTP needed).
 * Use for testing form components that don't make API calls.
 *
 * @example
 * await TestBed.configureTestingModule({
 *   imports: [MyFormComponent],
 *   providers: getFormTestProviders()
 * }).compileComponents();
 */
export function getFormTestProviders(): (Provider | EnvironmentProviders)[] {
  return [
    provideZonelessChangeDetection(),
    provideNoopAnimations(),
    { provide: PLATFORM_ID, useValue: 'browser' }
  ];
}

/**
 * Providers for dialog component testing.
 * Does not include router to avoid route guard issues in dialogs.
 */
export function getDialogTestProviders(): (Provider | EnvironmentProviders)[] {
  return [
    provideZonelessChangeDetection(),
    provideNoopAnimations(),
    provideHttpClient(),
    provideHttpClientTesting(),
    { provide: PLATFORM_ID, useValue: 'browser' }
  ];
}

// =============================================================================
// Provider Factories
// =============================================================================

/**
 * Creates a mock window.localStorage provider.
 */
export function createLocalStorageMock(): Provider {
  const store: Record<string, string> = {};

  const mockStorage = {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      Object.keys(store).forEach((key) => delete store[key]);
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => Object.keys(store)[index] ?? null
  };

  return { provide: 'localStorage', useValue: mockStorage };
}

/**
 * Creates a mock window.sessionStorage provider.
 */
export function createSessionStorageMock(): Provider {
  const store: Record<string, string> = {};

  const mockStorage = {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      Object.keys(store).forEach((key) => delete store[key]);
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => Object.keys(store)[index] ?? null
  };

  return { provide: 'sessionStorage', useValue: mockStorage };
}
