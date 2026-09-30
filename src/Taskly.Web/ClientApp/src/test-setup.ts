// =============================================================================
// Vitest Test Setup
// =============================================================================
// Global test setup for Angular + Vitest
// This file is loaded before every test file via vitest.config.ts setupFiles
// Uses native Vitest APIs - no Jasmine compatibility layer

// Import Angular testing modules
import { getTestBed } from '@angular/core/testing';
import {
  BrowserTestingModule,
  platformBrowserTesting
} from '@angular/platform-browser/testing';
import { beforeEach, afterEach, vi, expect, type Mock, type MockInstance } from 'vitest';
import { equals } from '@vitest/expect';

// =============================================================================
// Global spyOn Alias
// =============================================================================
// Provide Jasmine-compatible spyOn API using vi.spyOn
// This allows existing tests to use spyOn() without modification

(globalThis as Record<string, unknown>)['spyOn'] = <T extends object, M extends keyof T>(
  object: T,
  method: M
): MockInstance => vi.spyOn(object, method as never);

// =============================================================================
// Browser API Polyfills
// =============================================================================
// jsdom doesn't implement some browser APIs, so we mock them

// Patterns to suppress in test output (expected noise from jsdom/Angular testing)
const SUPPRESSED_PATTERNS = [
  'Could not parse CSS stylesheet',
  'Failed to load attachments',
  'Failed to load comments',
  'Failed to load contributors',
  'Failed to load image attachment',
  'Failed to load system tasks',
  'Failed to save settings',
  'Failed to load settings',
  'Failed to resolve current user',
  'Download failed',
  'API Error',
  'Network error',
  'Global error:',
  'Unhandled promise rejection',
  'AggregateError',
  'NG0914', // Zone.js warning in zoneless apps
  'Http failure response for',
  'Unknown Error',
  'No access token available for SignalR',
  'Not implemented:', // jsdom doesn't implement navigation, window.open, etc.
];

const shouldSuppress = (message: string): boolean =>
  SUPPRESSED_PATTERNS.some(pattern => message.includes(pattern));

// Suppress console.error for expected test noise
const originalConsoleError = console.error;
console.error = (...args: unknown[]) => {
  const message = String(args[0]);
  if (shouldSuppress(message)) {
    return;
  }
  originalConsoleError.apply(console, args);
};

// Suppress console.warn for expected test noise
const originalConsoleWarn = console.warn;
console.warn = (...args: unknown[]) => {
  const message = String(args[0]);
  if (shouldSuppress(message)) {
    return;
  }
  originalConsoleWarn.apply(console, args);
};

// Also suppress stderr output for test noise
const originalStderrWrite = process.stderr.write.bind(process.stderr);
process.stderr.write = ((
  chunk: Uint8Array | string,
  encodingOrCallback?: BufferEncoding | ((err?: Error | null) => void),
  callback?: (err?: Error | null) => void
): boolean => {
  const message = String(chunk);
  if (shouldSuppress(message)) {
    return true;
  }
  return originalStderrWrite(chunk, encodingOrCallback as BufferEncoding, callback);
}) as typeof process.stderr.write;

// Also patch CSSStyleSheet.prototype.replaceSync to suppress errors from adopted stylesheets
if (typeof CSSStyleSheet !== 'undefined' && CSSStyleSheet.prototype.replaceSync) {
  const originalReplaceSync = CSSStyleSheet.prototype.replaceSync;
  CSSStyleSheet.prototype.replaceSync = function(text: string) {
    try {
      return originalReplaceSync.call(this, text);
    } catch {
      // Suppress CSS parsing errors silently
    }
  };
}

// Set default locale to English for consistent date/number formatting in tests
Object.defineProperty(navigator, 'language', {
  value: 'en-US',
  configurable: true
});

Object.defineProperty(navigator, 'languages', {
  value: ['en-US', 'en'],
  configurable: true
});

// Override Date.prototype methods to use English locale when no locale specified
const originalToLocaleString = Date.prototype.toLocaleString;
Date.prototype.toLocaleString = function(
  locales?: string | string[],
  options?: Intl.DateTimeFormatOptions
): string {
  return originalToLocaleString.call(this, locales ?? 'en-US', options);
};

const originalToLocaleDateString = Date.prototype.toLocaleDateString;
Date.prototype.toLocaleDateString = function(
  locales?: string | string[],
  options?: Intl.DateTimeFormatOptions
): string {
  return originalToLocaleDateString.call(this, locales ?? 'en-US', options);
};

const originalToLocaleTimeString = Date.prototype.toLocaleTimeString;
Date.prototype.toLocaleTimeString = function(
  locales?: string | string[],
  options?: Intl.DateTimeFormatOptions
): string {
  return originalToLocaleTimeString.call(this, locales ?? 'en-US', options);
};

