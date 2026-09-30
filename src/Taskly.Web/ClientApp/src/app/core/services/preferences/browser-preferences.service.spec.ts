import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { createSpyObj, type MockedObject } from '@testing/test-helpers';
import { BrowserPreferencesService } from './browser-preferences.service';

describe('BrowserPreferencesService', () => {
  let service: BrowserPreferencesService;
  let localStorageSpy: MockedObject<Storage>;

  beforeEach(() => {
    localStorageSpy = createSpyObj<Storage>(['getItem', 'setItem', 'removeItem']);

    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: localStorageSpy,
      writable: true
    });

    TestBed.configureTestingModule({
      providers: [
        BrowserPreferencesService,
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    });

    service = TestBed.inject(BrowserPreferencesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getDarkMode', () => {
    it('should return null when not set', () => {
      localStorageSpy.getItem.mockReturnValue(null);
      expect(service.getDarkMode()).toBeNull();
    });

    it('should return true when set to true', () => {
      localStorageSpy.getItem.mockReturnValue('true');
      expect(service.getDarkMode()).toBe(true);
    });

    it('should return false when set to false', () => {
      localStorageSpy.getItem.mockReturnValue('false');
      expect(service.getDarkMode()).toBe(false);
    });
  });

  describe('setDarkMode', () => {
    it('should store true value', () => {
      service.setDarkMode(true);
      expect(localStorageSpy.setItem).toHaveBeenCalledWith('task_darkModeEnabled', 'true');
    });

    it('should store false value', () => {
      service.setDarkMode(false);
      expect(localStorageSpy.setItem).toHaveBeenCalledWith('task_darkModeEnabled', 'false');
    });
  });

  describe('getAnimations', () => {
    it('should return null when not set', () => {
      localStorageSpy.getItem.mockReturnValue(null);
      expect(service.getAnimations()).toBeNull();
    });

    it('should return true when set to true', () => {
      localStorageSpy.getItem.mockReturnValue('true');
      expect(service.getAnimations()).toBe(true);
    });

    it('should return false when set to false', () => {
      localStorageSpy.getItem.mockReturnValue('false');
      expect(service.getAnimations()).toBe(false);
    });
  });

  describe('setAnimations', () => {
    it('should store true value', () => {
      service.setAnimations(true);
      expect(localStorageSpy.setItem).toHaveBeenCalledWith('task_animationsEnabled', 'true');
    });

    it('should store false value', () => {
      service.setAnimations(false);
      expect(localStorageSpy.setItem).toHaveBeenCalledWith('task_animationsEnabled', 'false');
    });
  });

  describe('applyDarkMode', () => {
    it('should add dark-mode class when enabled', () => {
      service.applyDarkMode(true);
      expect(document.body.classList.contains('dark-mode')).toBe(true);
    });

    it('should remove dark-mode class when disabled', () => {
      document.body.classList.add('dark-mode');
      service.applyDarkMode(false);
      expect(document.body.classList.contains('dark-mode')).toBe(false);
    });
  });

  describe('applyAnimations', () => {
    it('should remove reduce-motion class when enabled', () => {
      document.body.classList.add('reduce-motion');
      service.applyAnimations(true);
      expect(document.body.classList.contains('reduce-motion')).toBe(false);
    });

    it('should add reduce-motion class when disabled', () => {
      service.applyAnimations(false);
      expect(document.body.classList.contains('reduce-motion')).toBe(true);
    });
  });

  describe('initializeFromStorage', () => {
    it('should apply stored dark mode preference', () => {
      localStorageSpy.getItem.mockImplementation((key: string) => {
        if (key === 'task_darkModeEnabled') return 'true';
        return null;
      });

      service.initializeFromStorage();

      expect(document.body.classList.contains('dark-mode')).toBe(true);
    });

    it('should apply stored animations preference', () => {
      localStorageSpy.getItem.mockImplementation((key: string) => {
        if (key === 'task_animationsEnabled') return 'false';
        return null;
      });

      service.initializeFromStorage();

      expect(document.body.classList.contains('reduce-motion')).toBe(true);
    });

    it('should not apply preferences when not set', () => {
      localStorageSpy.getItem.mockReturnValue(null);

      // Ensure classes are in a known state
      document.body.classList.remove('dark-mode');
      document.body.classList.remove('reduce-motion');

      service.initializeFromStorage();

      // Should remain unchanged
      expect(document.body.classList.contains('dark-mode')).toBe(false);
      expect(document.body.classList.contains('reduce-motion')).toBe(false);
    });
  });

  // Clean up after each test
  afterEach(() => {
    document.body.classList.remove('dark-mode');
    document.body.classList.remove('reduce-motion');
  });
});

describe('BrowserPreferencesService (Server)', () => {
  let service: BrowserPreferencesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        BrowserPreferencesService,
        { provide: PLATFORM_ID, useValue: 'server' }
      ]
    });

    service = TestBed.inject(BrowserPreferencesService);
  });

  it('should return null for getDarkMode on server', () => {
    expect(service.getDarkMode()).toBeNull();
  });

  it('should return null for getAnimations on server', () => {
    expect(service.getAnimations()).toBeNull();
  });

  it('should not throw when calling applyDarkMode on server', () => {
    expect(() => service.applyDarkMode(true)).not.toThrow();
  });

  it('should not throw when calling applyAnimations on server', () => {
    expect(() => service.applyAnimations(true)).not.toThrow();
  });

  it('should not throw when calling initializeFromStorage on server', () => {
    expect(() => service.initializeFromStorage()).not.toThrow();
  });
});
