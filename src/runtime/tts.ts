import * as Speech from "expo-speech";
import { formateaTiempo } from "../utils/formateaTiempo";

export async function speak(text: string, minutes?: number) {
  try {
    Speech.speak(
      `Iniciando ${text}, ${minutes ? formateaTiempo(minutes) : ""}`,
      {
        language: "es-ES",
        pitch: 1.0,
        rate: 1.0,
      }
    );
  } catch {}
}

export function cancelSpeak() {
  try {
    Speech.stop();
  } catch {}
}
