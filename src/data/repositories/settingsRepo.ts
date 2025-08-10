// settings repo
import { Settings } from "../../domain/models";
import { logWarn } from "../../instrumentation/logger";
import { getDb } from "../db";

export async function getSettings(): Promise<Settings> {
  try {
    const db = await getDb();
    const row = await db.getFirstAsync<any>(
      `SELECT * FROM Settings WHERE id=1`
    );
    return {
      announceStart: !!row.announceStart,
      announceCountdown: !!row.announceCountdown,
      tickTackEnabled: !!row.tickTackEnabled,
      alarmEnabled: !!row.alarmEnabled,
      tickTackVolume: Number(row.tickTackVolume),
    };
  } catch (e) {
    logWarn("DB:getSettingsError", {
      message: String((e as any)?.message || e),
    });
    throw e;
  }
}

export async function saveSettings(s: Settings): Promise<void> {
  try {
    const db = await getDb();
    await db.runAsync(
      `UPDATE Settings SET announceStart=?, announceCountdown=?, tickTackEnabled=?, alarmEnabled=?, tickTackVolume=? WHERE id=1`,
      [
        s.announceStart ? 1 : 0,
        s.announceCountdown ? 1 : 0,
        s.tickTackEnabled ? 1 : 0,
        s.alarmEnabled ? 1 : 0,
        s.tickTackVolume,
      ]
    );
  } catch (e) {
    logWarn("DB:saveSettingsError", {
      message: String((e as any)?.message || e),
    });
    throw e;
  }
}
