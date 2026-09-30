import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { AuthStore } from '../../../core/state/auth.store';
import { DemoDataService } from '../../../core/services/demo/demo-data.service';

/**
 * Full-page splash shown when the 7-day demo trial has expired. Invites the visitor
 * to start a fresh trial, which wipes the local demo data and re-seeds it.
 */
@Component({
  selector: 'app-trial-expired',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="trial-expired">
      <section class="card">
        <div class="badge">Demo</div>
        <h1>Your demo session has expired</h1>
        <p class="lead">
          Demo data only lives for 7 days so everyone gets a clean slate. Your previous
          changes have been cleared — start a fresh trial to explore the board again.
        </p>
        <ul class="points">
          <li>A ready-made task with items, subtasks and schedules</li>
          <li>Edit everything, manage schedules, drag the Kanban board</li>
          <li>Everything runs locally in your browser — no sign-up</li>
        </ul>
        <button type="button" class="cta" (click)="startNewTrial()">Start another trial</button>
        <p class="fine">Fresh demo data, valid for another 7 days.</p>
      </section>
    </main>
  `,
  styles: [`
    .trial-expired {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      // Transparent so the page-trial background photo (painted on <body>) shows behind the card.
      background: transparent;
    }
    .card {
      width: min(560px, 100%);
      background: var(--surface-card);
      border: 1px solid var(--border-subtle);
      border-radius: 20px;
      padding: 2.5rem;
      box-shadow: var(--shadow-md);
      text-align: center;
    }
    .badge {
      display: inline-block;
      font-size: 0.72rem;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--brand-primary);
      background: color-mix(in srgb, var(--brand-primary) 16%, transparent);
      border: 1px solid color-mix(in srgb, var(--brand-primary) 35%, transparent);
      padding: 0.25rem 0.7rem;
      border-radius: 999px;
      margin-bottom: 1.25rem;
    }
    h1 {
      margin: 0 0 0.75rem;
      font-size: 1.6rem;
      color: var(--text-primary);
    }
    .lead {
      margin: 0 0 1.5rem;
      color: var(--text-muted);
      line-height: 1.6;
    }
    .points {
      text-align: left;
      margin: 0 auto 1.75rem;
      padding: 0;
      list-style: none;
      display: grid;
      gap: 0.6rem;
      max-width: 420px;
    }
    .points li {
      position: relative;
      padding-left: 1.6rem;
      color: var(--text-secondary);
    }
    .points li::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0.45rem;
      width: 0.7rem;
      height: 0.7rem;
      border-radius: 50%;
      background: var(--brand-primary);
    }
    .cta {
      appearance: none;
      border: none;
      cursor: pointer;
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-on-brand);
      padding: 0.85rem 1.8rem;
      border-radius: 12px;
      background: linear-gradient(135deg, var(--brand-primary), var(--brand-accent));
      box-shadow: 0 10px 24px color-mix(in srgb, var(--brand-primary) 40%, transparent);
      transition: transform 0.12s ease, box-shadow 0.12s ease;
    }
    .cta:hover { transform: translateY(-1px); }
    .cta:active { transform: translateY(0); }
    .fine {
      margin: 1rem 0 0;
      font-size: 0.8rem;
      color: var(--text-tertiary);
    }
  `],
})
export class TrialExpiredComponent {
  private readonly authStore = inject(AuthStore);
  private readonly demoData = inject(DemoDataService);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  public startNewTrial(): void {
    this.demoData.resetTrial();
    this.authStore.startNewTrial();

    if (isPlatformBrowser(this.platformId)) {
      // Hard reload so every store re-seeds from the fresh demo dataset.
      window.location.assign('/home');
      return;
    }
    void this.router.navigate(['/home']);
  }
}