// URL.createObjectURL / revokeObjectURL for blob handling in tests
if (typeof URL.createObjectURL === 'undefined') {
  URL.createObjectURL = vi.fn((blob: Blob) => `blob:mock-${Math.random().toString(36).slice(2)}`);
  URL.revokeObjectURL = vi.fn();
}

// CSS.supports for modern CSS feature detection
if (typeof CSS === 'undefined' || typeof CSS.supports === 'undefined') {
  (globalThis as Record<string, unknown>)['CSS'] = {
    supports: () => false
  };
}

// ResizeObserver for responsive components
if (typeof ResizeObserver === 'undefined') {
  (globalThis as Record<string, unknown>)['ResizeObserver'] = class MockResizeObserver {
    constructor(private callback: ResizeObserverCallback) {}
    observe(): void { /* mock */ }
    unobserve(): void { /* mock */ }
    disconnect(): void { /* mock */ }
  };
}

// Element.prototype.scrollIntoView - not implemented by jsdom
// Define as a no-op so spyOn can spy on it
if (typeof Element.prototype.scrollIntoView === 'undefined') {
  Element.prototype.scrollIntoView = function(_options?: boolean | ScrollIntoViewOptions): void {
    // Mock implementation - does nothing
  };
}

// DataTransfer for file input testing
if (typeof DataTransfer === 'undefined') {
  (globalThis as Record<string, unknown>)['DataTransfer'] = class MockDataTransfer {
    private fileList: File[] = [];
    items = {
      add: (file: File) => {
        this.fileList.push(file);
      }
    };
    get files() {
      const list = this.fileList;
      // Create a FileList-like object with numeric indexing
      const fileList = {
        length: list.length,
        item: (index: number) => list[index] ?? null,
        [Symbol.iterator]: function* () {
          for (const file of list) yield file;
        }
      };
      // Add numeric indices
      list.forEach((file, index) => {
        (fileList as Record<number, File>)[index] = file;
      });
      return fileList as unknown as FileList;
    }
  };
}

// Override HTMLInputElement.files setter to accept our mock FileList
const originalFilesDescriptor = Object.getOwnPropertyDescriptor(
  HTMLInputElement.prototype,
  'files'
);
if (originalFilesDescriptor) {
  Object.defineProperty(HTMLInputElement.prototype, 'files', {
    get: originalFilesDescriptor.get,
    set(value: FileList | null) {
      // Store the value on a custom property and make it accessible via a getter override
      Object.defineProperty(this, '_mockFiles', {
        value,
        writable: true,
        configurable: true
      });
      // Override the getter for this specific instance
      Object.defineProperty(this, 'files', {
        get: () => value,
        configurable: true
      });
    },
    configurable: true
  });
}

// ClipboardEvent for paste testing
if (typeof ClipboardEvent === 'undefined') {
  (globalThis as Record<string, unknown>)['ClipboardEvent'] = class MockClipboardEvent extends Event {
    clipboardData: DataTransfer | null;
    constructor(type: string, eventInitDict?: ClipboardEventInit) {
      super(type, eventInitDict);
      this.clipboardData = eventInitDict?.clipboardData ?? null;
    }
  };
}

// DragEvent for drag-and-drop testing
if (typeof DragEvent === 'undefined') {
  (globalThis as Record<string, unknown>)['DragEvent'] = class MockDragEvent extends MouseEvent {
    dataTransfer: DataTransfer | null;
    constructor(type: string, eventInitDict?: DragEventInit) {
      super(type, eventInitDict);
      this.dataTransfer = eventInitDict?.dataTransfer ?? null;
    }
  };
}

