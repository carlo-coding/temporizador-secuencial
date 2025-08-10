import React, { useEffect, useState } from "react";
import { Button, Dialog, Portal } from "react-native-paper";
import { StableTextInput } from "./StableTextInput";

export default function GroupRenameDialog({
  visible,
  initialName,
  onCancel,
  onSave,
}: {
  visible: boolean;
  initialName: string;
  onCancel: () => void;
  onSave: (name: string) => void;
}) {
  const [name, setName] = useState(initialName);
  useEffect(() => {
    setName(initialName);
  }, [initialName]);

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onCancel}>
        <Dialog.Title>Renombrar grupo</Dialog.Title>
        <Dialog.Content>
          <StableTextInput
            mode="outlined"
            value={name}
            onChangeText={setName}
            placeholder="Nombre"
          />
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onCancel}>Cancelar</Button>
          <Button
            onPress={() => {
              if (name.trim()) onSave(name.trim());
            }}
          >
            Guardar
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
