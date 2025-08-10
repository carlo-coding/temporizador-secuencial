import { Group } from "../../domain/models";
import { logWarn } from "../../instrumentation/logger";
import { getDb } from "../db";

export async function listGroups(): Promise<Group[] | undefined> {
  try {
    const db = await getDb();
    return await db.getAllAsync<Group>(
      "SELECT * FROM Groups ORDER BY createdAt DESC"
    );
  } catch (e) {
    logWarn("DB:listGroupsError", {
      message: String((e as any)?.message || e),
    });
  }
}

export async function insertGroup(g: Group): Promise<void> {
  try {
    const db = await getDb();
    await db.runAsync(
      `INSERT INTO Groups (id, name, createdAt, updatedAt) VALUES (?, ?, ?, ?)`,
      [g.id, g.name, g.createdAt, g.updatedAt]
    );
  } catch (e) {
    logWarn("DB:insertGroupError", {
      message: String((e as any)?.message || e),
    });
  }
}

export async function updateGroupName(id: string, name: string): Promise<void> {
  try {
    const db = await getDb();
    const now = Date.now();
    await db.runAsync(`UPDATE Groups SET name=?, updatedAt=? WHERE id=?`, [
      name,
      now,
      id,
    ]);
  } catch (e) {
    logWarn("DB:updateGroupNameError", {
      message: String((e as any)?.message || e),
    });
  }
}

export async function deleteGroup(id: string): Promise<void> {
  try {
    const db = await getDb();
    await db.runAsync(`DELETE FROM Groups WHERE id=?`, [id]);
  } catch (e) {
    logWarn("DB:deleteGroupError", {
      message: String((e as any)?.message || e),
    });
  }
}

export async function getGroup(id: string): Promise<Group | undefined> {
  try {
    const db = await getDb();
    const row = await db.getFirstAsync<Group>(
      `SELECT * FROM Groups WHERE id=?`,
      [id]
    );
    return row ?? undefined;
  } catch (e) {
    logWarn("DB:getGroupError", {
      message: String((e as any)?.message || e),
    });
  }
}
