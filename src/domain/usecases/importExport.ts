import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { insertGroup, listGroups } from "../../data/repositories/groupsRepo";
import { listSequencesByGroup } from "../../data/repositories/sequencesRepo";
import {
  getSettings,
  saveSettings,
} from "../../data/repositories/settingsRepo";
import { uuidv4 } from "../../utils/uuid";
import { Group, Sequence, Settings } from "../models";

type ExportBundle = {
  version: 1;
  groups: (Group & { sequences: Sequence[] })[];
  settings: Settings;
};

export async function exportAll(): Promise<string> {
  const groups = await listGroups();
  const bundles: (Group & { sequences: Sequence[] })[] = [];
  for (const g of groups) {
    const seqs = await listSequencesByGroup(g.id);
    bundles.push({ ...g, sequences: seqs });
  }
  const settings = await getSettings();
  const payload: ExportBundle = { version: 1, groups: bundles, settings };

  const json = JSON.stringify(payload, null, 2);
  const path = FileSystem.cacheDirectory + `export-${Date.now()}.json`;
  await FileSystem.writeAsStringAsync(path, json, {
    encoding: FileSystem.EncodingType.UTF8,
  });
  return path;
}

export async function importAllReplace(): Promise<void> {
  const pick = await DocumentPicker.getDocumentAsync({
    type: "application/json",
    multiple: false,
    copyToCacheDirectory: true,
  });
  if (!pick.assets || pick.assets.length === 0) return;

  const json = await FileSystem.readAsStringAsync(pick.assets[0].uri, {
    encoding: FileSystem.EncodingType.UTF8,
  });
  let parsed: ExportBundle;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error("JSON no válido");
  }
  if (
    parsed.version !== 1 ||
    !Array.isArray(parsed.groups) ||
    !parsed.settings
  ) {
    throw new Error("Estructura JSON inválida");
  }

  const dbm = await (await import("../../data/db")).getDb();
  await dbm.execAsync("BEGIN");
  try {
    await dbm.execAsync("DELETE FROM Sequences");
    await dbm.execAsync("DELETE FROM Groups");
    await saveSettings(parsed.settings);

    for (const g of parsed.groups) {
      await insertGroup({
        id: g.id || uuidv4(),
        name: g.name,
        createdAt: g.createdAt || Date.now(),
        updatedAt: g.updatedAt || Date.now(),
      });
      for (const s of g.sequences) {
        await dbm.runAsync(
          `INSERT INTO Sequences (id, groupId, orderIndex, emoji, title, durationMinutes, colorHex)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            s.id || uuidv4(),
            g.id,
            s.orderIndex,
            s.emoji ?? null,
            s.title,
            s.durationMinutes,
            s.colorHex,
          ]
        );
      }
    }
    await dbm.execAsync("COMMIT");
  } catch (e) {
    await dbm.execAsync("ROLLBACK");
    throw e;
  }
}

export async function importSingleGroup(): Promise<void> {
  const pick = await DocumentPicker.getDocumentAsync({
    type: "application/json",
    multiple: false,
    copyToCacheDirectory: true,
  });
  if (!pick.assets || pick.assets.length === 0) return;

  const json = await FileSystem.readAsStringAsync(pick.assets[0].uri, {
    encoding: FileSystem.EncodingType.UTF8,
  });
  let parsed: any;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error("JSON no válido");
  }

  if (!parsed?.name || !Array.isArray(parsed?.sequences)) {
    throw new Error("Estructura mínima inválida");
  }

  const { uuidv4 } = await import("../../utils/uuid");
  const { insertSequence } = await import(
    "../../data/repositories/sequencesRepo"
  );
  const now = Date.now();
  const newGroupId = uuidv4();

  await insertGroup({
    id: newGroupId,
    name: parsed.name,
    createdAt: now,
    updatedAt: now,
  });

  let idx = 0;
  for (const s of parsed.sequences) {
    if (!s?.title || !Number.isInteger(s?.durationMinutes)) continue;
    await insertSequence({
      id: uuidv4(),
      groupId: newGroupId,
      orderIndex: Number.isInteger(s.orderIndex) ? s.orderIndex : idx++,
      emoji: s.emoji ?? null,
      title: s.title,
      durationMinutes: Math.max(1, s.durationMinutes),
      colorHex: /^#[0-9A-Fa-f]{6}$/.test(s.colorHex || "")
        ? s.colorHex
        : "#2D6E80",
    });
  }
}
