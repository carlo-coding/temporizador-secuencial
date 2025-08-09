import Slider from "@react-native-community/slider";
import * as Sharing from "expo-sharing";
import React, { useEffect, useState } from "react";
import { Alert, View } from "react-native";
import { Button, Divider, Switch, Text } from "react-native-paper";
import {
  getSettings,
  saveSettings,
} from "../../data/repositories/settingsRepo";
import {
  exportAll,
  importAllReplace,
} from "../../domain/usecases/importExport";

export default function SettingsScreen() {
  const [announceStart, setAnnounceStart] = useState(true);
  const [announceCountdown, setAnnounceCountdown] = useState(true);
  const [tickTackEnabled, setTickTackEnabled] = useState(false);
  const [alarmEnabled, setAlarmEnabled] = useState(true);
  const [tickTackVolume, setTickTackVolume] = useState(0.5);

  useEffect(() => {
    (async () => {
      const s = await getSettings();
      setAnnounceStart(s.announceStart);
      setAnnounceCountdown(s.announceCountdown);
      setTickTackEnabled(s.tickTackEnabled);
      setAlarmEnabled(s.alarmEnabled);
      setTickTackVolume(s.tickTackVolume);
    })();
  }, []);

  return (
    <View style={{ flex: 1, padding: 12, gap: 12 }}>
      <Text variant="titleMedium">Voz</Text>
      <Row
        label="Anunciar inicio"
        value={announceStart}
        onChange={setAnnounceStart}
      />
      <Row
        label="Anunciar cuenta regresiva"
        value={announceCountdown}
        onChange={setAnnounceCountdown}
      />

      <Divider />
      <Text variant="titleMedium">Sonidos</Text>
      <Row
        label="Tick-tack"
        value={tickTackEnabled}
        onChange={setTickTackEnabled}
      />
      <Row label="Alarma" value={alarmEnabled} onChange={setAlarmEnabled} />
      <Text>Volumen tick-tack: {tickTackVolume.toFixed(2)}</Text>
      <Slider
        minimumValue={0}
        maximumValue={1}
        step={0.01}
        value={tickTackVolume}
        onValueChange={setTickTackVolume}
      />

      <Button
        mode="contained"
        onPress={async () => {
          await saveSettings({
            announceStart,
            announceCountdown,
            tickTackEnabled,
            alarmEnabled,
            tickTackVolume,
          });
          Alert.alert("Ajustes", "Guardados");
        }}
      >
        Guardar ajustes
      </Button>

      <Divider />
      <Text variant="titleMedium">Importar/Exportar</Text>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <Button
          mode="outlined"
          onPress={async () => {
            try {
              const path = await exportAll();
              if (await Sharing.isAvailableAsync())
                await Sharing.shareAsync(path);
              else Alert.alert("Exportación", `Archivo en caché: ${path}`);
            } catch (e: any) {
              Alert.alert("Exportación", e?.message || "Error");
            }
          }}
        >
          Exportar JSON
        </Button>
        <Button
          mode="outlined"
          onPress={async () => {
            try {
              await importAllReplace();
              Alert.alert("Importación", "Datos importados");
            } catch (e: any) {
              Alert.alert("Importación", e?.message || "Error");
            }
          }}
        >
          Importar (sobrescribe todo)
        </Button>
      </View>
    </View>
  );
}

function Row({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Text>{label}</Text>
      <Switch value={value} onValueChange={onChange} />
    </View>
  );
}
