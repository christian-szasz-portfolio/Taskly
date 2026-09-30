import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { EMPTY } from 'rxjs';
import { DemoStorageAlertDialogComponent } from '../../../shared/components/demo-storage-alert-dialog/demo-storage-alert-dialog.component';
import type { DemoStorageAlertData } from '../../../shared/components/demo-storage-alert-dialog/demo-storage-alert-dialog.interfaces';
import { DEMO_COLLECTION_KEYS, DemoDataService, DEMO_STORE_PREFIX } from './demo-data.service';

describe('DemoDataService', () => {
  let service: DemoDataService;
  let dialog: { open: ReturnType<typeof vi.fn> };

  /** The (component, data) of the last dialog.open call — typed to avoid `any` leaking into assertions. */
  const lastAlert = (): { component: unknown; data: DemoStorageAlertData } => {
    const calls = dialog.open.mock.calls as [unknown, { data: DemoStorageAlertData }][];
    const [component, config] = calls[calls.length - 1];
    return { component, data: config.data };
  };

  beforeEach(() => {
    localStorage.clear();
    // open() returns a ref whose afterClosed() completes without emitting, so the ref-guard clears
    // synchronously and no reload handler runs in tests.
    dialog = { open: vi.fn().mockReturnValue({ afterClosed: () => EMPTY }) };
    TestBed.configureTestingModule({
      providers: [{ provide: MatDialog, useValue: dialog }],
    });
    service = TestBed.inject(DemoDataService);
  });

  it('seeds a collection on first read and persists it', () => {
    const seed = () => [{ id: 1 }, { id: 2 }];

    const first = service.readCollection('widgets', seed);

    expect(first).toEqual([{ id: 1 }, { id: 2 }]);
    expect(localStorage.getItem(`${DEMO_STORE_PREFIX}widgets`)).not.toBeNull();
  });

  it('returns persisted data on subsequent reads (seed not re-run)', () => {
    service.writeCollection('widgets', [{ id: 99 }]);

    const seed = vi.fn(() => [{ id: 1 }]);
    const result = service.readCollection('widgets', seed);

    expect(result).toEqual([{ id: 99 }]);
    expect(seed).not.toHaveBeenCalled();
  });

  it('resetTrial wipes all demo keys and the trial timestamp', () => {
    service.writeCollection('widgets', [{ id: 1 }]);
    service.writeCollection('gadgets', [{ id: 2 }]);
    localStorage.setItem('demoStartedAt', new Date().toISOString());
    localStorage.setItem('unrelated', 'keep-me');

    service.resetTrial();

    expect(localStorage.getItem(`${DEMO_STORE_PREFIX}widgets`)).toBeNull();
    expect(localStorage.getItem(`${DEMO_STORE_PREFIX}gadgets`)).toBeNull();
    expect(localStorage.getItem('demoStartedAt')).toBeNull();
    expect(localStorage.getItem('unrelated')).toBe('keep-me');
  });

  describe('quota guard', () => {
    it('shows the storage-full modal instead of throwing when the write exceeds quota', () => {
      const quotaError = new DOMException('exceeded', 'QuotaExceededError');
      const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw quotaError;
      });

      expect(() => service.writeCollection('widgets', [{ id: 1 }])).not.toThrow();
      expect(lastAlert().component).toBe(DemoStorageAlertDialogComponent);
      expect(lastAlert().data).toMatchObject({ title: 'Storage full', showReload: false });

      setItem.mockRestore();
    });

    it('shows the quota modal only once across repeated failed saves', () => {
      const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new DOMException('exceeded', 'QuotaExceededError');
      });

      service.writeCollection('widgets', [{ id: 1 }]);
      service.writeCollection('widgets', [{ id: 2 }]);

      expect(dialog.open).toHaveBeenCalledTimes(1);
      setItem.mockRestore();
    });

    it('rethrows errors that are not quota failures', () => {
      const boom = new Error('nope');
      const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw boom;
      });

      expect(() => service.writeCollection('widgets', [{ id: 1 }])).toThrow(boom);
      expect(dialog.open).not.toHaveBeenCalled();

      setItem.mockRestore();
    });
  });

  describe('deletion detection', () => {
    it('does not alert on a missing key before detection is armed', () => {
      service.writeCollection(DEMO_COLLECTION_KEYS.projects, [{ id: 'p1' }]);
      localStorage.removeItem(`${DEMO_STORE_PREFIX}${DEMO_COLLECTION_KEYS.projects}`);

      service.readCollection(DEMO_COLLECTION_KEYS.projects, () => []);

      expect(dialog.open).not.toHaveBeenCalled();
    });

    it('shows the "data removed" modal when one of several keys is removed', () => {
      service.writeCollection(DEMO_COLLECTION_KEYS.projects, [{ id: 'p1' }]);
      service.writeCollection(DEMO_COLLECTION_KEYS.taskItems, [{ id: 't1' }]);
      service.armLossDetection();

      localStorage.removeItem(`${DEMO_STORE_PREFIX}${DEMO_COLLECTION_KEYS.taskItems}`);
      service.readCollection(DEMO_COLLECTION_KEYS.taskItems, () => []);

      expect(lastAlert().component).toBe(DemoStorageAlertDialogComponent);
      expect(lastAlert().data).toMatchObject({ title: 'Demo data removed', showReload: true });
    });

    it('shows the "workspace cleared" modal when every collection is gone', () => {
      service.writeCollection(DEMO_COLLECTION_KEYS.projects, [{ id: 'p1' }]);
      service.writeCollection(DEMO_COLLECTION_KEYS.taskItems, [{ id: 't1' }]);
      service.armLossDetection();

      localStorage.removeItem(`${DEMO_STORE_PREFIX}${DEMO_COLLECTION_KEYS.projects}`);
      localStorage.removeItem(`${DEMO_STORE_PREFIX}${DEMO_COLLECTION_KEYS.taskItems}`);
      service.readCollection(DEMO_COLLECTION_KEYS.projects, () => []);

      expect(lastAlert().component).toBe(DemoStorageAlertDialogComponent);
      expect(lastAlert().data).toMatchObject({ title: 'Demo workspace cleared', showReload: true });
    });

    it('alerts only once across a burst of missing reads', () => {
      service.writeCollection(DEMO_COLLECTION_KEYS.projects, [{ id: 'p1' }]);
      service.writeCollection(DEMO_COLLECTION_KEYS.taskItems, [{ id: 't1' }]);
      service.armLossDetection();

      localStorage.removeItem(`${DEMO_STORE_PREFIX}${DEMO_COLLECTION_KEYS.projects}`);
      localStorage.removeItem(`${DEMO_STORE_PREFIX}${DEMO_COLLECTION_KEYS.taskItems}`);
      service.readCollection(DEMO_COLLECTION_KEYS.projects, () => []);
      service.readCollection(DEMO_COLLECTION_KEYS.taskItems, () => []);

      expect(dialog.open).toHaveBeenCalledTimes(1);
    });

    it('resetTrial disarms detection', () => {
      service.writeCollection(DEMO_COLLECTION_KEYS.projects, [{ id: 'p1' }]);
      service.armLossDetection();
      service.resetTrial();

      service.readCollection(DEMO_COLLECTION_KEYS.projects, () => []);

      expect(dialog.open).not.toHaveBeenCalled();
    });
  });
});
