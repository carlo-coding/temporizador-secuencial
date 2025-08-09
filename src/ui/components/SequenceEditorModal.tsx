import React, { useState } from "react";
import { Alert, Button, Modal, Text, TextInput, View } from "react-native";
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
  }) => void;
};

export default function SequenceEditorModal({
  visible,
  initial,
  onCancel,
  onSave,
}: Props) {
  const [emoji, setEmoji] = useState(initial.emoji || "");
  const [title, setTitle] = useState(initial.title);
  const [minutes, setMinutes] = useState(initial.minutes);
  const [colorHex, setColorHex] = useState(initial.colorHex);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onCancel}>
      <View style={{ padding: 16, gap: 12 }}>
        <Text>Emoji (opcional)</Text>
        <TextInput
          value={emoji}
          onChangeText={setEmoji}
          style={{ borderWidth: 1, padding: 8 }}
        />

        <Text>Título</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          style={{ borderWidth: 1, padding: 8 }}
        />

        <Text>Duración</Text>
        <DurationPicker minutes={minutes} onChange={setMinutes} />

        <Text>Color #RRGGBB</Text>
        <TextInput
          value={colorHex}
          onChangeText={setColorHex}
          style={{ borderWidth: 1, padding: 8 }}
        />

        <View style={{ flexDirection: "row", gap: 12 }}>
          <Button title="Cancelar" onPress={onCancel} />
          <Button
            title="Guardar"
            onPress={() => {
              if (!nonEmpty(title))
                return Alert.alert("Validación", "Título obligatorio");
              if (!ensureDuration(minutes))
                return Alert.alert("Validación", "Duración mínima 1 minuto");
              if (!isColorHexValid(colorHex))
                return Alert.alert("Validación", "Color inválido");
              onSave({ emoji: emoji || undefined, title, minutes, colorHex });
            }}
          />
        </View>
      </View>
    </Modal>
  );
}
