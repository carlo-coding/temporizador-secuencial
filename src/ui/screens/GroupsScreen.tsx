import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import {
  Button,
  Card,
  Divider,
  IconButton,
  Snackbar,
  Text,
  TextInput,
} from "react-native-paper";
import { RootStackParamList } from "../../app/AppNavigator";
import {
  deleteGroup,
  insertGroup,
  listGroups,
  updateGroupName,
} from "../../data/repositories/groupsRepo";
import { listSequencesByGroup } from "../../data/repositories/sequencesRepo";
import { Group } from "../../domain/models";
import { computeTotalMinutes } from "../../domain/usecases/computeGroupDuration";
import { importSingleGroup } from "../../domain/usecases/importExport";
import { uuidv4 } from "../../utils/uuid";

type P = NativeStackScreenProps<RootStackParamList, "Groups">;

export default function GroupsScreen({ navigation }: P) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [newName, setNewName] = useState("");
  const [snack, setSnack] = useState<string>("");

  async function refresh() {
    setGroups(await listGroups());
  }
  useEffect(() => {
    refresh();
  }, []);

  return (
    <View style={{ flex: 1, padding: 12, gap: 8 }}>
      <Card>
        <Card.Content style={{ gap: 8 }}>
          <Text variant="titleMedium">Nuevo grupo</Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <TextInput
              mode="outlined"
              placeholder="Nombre del nuevo grupo"
              value={newName}
              onChangeText={setNewName}
              style={{ flex: 1 }}
            />
            <Button
              mode="contained"
              onPress={async () => {
                const name = newName.trim();
                if (!name) return;
                const now = Date.now();
                await insertGroup({
                  id: uuidv4(),
                  name,
                  createdAt: now,
                  updatedAt: now,
                });
                setNewName("");
                refresh();
              }}
            >
              Añair
            </Button>
          </View>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Button
              mode="outlined"
              onPress={async () => {
                try {
                  await importSingleGroup();
                  await refresh();
                  setSnack("Grupo importado");
                } catch (e: any) {
                  setSnack(e?.message || "Error al importar");
                }
              }}
            >
              Importar Grupo JSON
            </Button>
            <Button
              mode="outlined"
              onPress={() => navigation.navigate("Settings")}
            >
              Configuración
            </Button>
          </View>
        </Card.Content>
      </Card>

      <Divider />

      {groups.map((g) => (
        <GroupRow
          key={g.id}
          g={g}
          onOpen={() => navigation.navigate("GroupDetail", { groupId: g.id })}
          onRename={async () => {
            const nuevo =
              (global as any).__prompt?.("Nuevo nombre", g.name) ?? g.name;
            if (nuevo && nuevo.trim()) {
              await updateGroupName(g.id, nuevo.trim());
              refresh();
            }
          }}
          onDelete={async () => {
            await deleteGroup(g.id);
            refresh();
          }}
        />
      ))}

      <Snackbar
        visible={!!snack}
        onDismiss={() => setSnack("")}
        duration={2000}
      >
        {snack}
      </Snackbar>
    </View>
  );
}

function GroupRow({
  g,
  onOpen,
  onRename,
  onDelete,
}: {
  g: Group;
  onOpen: () => void;
  onRename: () => void;
  onDelete: () => void;
}) {
  const [total, setTotal] = React.useState<number>(0);
  useEffect(() => {
    (async () => {
      const seqs = await listSequencesByGroup(g.id);
      setTotal(computeTotalMinutes(seqs));
    })();
  }, [g.id]);

  return (
    <Card style={{ marginTop: 8 }} onPress={onOpen}>
      <Card.Title
        title={g.name}
        subtitle={`${total} min`}
        right={() => (
          <View style={{ flexDirection: "row" }}>
            <IconButton icon="pencil" onPress={onRename} />
            <IconButton icon="delete" onPress={onDelete} />
          </View>
        )}
      />
    </Card>
  );
}
