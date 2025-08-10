import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, View } from "react-native";
import {
  Button,
  Card,
  Divider,
  IconButton,
  Snackbar,
  Text,
  TextInput,
} from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
import { useRuntime } from "../../runtime/runtimeStore";
import { formateaTiempo } from "../../utils/formateaTiempo";
import { uuidv4 } from "../../utils/uuid";
import { Dot } from "../components/Dot";
import GroupRenameDialog from "../components/GroupRenameDialog";

type P = NativeStackScreenProps<RootStackParamList, "Groups">;

export default function GroupsScreen({ navigation }: P) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [newName, setNewName] = useState("");
  const [snack, setSnack] = useState<string>("");
  const [rename, setRename] = useState<{ id: string; name: string } | null>(
    null
  );

  const insets = useSafeAreaInsets();

  async function refresh() {
    let groups = await listGroups();
    if (groups) setGroups(groups);
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
              Crear
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

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 96 }}>
        {groups.map((g) => (
          <GroupRow
            key={g.id}
            g={g}
            onOpen={() => navigation.navigate("GroupDetail", { groupId: g.id })}
            onRename={() => setRename({ id: g.id, name: g.name })}
            onDelete={async () => {
              Alert.alert("Confirmación", "¿Quieres borrar este grupo?", [
                {
                  text: "Cancelar",
                  style: "cancel",
                },
                {
                  text: "Confirmar",
                  async onPress() {
                    await deleteGroup(g.id);
                    refresh();
                  },
                },
              ]);
            }}
          />
        ))}
      </ScrollView>

      <Snackbar
        visible={!!snack}
        onDismiss={() => setSnack("")}
        duration={2000}
      >
        {snack}
      </Snackbar>

      <GroupRenameDialog
        visible={!!rename}
        initialName={rename?.name || ""}
        onCancel={() => setRename(null)}
        onSave={async (name) => {
          if (rename) {
            await updateGroupName(rename.id, name);
            setRename(null);
            refresh();
          }
        }}
      />
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
  }, []);

  const { currentGroupId, status } = useRuntime();

  return (
    <Card style={{ marginTop: 8 }} onPress={onOpen}>
      <Card.Title
        title={g.name}
        subtitle={formateaTiempo(total)}
        right={() => (
          <View style={{ flexDirection: "row" }}>
            {g.id == currentGroupId && status != "idle" && (
              <Dot
                style={{ marginTop: 20, marginRight: 10 }}
                color={status == "running" ? "#2ecc71" : "#FE9900"}
              />
            )}
            <IconButton icon="pencil" onPress={onRename} />
            <IconButton icon="delete" onPress={onDelete} />
          </View>
        )}
      />
    </Card>
  );
}
