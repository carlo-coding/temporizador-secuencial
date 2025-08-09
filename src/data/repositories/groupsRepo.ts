import { Group } from "../../domain/models";
import { getDb } from "../db";

export async function listGroups(): Promise<Group[]> {
  const db = await getDb();
  return await db.getAllAsync<Group>(
    "SELECT * FROM Groups ORDER BY createdAt DESC"
  );
}

export async function insertGroup(g: Group): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO Groups (id, name, createdAt, updatedAt) VALUES (?, ?, ?, ?)`,
    [g.id, g.name, g.createdAt, g.updatedAt]
  );
}

export async function updateGroupName(id: string, name: string): Promise<void> {
  const db = await getDb();
  const now = Date.now();
  await db.runAsync(`UPDATE Groups SET name=?, updatedAt=? WHERE id=?`, [
    name,
    now,
    id,
  ]);
}

export async function deleteGroup(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(`DELETE FROM Groups WHERE id=?`, [id]);
}

export async function getGroup(id: string): Promise<Group | undefined> {
  const db = await getDb();
  const row = await db.getFirstAsync<Group>(`SELECT * FROM Groups WHERE id=?`, [
    id,
  ]);
  return row ?? undefined;
}
