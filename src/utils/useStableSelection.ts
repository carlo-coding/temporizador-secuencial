import { useCallback, useState } from "react";
import type {
  NativeSyntheticEvent,
  TextInputSelectionChangeEventData,
} from "react-native";

type Sel = { start: number; end: number };

export function useStableSelection(initialText: string) {
  const [selection, setSelection] = useState<Sel>(() => {
    const end = initialText?.length ?? 0;
    return { start: end, end };
  });

  const resetToEnd = useCallback((text: string) => {
    const end = text?.length ?? 0;
    setSelection({ start: end, end });
  }, []);

  const onSelectionChange = useCallback(
    (e: NativeSyntheticEvent<TextInputSelectionChangeEventData>) => {
      setSelection(e.nativeEvent.selection);
    },
    []
  );

  return { selection, setSelection, onSelectionChange, resetToEnd };
}