// HTMLCanvasElement.getContext for chart libraries
HTMLCanvasElement.prototype.getContext = vi.fn(function (
  this: HTMLCanvasElement,
  contextId: string
) {
  if (contextId === '2d') {
    return {
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      getImageData: vi.fn(() => ({ data: new Array(4) })),
      putImageData: vi.fn(),
      createImageData: vi.fn(() => []),
      setTransform: vi.fn(),
      resetTransform: vi.fn(),
      getTransform: vi.fn(() => ({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 })),
      drawImage: vi.fn(),
      save: vi.fn(),
      fillText: vi.fn(),
      strokeText: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      closePath: vi.fn(),
      stroke: vi.fn(),
      translate: vi.fn(),
      scale: vi.fn(),
      rotate: vi.fn(),
      arc: vi.fn(),
      arcTo: vi.fn(),
      ellipse: vi.fn(),
      fill: vi.fn(),
      measureText: vi.fn(() => ({ width: 0, actualBoundingBoxAscent: 0, actualBoundingBoxDescent: 0 })),
      transform: vi.fn(),
      rect: vi.fn(),
      roundRect: vi.fn(),
      clip: vi.fn(),
      isPointInPath: vi.fn(() => false),
      isPointInStroke: vi.fn(() => false),
      quadraticCurveTo: vi.fn(),
      bezierCurveTo: vi.fn(),
      getLineDash: vi.fn(() => []),
      setLineDash: vi.fn(),
      createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
      createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
      createConicGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
      createPattern: vi.fn(),
      drawFocusIfNeeded: vi.fn(),
      canvas: this,
      direction: 'ltr',
      fillStyle: '',
      font: '',
      fontKerning: 'auto',
      fontStretch: 'normal',
      fontVariantCaps: 'normal',
      globalAlpha: 1,
      globalCompositeOperation: 'source-over',
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'low',
      letterSpacing: '0px',
      lineCap: 'butt',
      lineDashOffset: 0,
      lineJoin: 'miter',
      lineWidth: 1,
      miterLimit: 10,
      shadowBlur: 0,
      shadowColor: 'rgba(0, 0, 0, 0)',
      shadowOffsetX: 0,
      shadowOffsetY: 0,
      strokeStyle: '',
      textAlign: 'start',
      textBaseline: 'alphabetic',
      textRendering: 'auto',
      wordSpacing: '0px'
    } as unknown as CanvasRenderingContext2D;
  }
  return null;
}) as typeof HTMLCanvasElement.prototype.getContext;

// =============================================================================
// Custom Matchers
// =============================================================================
// Add useful matchers for Angular testing

expect.extend({
  toBeTrue(received: unknown) {
    const pass = received === true;
    return {
      pass,
      message: () => pass
        ? `expected ${received} not to be true`
        : `expected ${received} to be true`
    };
  },
  toBeFalse(received: unknown) {
    const pass = received === false;
    return {
      pass,
      message: () => pass
        ? `expected ${received} not to be false`
        : `expected ${received} to be false`
    };
  },
  toHaveBeenCalledOnceWith(received: Mock, ...expectedArgs: unknown[]) {
    const calls = received.mock.calls;
    if (calls.length !== 1) {
      return {
        pass: false,
        message: () => `expected spy to have been called once, but was called ${calls.length} times`
      };
    }
    // Use Vitest's equals utility which handles asymmetric matchers
    const argsMatch = equals(calls[0], expectedArgs);
    return {
      pass: argsMatch,
      message: () => argsMatch
        ? `expected spy not to have been called once with ${JSON.stringify(expectedArgs)}`
        : `expected spy to have been called once with ${JSON.stringify(expectedArgs)}, but was called with ${JSON.stringify(calls[0])}`
    };
  }
});

// Extend Vitest's Assertion interface for TypeScript
declare module 'vitest' {
  interface Assertion {
    toBeTrue(): void;
    toBeFalse(): void;
    toHaveBeenCalledOnceWith(...args: unknown[]): void;
  }
  interface AsymmetricMatchersContaining {
    toBeTrue(): void;
    toBeFalse(): void;
    toHaveBeenCalledOnceWith(...args: unknown[]): void;
  }
}

// =============================================================================
// Global Type Declarations
// =============================================================================
// Declare global spyOn and fail functions for TypeScript

declare global {
  /**
   * Spies on a method of an object. Wrapper for vi.spyOn.
   */
  function spyOn<T extends object, M extends keyof T>(
    object: T,
    method: M
  ): MockInstance;

  /**
   * Immediately fails the current test with an optional message.
   */
  function fail(message?: string): never;
}

// Assign fail to global
(globalThis as Record<string, unknown>)['fail'] = (message?: string): never => {
  throw new Error(message ?? 'Test failed');
};

// =============================================================================
// Angular TestBed Initialization
// =============================================================================

// Initialize test environment once globally
const TESTBED_INIT_KEY = Symbol.for('vitest-angular-testbed-init');

if (!(globalThis as Record<symbol, boolean>)[TESTBED_INIT_KEY]) {
  (globalThis as Record<symbol, boolean>)[TESTBED_INIT_KEY] = true;

  getTestBed().initTestEnvironment(
    BrowserTestingModule,
    platformBrowserTesting(),
    { teardown: { destroyAfterEach: true } }
  );
}

// Reset TestBed before each test to ensure clean state.
// Also clear localStorage so the demo's localStorage-backed mock data layer
// (DemoDataService + *ServiceManager) starts fresh and does not leak between tests.
beforeEach(() => {
  getTestBed().resetTestingModule();
  try {
    localStorage.clear();
    sessionStorage.clear();
  } catch {
    // storage may be unavailable in some environments
  }
});

// Clean up after each test
afterEach(() => {
  getTestBed().resetTestingModule();
});

export {};
