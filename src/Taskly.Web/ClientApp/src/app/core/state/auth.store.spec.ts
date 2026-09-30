import { TestBed } from '@angular/core/testing';
import { AuthStore, DEMO_STARTED_KEY } from './auth.store';

/**
 * Tests for the demo AuthStore: the shared demo identity and the 7-day client-side trial clock.
 */
describe('AuthStore (demo store)', () => {
  function createStore(): AuthStore {
    return TestBed.inject(AuthStore);
  }

  beforeEach(() => {
    localStorage.clear();
  });

  it('signs every visitor in as the same demo user', () => {
    const store = createStore();
    expect(store.user()).toBeNull();

    store.init();

    expect(store.user()?.id).toBe('demo-user');
    expect(store.firstName()).toBe('Demo');
    expect(store.fullName()).toBe('Demo User');
    expect(store.email()).toBe('you@taskly.demo');
  });

  it('allows edits while the trial runs', () => {
    const store = createStore();
    store.init();
    store.ensureTrialStarted();

    expect(store.canWrite()).toBe(true);
  });

  it('starts a 7-day trial and shows the warning while active', () => {
    const store = createStore();
    store.ensureTrialStarted();

    expect(localStorage.getItem(DEMO_STARTED_KEY)).not.toBeNull();
    expect(store.isExpired()).toBe(false);
    expect(store.showTrialWarning()).toBe(true);
    expect(store.trialHoursRemaining()).toBeGreaterThan(0);
  });

  it('is expired (and read-only) once the trial is older than 7 days', () => {
    // Seed an expired start time BEFORE the store first reads it.
    const past = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString();
    localStorage.setItem(DEMO_STARTED_KEY, past);

    const store = createStore();

    expect(store.isExpired()).toBe(true);
    expect(store.canWrite()).toBe(false);
    expect(store.showTrialWarning()).toBe(false);
  });

  it('startNewTrial resets the clock to a fresh, active window', () => {
    const past = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString();
    localStorage.setItem(DEMO_STARTED_KEY, past);
    const store = createStore();
    expect(store.isExpired()).toBe(true);

    store.startNewTrial();

    expect(store.isExpired()).toBe(false);
    expect(store.canWrite()).toBe(true);
  });

  it('ensureTrialStarted does not overwrite an existing active trial', () => {
    const store = createStore();
    store.ensureTrialStarted();
    const first = localStorage.getItem(DEMO_STARTED_KEY);

    store.ensureTrialStarted();

    expect(localStorage.getItem(DEMO_STARTED_KEY)).toBe(first);
  });
});
