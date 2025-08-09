import { Sequence } from "../../domain/models";
import { getDb } from "../db";

export async function listSequencesByGroup(
  groupId: string
): Promise<Sequence[]> {
  const db = await getDb();
  return await db.getAllAsync<Sequence>(
    `SELECT * FROM Sequences WHERE groupId=? ORDER BY orderIndex ASC`,
    [groupId]
  );
}

export async function insertSequence(s: Sequence): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO Sequences (id, groupId, orderIndex, emoji, title, durationMinutes, colorHex)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      s.id,
      s.groupId,
      s.orderIndex,
      s.emoji ?? null,
      s.title,
      s.durationMinutes,
      s.colorHex,
    ]
  );
}

export async function updateSequence(s: Sequence): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `UPDATE Sequences SET orderIndex=?, emoji=?, title=?, durationMinutes=?, colorHex=? WHERE id=?`,
    [
      s.orderIndex,
      s.emoji ?? null,
      s.title,
      s.durationMinutes,
      s.colorHex,
      s.id,
    ]
  );
}

export async function deleteSequence(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(`DELETE FROM Sequences WHERE id=?`, [id]);
}

export async function getSequence(id: string): Promise<Sequence | undefined> {
  const db = await getDb();
  const row = await db.getFirstAsync<Sequence>(
    `SELECT * FROM Sequences WHERE id=?`,
    [id]
  );
  return row ?? undefined;
}

export async function bumpOrder(
  groupId: string,
  id: string,
  delta: number
): Promise<void> {
  const db = await getDb();
  const curr = await getSequence(id);
  if (!curr) return;

  const newIndex = curr.orderIndex + delta;
  if (newIndex < 0) return;

  const neighbor = await db.getFirstAsync<Sequence>(
    `SELECT * FROM Sequences WHERE groupId=? AND orderIndex=?`,
    [groupId, newIndex]
  );

  const TEMP = -Math.floor(Date.now() % 1_000_000);

  await db.execAsync("BEGIN");
  try {
    await db.runAsync(`UPDATE Sequences SET orderIndex=? WHERE id=?`, [
      TEMP,
      curr.id,
    ]);

    if (neighbor) {
      await db.runAsync(`UPDATE Sequences SET orderIndex=? WHERE id=?`, [
        curr.orderIndex,
        neighbor.id,
      ]);
    }

    await db.runAsync(`UPDATE Sequences SET orderIndex=? WHERE id=?`, [
      newIndex,
      curr.id,
    ]);

    await db.execAsync("COMMIT");
  } catch (e) {
    await db.execAsync("ROLLBACK");
    throw e;
  }
}

export async function getNextOrderIndex(groupId: string): Promise<number> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ max: number | null }>(
    `SELECT MAX(orderIndex) as max FROM Sequences WHERE groupId=?`,
    [groupId]
  );
  const max = row?.max ?? -1;
  return (typeof max === "number" ? max : Number(max)) + 1;
}
