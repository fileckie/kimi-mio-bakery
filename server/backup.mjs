import { mkdirSync, readdirSync, statSync, unlinkSync, copyFileSync } from "node:fs";
import { join, basename } from "node:path";

const DB_PATH = "/app/data/mio-bakery.sqlite";
const BACKUP_DIR = "/app/data/backups";
const MAX_DAYS = 30;

export function ensureBackupDir() {
  try {
    mkdirSync(BACKUP_DIR, { recursive: true });
  } catch {}
}

export function getBackupFileName(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `mio-backup-${y}-${m}-${d}.db`;
}

export function listBackups() {
  ensureBackupDir();
  try {
    return readdirSync(BACKUP_DIR)
      .filter((f) => f.endsWith(".db"))
      .map((f) => {
        const path = join(BACKUP_DIR, f);
        const stat = statSync(path);
        return {
          name: f,
          path,
          size: stat.size,
          createdAt: stat.mtime.toISOString(),
        };
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch {
    return [];
  }
}

export function cleanupOldBackups() {
  const cutoff = Date.now() - MAX_DAYS * 24 * 60 * 60 * 1000;
  const backups = listBackups();
  for (const b of backups) {
    if (new Date(b.createdAt).getTime() < cutoff) {
      try {
        unlinkSync(b.path);
        console.log(`[backup] removed old backup: ${b.name}`);
      } catch (e) {
        console.error(`[backup] failed to remove ${b.name}:`, e.message);
      }
    }
  }
}

export function backupDatabase(force = false) {
  ensureBackupDir();
  const fileName = getBackupFileName();
  const destPath = join(BACKUP_DIR, fileName);

  // skip if today's backup exists and not forced
  if (!force) {
    try {
      statSync(destPath);
      console.log(`[backup] today's backup already exists: ${fileName}`);
      return { skipped: true, path: destPath, name: fileName };
    } catch {}
  }

  try {
    copyFileSync(DB_PATH, destPath);
    console.log(`[backup] success: ${destPath}`);
    cleanupOldBackups();
    return { success: true, path: destPath, name: fileName, size: statSync(destPath).size };
  } catch (e) {
    console.error("[backup] failed:", e.message);
    throw e;
  }
}

// CLI entry: node server/backup.mjs [force]
if (import.meta.url === `file://${process.argv[1]}`) {
  const force = process.argv[2] === "force";
  const result = backupDatabase(force);
  console.log(result);
}
