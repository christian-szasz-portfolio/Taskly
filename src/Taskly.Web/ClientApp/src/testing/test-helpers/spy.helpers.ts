// =============================================================================
// Spy Test Helpers
// =============================================================================
// Native Vitest spy utilities for creating mock objects
// Import with: import { createSpyObj, MockedObject } from '@testing/test-helpers';

import { vi, type Mock } from 'vitest';

// =============================================================================
// Types
// =============================================================================

/**
 * A type that represents a mock function created by vi.fn()
 */
export type MockFn<T extends (...args: unknown[]) => unknown = (...args: unknown[]) => unknown> = Mock<T>;

/**
 * A type that represents an object with methods replaced by Vitest mocks.
 * Use this instead of jasmine.SpyObj<T>
 *
 * This type extends T so that MockedObject<T> is assignable to T.
 * The intersection with Record<string, unknown> allows additional properties
 * like internal Material fields (_openDialogs, etc.).
 */
export type MockedObject<T> = T & {
  [K in keyof T]: T[K] extends (...args: infer A) => infer R
    ? Mock<(...args: A) => R>
    : T[K];
} & Record<string, unknown>;

// =============================================================================
// Factory Functions
// =============================================================================

/**
 * Creates a spy object with specified methods and optional properties.
 * Native Vitest replacement for jasmine.createSpyObj().
 *
 * @param methodNames - Array of method names to create as spies, or object with method implementations
 * @param propertyValues - Optional object with property values (can include private/internal properties)
 * @returns Spy object with all specified methods as vi.fn() mocks
 *
 * @example
 * // Create spy with method names array
 * const authStoreSpy = createSpyObj<AuthStore>(['login', 'logout']);
 * authStoreSpy.login.mockReturnValue(of({ success: true }));
 *
 * @example
 * // Create spy with properties
 * const authStoreSpy = createSpyObj<AuthStore>(
 *   ['login', 'logout'],
 *   { isAuthenticated: signal(true), user: signal(null) }
 * );
 */
export function createSpyObj<T>(
  methodNames: (keyof T)[] | Record<string, unknown>,
  propertyValues?: Record<string, unknown>
): MockedObject<T> {
  const obj: Record<string, unknown> = {};

  // Handle methods
  if (Array.isArray(methodNames)) {
    for (const methodName of methodNames) {
      obj[methodName as string] = vi.fn();
    }
  } else {
    // Object with method implementations or return values
    for (const [key, value] of Object.entries(methodNames)) {
      if (typeof value === 'function') {
        obj[key] = vi.fn().mockImplementation(value as (...args: unknown[]) => unknown);
      } else {
        obj[key] = vi.fn().mockReturnValue(value);
      }
    }
  }

  // Handle properties (supports any property name including private/internal ones)
  if (propertyValues) {
    for (const [key, value] of Object.entries(propertyValues)) {
      obj[key] = value;
    }
  }

  return obj as MockedObject<T>;
}

/**
 * Creates a standalone spy function.
 * Native Vitest replacement for jasmine.createSpy().
 *
 * @returns A spy function
 *
 * @example
 * const callback = createSpy();
 * callback.mockReturnValue(42);
 * expect(callback()).toBe(42);
 */
export function createSpy<T extends (...args: unknown[]) => unknown = (...args: unknown[]) => unknown>(): Mock<T> {
  return vi.fn();
}

/**
 * Helper type to extract method names from a type.
 */
export type MethodNames<T> = {
  [K in keyof T]: T[K] extends (...args: unknown[]) => unknown ? K : never;
}[keyof T];

/**
 * Helper type to extract property names from a type.
 */
export type PropertyNames<T> = {
  [K in keyof T]: T[K] extends (...args: unknown[]) => unknown ? never : K;
}[keyof T];


/**
 * Wrapper for vi.spyOn to maintain Jasmine-like API.
 * Use this to spy on object methods.
 *
 * @example
 * const consoleSpy = spyOn(console, 'error');
 * expect(consoleSpy).toHaveBeenCalled();
 */
export const spyOn = vi.spyOn;

/**
 * Immediately fails the current test with an optional message.
 * Native Vitest replacement for Jasmine's fail().
 *
 * @param message - Optional failure message
 *
 * @example
 * if (unexpectedCondition) {
 *   fail('Should not reach this point');
 * }
 *
 * @example
 * try {
 *   await shouldThrow();
 *   fail('Expected an error to be thrown');
 * } catch (e) {
 *   expect(e).toBeDefined();
 * }
 */
export function fail(message?: string): never {
  throw new Error(message ?? 'Test failed');
}
