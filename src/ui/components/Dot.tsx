import React from "react";
import { View } from "react-native";

export function Dot({
  size = 10,
  color = "#2ecc71", // verde
  style,
}: {
  size?: number;
  color?: string;
  style?: any;
}) {
  return (
    <View
      accessibilityLabel="estado activo"
      accessible
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
}
