import * as Speech from "expo-speech";

export async function speak(text: string) {
  try {
    Speech.speak("Iniciando " + text, {
      language: "es-ES",
      pitch: 1.0,
      rate: 1.0,
    });
  } catch {}
}

export function cancelSpeak() {
  try {
    Speech.stop();
  } catch {}
}
