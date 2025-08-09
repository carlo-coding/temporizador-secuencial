import { Audio, InterruptionModeAndroid } from "expo-av";

let tickSound: Audio.Sound | null = null;
let alarmSound: Audio.Sound | null = null;

export async function setupAudio() {
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
    staysActiveInBackground: false,
    interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
    shouldDuckAndroid: true,
    playThroughEarpieceAndroid: false,
  });
}

export async function playTick(volume: number) {
  try {
    if (!tickSound) {
      tickSound = new Audio.Sound();
      await tickSound.loadAsync(require("../../assets/tick.wav"), {
        isLooping: true,
        volume,
      });
    }
    await tickSound.setVolumeAsync(volume);
    await tickSound.playAsync();
  } catch (e) {
    console.error(e);
  }
}

export async function stopTick() {
  try {
    if (tickSound) await tickSound.stopAsync();
  } catch {}
}

export async function playAlarmOnce() {
  try {
    if (!alarmSound) {
      alarmSound = new Audio.Sound();
      await alarmSound.loadAsync(require("../../assets/alarm.wav"), {
        isLooping: false,
        volume: 1.0,
      });
    }
    await alarmSound.replayAsync();
  } catch (e) {
    console.error(e);
  }
}
