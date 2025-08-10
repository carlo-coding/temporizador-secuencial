import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { StableTextInput } from "./StableTextInput";

export default function DurationPicker({
  minutes,
  onChange,
}: {
  minutes: number;
  onChange: (mins: number) => void;
}) {
  const [h, setH] = useState(Math.floor(minutes / 60));
  const [m, setM] = useState(minutes % 60);

  useEffect(() => {
    onChange(h * 60 + m);
  }, [h, m]);

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <Text>Horas</Text>
      <StableTextInput
        keyboardType="number-pad"
        value={String(h)}
        onChangeText={(t) => setH(Math.max(0, parseInt(t || "0")))}
        style={{ borderWidth: 1, padding: 2, minWidth: 50 }}
      />
      <Text>Min</Text>
      <StableTextInput
        keyboardType="number-pad"
        value={String(m)}
        onChangeText={(t) => {
          const v = Math.max(0, Math.min(59, parseInt(t || "0")));
          setM(v);
        }}
        style={{ borderWidth: 1, padding: 2, minWidth: 50 }}
      />
    </View>
  );
}
