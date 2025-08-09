import React, { useEffect, useState } from "react";
import { Alert, View } from "react-native";
import { Button, Dialog, Portal, Text, TextInput } from "react-native-paper";
import {
  ensureDuration,
  isColorHexValid,
  nonEmpty,
} from "../../domain/validation";
import DurationPicker from "./DurationPicker";

type Props = {
  visible: boolean;
  initial: { emoji?: string; title: string; minutes: number; colorHex: string };
  onCancel: () => void;
  onSave: (s: {
    emoji?: string;
    title: string;
    minutes: number;
    colorHex: string;
  }) => Promise<void> | void;
};

export default function SequenceEditorDialog({
  visible,
  initial,
  onCancel,
  onSave,
}: Props) {
  const [emoji, setEmoji] = useState(initial.emoji || "");
  const [title, setTitle] = useState(initial.title);
  const [minutes, setMinutes] = useState(initial.minutes);
  const [colorHex, setColorHex] = useState(initial.colorHex);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (visible) {
      setEmoji(initial.emoji || "");
      setTitle(initial.title);
      setMinutes(initial.minutes);
      setColorHex(initial.colorHex);
      setBusy(false);
    }
  }, [visible]);

  async function handleSave() {
    if (!nonEmpty(title))
      return Alert.alert("Validación", "Título obligatorio");
    if (!ensureDuration(minutes))
      return Alert.alert("Validación", "Duración mínima 1 minuto");
    if (!isColorHexValid(colorHex))
      return Alert.alert("Validación", "Color inválido (#RRGGBB)");

    try {
      setBusy(true);
      await onSave({ emoji: emoji || undefined, title, minutes, colorHex });
    } catch (e: any) {
      Alert.alert("Error al guardar", e?.message || "Error desconocido");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onCancel}>
        <Dialog.Title>
          {initial.title ? "Editar secuencia" : "Nueva secuencia"}
        </Dialog.Title>
        <Dialog.Content>
          <View style={{ gap: 8 }}>
            <Text>Emoji (opcional)</Text>
            <TextInput mode="outlined" value={emoji} onChangeText={setEmoji} />
            <Text>Título</Text>
            <TextInput mode="outlined" value={title} onChangeText={setTitle} />
            <Text>Duración</Text>
            <DurationPicker minutes={minutes} onChange={setMinutes} />
            <Text>Color #RRGGBB</Text>
            <TextInput
              mode="outlined"
              value={colorHex}
              onChangeText={setColorHex}
            />
          </View>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onCancel} disabled={busy}>
            Cancelar
          </Button>
          <Button mode="contained" onPress={handleSave} loading={busy}>
            Guardar
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
