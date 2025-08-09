import React from "react";
import { View } from "react-native";
import { Badge, Card, IconButton, Text } from "react-native-paper";
import { formateaTiempo } from "../../utils/formateaTiempo";

export default function SequenceItem({
  index,
  emoji,
  title,
  minutes,
  colorHex,
  onEdit,
  onDelete,
  onUp,
  onDown,
  onDuplicate,
}: {
  index: number;
  emoji?: string | null;
  title: string;
  minutes: number;
  colorHex: string;
  onEdit: () => void;
  onDelete: () => void;
  onUp: () => void;
  onDown: () => void;
  onDuplicate: () => void;
}) {
  return (
    <Card mode="contained" style={{ marginVertical: 6 }}>
      <Card.Content style={{ gap: 6 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text variant="titleMedium">
            {index + 1}. {emoji ? `${emoji} ` : ""}
            {title}
          </Text>
          <Badge size={26} style={{ backgroundColor: colorHex, width: 70 }}>
            {formateaTiempo(minutes, true)}
          </Badge>
        </View>
        <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
          <IconButton
            icon="arrow-up"
            onPress={onUp}
            accessibilityLabel="Subir"
          />
          <IconButton
            icon="arrow-down"
            onPress={onDown}
            accessibilityLabel="Bajar"
          />
          <IconButton
            icon="content-copy"
            onPress={onDuplicate}
            accessibilityLabel="Duplicar"
          />
          <IconButton
            icon="pencil"
            onPress={onEdit}
            accessibilityLabel="Editar"
          />
          <IconButton
            icon="delete"
            onPress={onDelete}
            accessibilityLabel="Eliminar"
          />
        </View>
      </Card.Content>
    </Card>
  );
}
