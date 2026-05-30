import { describe, it, expect } from 'vitest';
import { collectBackup, applyBackup, backupFilename, BACKUP_PREFIX } from './backup';

function memStorage(): Storage & { dump: () => Record<string, string> } {
  const map = new Map<string, string>();
  const s: Storage & { dump: () => Record<string, string> } = {
    get length() { return map.size; },
    key: (i: number) => Array.from(map.keys())[i] ?? null,
    getItem: (k: string) => (map.has(k) ? (map.get(k) as string) : null),
    setItem: (k: string, v: string) => { map.set(k, v); },
    removeItem: (k: string) => { map.delete(k); },
    clear: () => map.clear(),
    dump: () => Object.fromEntries(map),
  };
  return s;
}

describe('collectBackup', () => {
  it('grabs every key with the sg-pathway prefix', () => {
    const s = memStorage();
    s.setItem(`${BACKUP_PREFIX}progress`, '{"x":1}');
    s.setItem(`${BACKUP_PREFIX}streak-v1`, '{"days":[]}');
    s.setItem('unrelated-key', 'should-be-ignored');

    const env = collectBackup(s, 1234);
    expect(env.schema).toBe('sg-pathway-backup');
    expect(env.exportedAt).toBe(1234);
    expect(Object.keys(env.entries).sort()).toEqual([
      `${BACKUP_PREFIX}progress`,
      `${BACKUP_PREFIX}streak-v1`,
    ]);
    expect((env.entries as Record<string, string>)['unrelated-key']).toBeUndefined();
  });
});

describe('applyBackup', () => {
  it('round-trips via collectBackup (every key restored byte-for-byte)', () => {
    const a = memStorage();
    a.setItem(`${BACKUP_PREFIX}progress`, '{"unlocked":["stemi","stroke"],"bestScores":{"stemi":{"score":9,"max":10}}}');
    a.setItem(`${BACKUP_PREFIX}streak-v1`, '{"days":["2026-05-28","2026-05-29"]}');
    a.setItem(`${BACKUP_PREFIX}achievements-v1`, '{"unlocked":["first-case","distinction"]}');
    const env = collectBackup(a);

    const b = memStorage();
    const res = applyBackup(JSON.stringify(env), b);
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.restored).toBe(3);
    // Strong assertion: every key + value matches, no silent drops.
    expect(b.dump()).toEqual(a.dump());
  });

  it('rejects malformed JSON', () => {
    expect(applyBackup('not-json', memStorage()).ok).toBe(false);
  });

  it('rejects a JSON object missing the schema marker', () => {
    expect(applyBackup('{"foo":"bar"}', memStorage()).ok).toBe(false);
  });

  it('ignores foreign keys without the prefix', () => {
    const env = {
      schema: 'sg-pathway-backup',
      version: 1,
      exportedAt: 0,
      entries: {
        'evil-key': 'pwn',
        [`${BACKUP_PREFIX}progress`]: 'ok',
      },
    };
    const s = memStorage();
    const res = applyBackup(JSON.stringify(env), s);
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.restored).toBe(1);
    expect(s.dump()[`${BACKUP_PREFIX}progress`]).toBe('ok');
    expect(s.dump()['evil-key']).toBeUndefined();
  });
});

describe('backupFilename', () => {
  it('formats a stable, timestamped name', () => {
    const name = backupFilename(new Date('2026-05-29T13:45:30Z'));
    expect(name).toBe('sg-pathway-backup-2026-05-29-13-45-30.json');
  });
});

describe('backup envelope schema discipline', () => {
  it('rejects an envelope from a different app (wrong schema)', () => {
    const env = {
      schema: 'some-other-app-backup',
      version: 1,
      exportedAt: 0,
      entries: { [`${BACKUP_PREFIX}progress`]: 'attacker-payload' },
    };
    expect(applyBackup(JSON.stringify(env), memStorage()).ok).toBe(false);
  });

  it('does not break when entries is empty', () => {
    const env = { schema: 'sg-pathway-backup', version: 1, exportedAt: 0, entries: {} };
    const res = applyBackup(JSON.stringify(env), memStorage());
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.restored).toBe(0);
  });
});
