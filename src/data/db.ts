import * as SQLite from "expo-sqlite";

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) dbPromise = SQLite.openDatabaseAsync("tempsec.db");
  return dbPromise;
}

export async function initDb() {
  const db = await getDb();
  await db.execAsync(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS Migrations (
      id INTEGER PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      appliedAt INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS Groups (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS Sequences (
      id TEXT PRIMARY KEY NOT NULL,
      groupId TEXT NOT NULL,
      orderIndex INTEGER NOT NULL,
      emoji TEXT,
      title TEXT NOT NULL,
      durationMinutes INTEGER NOT NULL,
      colorHex TEXT NOT NULL,
      FOREIGN KEY(groupId) REFERENCES Groups(id) ON DELETE CASCADE,
      UNIQUE(groupId, orderIndex)
    );

    CREATE TABLE IF NOT EXISTS Settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      announceStart INTEGER NOT NULL,
      announceCountdown INTEGER NOT NULL,
      tickTackEnabled INTEGER NOT NULL,
      alarmEnabled INTEGER NOT NULL,
      tickTackVolume REAL NOT NULL
    );

    INSERT OR IGNORE INTO Settings (id, announceStart, announceCountdown, tickTackEnabled, alarmEnabled, tickTackVolume)
      VALUES (1, 1, 1, 0, 1, 0.5);
  `);
}
