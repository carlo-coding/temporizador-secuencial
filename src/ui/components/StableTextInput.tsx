// StableTextInput.tsx
import React, { forwardRef, useEffect } from "react";
import { TextStyle } from "react-native";
import {
  TextInput as PaperTextInput,
  TextInputProps,
} from "react-native-paper";
import { useStableSelection } from "../../utils/useStableSelection";

type Props = TextInputProps & {
  /**
   * Si true, cuando cambie `value` desde fuera, el cursor salta al final.
   * Útil cuando rehidratas con un nuevo valor (p.ej. prop inicial).
   */
  resetSelectionOnValueChange?: boolean;
  style?: TextStyle | TextStyle[];
};

export const StableTextInput = forwardRef<any, Props>(function StableTextInput(
  {
    value = "",
    onSelectionChange,
    resetSelectionOnValueChange = false,
    style,
    ...rest
  },
  ref
) {
  const {
    selection,
    onSelectionChange: hookSelChange,
    resetToEnd,
  } = useStableSelection(
    typeof value === "string" ? value : String(value ?? "")
  );

  useEffect(() => {
    if (resetSelectionOnValueChange) {
      resetToEnd(typeof value === "string" ? value : String(value ?? ""));
    }
  }, [value, resetSelectionOnValueChange, resetToEnd]);

  return (
    <PaperTextInput
      ref={ref}
      value={value}
      selection={selection}
      onSelectionChange={(e) => {
        hookSelChange(e);
        onSelectionChange?.(e);
      }}
      style={[{ writingDirection: "ltr", textAlign: "left" }, style]}
      {...rest}
    />
  );
});
