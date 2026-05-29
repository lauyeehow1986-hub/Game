/**
 * Backup / restore: serialize every persisted store key under a single JSON
 * envelope so the player can move their progress between browsers.
 *
 * The format is intentionally a bare wrapper around localStorage entries so
 * that as new stores are added (new persist keys) the backup grows
 * automatically — no per-store wiring needed.
 */

export const BACKUP_VERSION = 1;
export const BACKUP_PREFIX = 'sg-pathway-';

export interface BackupEnvelope {
  schema: 'sg-pathway-backup';
  version: number;
  exportedAt: number;
  entries: Record<string, string>;
}

export function collectBackup(
  storage: Pick<Storage, 'key' | 'getItem' | 'length'> = localStorage,
  now: number = Date.now(),
): BackupEnvelope {
  const entries: Record<string, string> = {};
  for (let i = 0; i < storage.length; i += 1) {
    const k = storage.key(i);
    if (!k || !k.startsWith(BACKUP_PREFIX)) continue;
    const v = storage.getItem(k);
    if (v != null) entries[k] = v;
  }
  return {
    schema: 'sg-pathway-backup',
    version: BACKUP_VERSION,
    exportedAt: now,
    entries,
  };
}

export type RestoreResult =
  | { ok: true; restored: number }
  | { ok: false; reason: string };

export function applyBackup(
  raw: string,
  storage: Pick<Storage, 'setItem'> = localStorage,
): RestoreResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, reason: 'not-json' };
  }
  if (!parsed || typeof parsed !== 'object') return { ok: false, reason: 'shape' };
  const env = parsed as Partial<BackupEnvelope>;
  if (env.schema !== 'sg-pathway-backup') return { ok: false, reason: 'schema' };
  if (!env.entries || typeof env.entries !== 'object') return { ok: false, reason: 'entries' };

  let restored = 0;
  for (const [k, v] of Object.entries(env.entries)) {
    if (!k.startsWith(BACKUP_PREFIX)) continue;
    if (typeof v !== 'string') continue;
    storage.setItem(k, v);
    restored += 1;
  }
  return { ok: true, restored };
}

export function backupFilename(now: Date = new Date()): string {
  const stamp = now.toISOString().slice(0, 19).replace(/[:T]/g, '-');
  return `sg-pathway-backup-${stamp}.json`;
}
