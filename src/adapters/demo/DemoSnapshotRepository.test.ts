import { describe, expect, it } from 'vitest';

import { createCanonicalSnapshot } from './seeds';
import {
  DemoSnapshotRepository,
  type StorageLike,
} from './DemoSnapshotRepository';

class MutableStorage implements StorageLike {
  value: string | null = null;

  getItem() {
    return this.value;
  }

  setItem(_key: string, value: string) {
    this.value = value;
  }
}

describe('DemoSnapshotRepository', () => {
  it('rejects malformed nested same-schema state', () => {
    const storage = new MutableStorage();
    storage.value = JSON.stringify({
      ...createCanonicalSnapshot(),
      activeRole: 'attacker',
    });
    const repository = new DemoSnapshotRepository(storage);

    expect(repository.load()).toMatchObject({
      ok: false,
      error: { code: 'CORRUPT_STATE' },
    });
  });

  it('rejects stale seed data instead of silently retaining it', () => {
    const storage = new MutableStorage();
    storage.value = JSON.stringify({
      ...createCanonicalSnapshot(),
      seedVersion: 'stale-seed',
    });
    const repository = new DemoSnapshotRepository(storage);

    expect(repository.load()).toMatchObject({
      ok: false,
      error: { code: 'CORRUPT_STATE' },
    });
  });

  it('rejects unsafe versions and impossible primary journey pointers', () => {
    const storage = new MutableStorage();
    storage.value = JSON.stringify({
      ...createCanonicalSnapshot(),
      version: Number.MAX_SAFE_INTEGER + 1,
    });
    expect(new DemoSnapshotRepository(storage).load()).toMatchObject({
      ok: false,
      error: { code: 'CORRUPT_STATE' },
    });

    const canonical = createCanonicalSnapshot();
    storage.value = JSON.stringify({
      ...canonical,
      employees: canonical.employees.map((employee) =>
        employee.isPrimary && employee.scenarioId === canonical.activeScenarioId
          ? { ...employee, state: 'BOOKED', bookingId: undefined }
          : employee,
      ),
    });
    expect(new DemoSnapshotRepository(storage).load()).toMatchObject({
      ok: false,
      error: { code: 'CORRUPT_STATE' },
    });
  });

  it('converts browser storage exceptions into the Result contract', () => {
    const storage: StorageLike = {
      getItem() {
        throw new Error('storage blocked');
      },
      setItem() {
        throw new Error('storage blocked');
      },
    };
    const repository = new DemoSnapshotRepository(storage);

    expect(repository.load()).toMatchObject({
      ok: false,
      error: { code: 'CORRUPT_STATE' },
    });
  });
});
