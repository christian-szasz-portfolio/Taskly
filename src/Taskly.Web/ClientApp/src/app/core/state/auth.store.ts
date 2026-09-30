import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { type Observable, of } from 'rxjs';
import type { DemoUser } from '../models/auth.model';

/**
 * localStorage key holding the ISO timestamp at which the current demo trial started.
 */
export const DEMO_STARTED_KEY = 'demoStartedAt';

/**
 * Duration of a demo trial: 7 days. After this the data is considered expired,
 * the app becomes read-only and the "start another trial" splash is shown.
 */
export const DEMO_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * The fixed identity used for every demo visitor. There is no authentication in the demo:
 * every visitor is the same demo user, who may edit the seeded tasks but cannot edit the
 * projects that frame them, and cannot create, import or delete anything but comments.
 */
const DEMO_USER: DemoUser = {
  id: 'demo-user',
  email: 'you@taskly.demo',
  firstName: 'Demo',
  fullName: 'Demo User',
};

/**
 * The demo session: the shared demo identity and the client-side 7-day trial clock,
 * persisted in localStorage. No tokens, no server, no real authentication.
 */
@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly platformId = inject(PLATFORM_ID);

  private readonly userSignal = signal<DemoUser | null>(null);
  /** Ticks whenever the demo clock changes (start/reset) so expiry computeds re-evaluate. */
  private readonly clockSignal = signal(0);

  public readonly user = this.userSignal.asReadonly();
  public readonly firstName = computed(() => this.userSignal()?.firstName ?? '');
  public readonly fullName = computed(() => this.userSignal()?.fullName ?? '');
  public readonly email = computed(() => this.userSignal()?.email ?? '');

  /** ISO timestamp at which the active demo trial started, or null if none. */
  public readonly demoStartedAt = computed<string | null>(() => {
    this.clockSignal();
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }
    return localStorage.getItem(DEMO_STARTED_KEY);
  });

  /** Epoch ms at which the active demo trial expires, or null if no trial started. */
  public readonly trialExpiresAt = computed<string | null>(() => {
    const started = this.demoStartedAt();
    if (!started) {
      return null;
    }
    return new Date(new Date(started).getTime() + DEMO_DURATION_MS).toISOString();
  });

  /** Whether the current demo trial has expired (or never started). */
  public readonly isExpired = computed(() => {
    const started = this.demoStartedAt();
    if (!started) {
      return true;
    }
    return Date.now() > new Date(started).getTime() + DEMO_DURATION_MS;
  });

  /**
   * Whether the visitor may edit, which is while the trial runs. Creating and deleting are never
   * allowed, and the UI has no path to them, except comments: the thread is the demo's sandbox,
   * so creating, editing and deleting comments all ride on this alone.
   */
  public readonly canWrite = computed(() => !this.isExpired());

  /** Whole days remaining in the trial (0–7 for a seven-day demo). */
  public readonly trialDaysRemaining = computed(() => {
    const expiresAt = this.trialExpiresAt();
    if (!expiresAt) {
      return null;
    }
    const diffMs = new Date(expiresAt).getTime() - Date.now();
    return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  });

  /** Whole hours remaining in the trial — used for the "expires in N hours" banner copy. */
  public readonly trialHoursRemaining = computed(() => {
    const expiresAt = this.trialExpiresAt();
    if (!expiresAt) {
      return null;
    }
    const diffMs = new Date(expiresAt).getTime() - Date.now();
    return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60)));
  });

  /** Show the warning banner whenever a trial is active and not yet expired. */
  public readonly showTrialWarning = computed(() => {
    const started = this.demoStartedAt();
    return started !== null && !this.isExpired();
  });

  /**
   * Initializes the demo session: sets the fixed demo user. An expired trial is left to the
   * splash flow, which re-seeds.
   */
  public init(): Observable<void> {
    this.userSignal.set(DEMO_USER);
    return of(undefined);
  }

  /**
   * Begins a fresh demo trial: stamps "now" as the start time. Wiping and re-seeding the
   * demo dataset is handled by the demo data service / trial-expired flow.
   */
  public startNewTrial(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    localStorage.setItem(DEMO_STARTED_KEY, new Date().toISOString());
    this.clockSignal.update((value) => value + 1);
  }

  /** Ensures a trial timestamp exists (used on first load). */
  public ensureTrialStarted(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    if (!localStorage.getItem(DEMO_STARTED_KEY)) {
      this.startNewTrial();
    }
  }
}
