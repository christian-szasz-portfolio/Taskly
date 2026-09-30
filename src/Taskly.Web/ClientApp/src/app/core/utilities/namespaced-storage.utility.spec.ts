import { createNamespacedStorage } from './namespaced-storage.utility';

/** A plain in-memory Storage, so the tests never touch the real localStorage. */
function memoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length(): number {
      return map.size;
    },
    clear(): void {
      map.clear();
    },
    getItem(key: string): string | null {
      return map.has(key) ? (map.get(key) ?? null) : null;
    },
    key(index: number): string | null {
      return Array.from(map.keys())[index] ?? null;
    },
    removeItem(key: string): void {
      map.delete(key);
    },
    setItem(key: string, value: string): void {
      map.set(key, String(value));
    },
  } as Storage;
}

describe('namespaced-storage.utility', () => {
  const NS = 'taskly-demo:';

  it('stores every key under the namespace in the backing store', () => {
    const backing = memoryStorage();
    const store = createNamespacedStorage(NS, backing);

    store.setItem('colorMode', 'dark');

    expect(backing.getItem('taskly-demo:colorMode')).toBe('dark');
    expect(backing.getItem('colorMode')).toBeNull();
  });

  it('reads its own keys back without the prefix', () => {
    const backing = memoryStorage();
    const store = createNamespacedStorage(NS, backing);

    store.setItem('demo:taskItems', '[]');

    expect(store.getItem('demo:taskItems')).toBe('[]');
  });

  it('counts and enumerates only its own keys, and hands them back stripped', () => {
    const backing = memoryStorage();
    backing.setItem('someone-elses-key', 'x'); // a foreign key already there
    const store = createNamespacedStorage(NS, backing);

    store.setItem('demoStartedAt', 'now');
    store.setItem('demo:projects', '[]');

    expect(store.length).toBe(2);
    const keys = [store.key(0), store.key(1)];
    expect(keys).toContain('demoStartedAt');
    expect(keys).toContain('demo:projects');
    expect(keys).not.toContain('someone-elses-key');
  });

  it('clears only its own keys, leaving foreign ones', () => {
    const backing = memoryStorage();
    backing.setItem('extension-key', 'keep-me');
    const store = createNamespacedStorage(NS, backing);
    store.setItem('demo:comments', '[]');

    store.clear();

    expect(store.length).toBe(0);
    expect(backing.getItem('extension-key')).toBe('keep-me');
  });
});
