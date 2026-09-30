import { delay, of, type Observable } from 'rxjs';

/** The demo visitor's email, as the seeded data knows them. */
export const DEMO_USER_EMAIL = 'you@taskly.demo';

/** Simulates a network round-trip, so loading states still show. */
export function demoResponse<T>(value: T, ms = 200): Observable<T> {
  return of(structuredClone(value)).pipe(delay(ms));
}
