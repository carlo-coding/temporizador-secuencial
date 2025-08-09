import React from "react";
import { View } from "react-native";

export default function ColorSwatch({ hex }: { hex: string }) {
  return (
    <View
      style={{
        width: 20,
        height: 20,
        borderRadius: 4,
        backgroundColor: hex,
        borderWidth: 1,
      }}
    />
  );
}
