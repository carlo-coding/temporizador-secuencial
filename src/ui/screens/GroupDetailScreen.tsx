import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useMemo, useState } from "react";
import { Alert, ScrollView, View } from "react-native";
import {
  Button,
  Card,
  Divider,
  FAB,
  IconButton,
  Text,
} from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RootStackParamList } from "../../app/AppNavigator";
import { getGroup } from "../../data/repositories/groupsRepo";
import {
  bumpOrder,
  deleteSequence,
  insertSequence,
  listSequencesByGroup,
  updateSequence,
} from "../../data/repositories/sequencesRepo";
import { getSettings } from "../../data/repositories/settingsRepo";
import { Sequence } from "../../domain/models";
import { computeTotalMinutes } from "../../domain/usecases/computeGroupDuration";
import {
  playAlarmOnce,
  playTick,
  setupAudio,
  stopTick,
} from "../../runtime/audio";
import { useRuntime } from "../../runtime/runtimeStore";
import {
  adjustTimer,
  pauseTimer,
  resumeTimer,
  startTimer,
  stopTimer,
} from "../../runtime/timerEngine";
import { speak } from "../../runtime/tts";
import { minutesToMs, msToHHMMSS } from "../../utils/format";
import { uuidv4 } from "../../utils/uuid";
import SequenceEditorModal from "../components/SequenceEditorModal";
import SequenceItem from "../components/SequenceItem";

type P = NativeStackScreenProps<RootStackParamList, "GroupDetail">;

export default function GroupDetailScreen({ route }: P) {
  const insets = useSafeAreaInsets();
  const groupId = route.params.groupId;
  const [groupName, setGroupName] = useState<string>("");
  const [seqs, setSeqs] = useState<Sequence[]>([]);
  const [editor, setEditor] = useState<{
    visible: boolean;
    editId?: string;
  } | null>(null);
  const runtime = useRuntime();

  async function refresh() {
    const g = await getGroup(groupId);
    setGroupName(g?.name || "");
    setSeqs(await listSequencesByGroup(groupId));
  }

  useEffect(() => {
    refresh();
    setupAudio();
  }, []);

  const totalMinutes = useMemo(() => computeTotalMinutes(seqs), [seqs]);
  const currentSeq = () => seqs[runtime.currentSequenceIndex];

  async function startSequenceAt(index: number) {
    if (!seqs[index]) return;
    const s = seqs[index];

    const settings = await getSettings();
    if (settings.tickTackEnabled) playTick(settings.tickTackVolume);
    else stopTick();

    if (settings.announceStart) speak(s.title);

    runtime.setState({ currentGroupId: groupId, currentSequenceIndex: index });
    startTimer(minutesToMs(s.durationMinutes), async () => {
      stopTick();
      if (settings.alarmEnabled) playAlarmOnce();

      const next = index + 1;
      if (seqs[next]) {
        await startSequenceAt(next);
      } else {
        runtime.setState({ status: "idle", remainingMillis: 0, endTime: null });
        Alert.alert("Grupo", "Terminó la última secuencia.");
      }
    });
  }

  function onAdjust(msDelta: number) {
    adjustTimer(msDelta);
  }

  return (
    <View style={{ flex: 1, padding: 12, paddingBottom: 12 + insets.bottom }}>
      <Text variant="titleLarge">
        {groupName} — Total {totalMinutes} min
      </Text>

      <Card style={{ marginVertical: 8 }}>
        <Card.Content style={{ gap: 8, alignItems: "center" }}>
          <Text variant="displayMedium">
            {msToHHMMSS(runtime.remainingMillis)}
          </Text>
          <Text variant="titleMedium">
            {currentSeq()?.title ?? "Sin secuencia seleccionada"}
          </Text>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 6,
              justifyContent: "center",
            }}
          >
            {runtime.status === "idle" && (
              <Button
                mode="contained"
                onPress={() =>
                  startSequenceAt(runtime.currentSequenceIndex || 0)
                }
              >
                Iniciar
              </Button>
            )}
            {runtime.status === "running" && (
              <Button
                mode="contained-tonal"
                onPress={() => {
                  pauseTimer();
                  stopTick();
                }}
              >
                Pausar
              </Button>
            )}
            {runtime.status === "paused" && (
              <Button
                mode="contained"
                onPress={() => {
                  resumeTimer(() => {});
                  (async () => {
                    const st = await getSettings();
                    if (st.tickTackEnabled) playTick(st.tickTackVolume);
                  })();
                }}
              >
                Reanudar
              </Button>
            )}
            <IconButton
              icon="skip-previous"
              onPress={() => {
                const prev = Math.max(0, runtime.currentSequenceIndex - 1);
                stopTimer();
                startSequenceAt(prev);
              }}
            />
            <IconButton
              icon="skip-next"
              onPress={() => {
                const next = Math.min(
                  seqs.length - 1,
                  runtime.currentSequenceIndex + 1
                );
                stopTimer();
                startSequenceAt(next);
              }}
            />
            <IconButton icon="minus" onPress={() => onAdjust(-10000)} />
            <IconButton icon="plus" onPress={() => onAdjust(+10000)} />
            <Button
              onPress={() => {
                stopTimer();
                startSequenceAt(runtime.currentSequenceIndex);
              }}
            >
              Reiniciar
            </Button>
            <Button
              mode="outlined"
              onPress={() => {
                stopTimer();
                stopTick();
                runtime.reset();
              }}
            >
              Terminar
            </Button>
          </View>
        </Card.Content>
      </Card>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 4,
        }}
      >
        <Text variant="titleMedium">Secuencias</Text>
        <Button onPress={() => setEditor({ visible: true })}>
          Añadir Secuencia
        </Button>
      </View>
      <Divider />

      {/* Lista simple (reusa SequenceItem existente) */}
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 96 }}>
        {seqs.map((item, index) => (
          <View key={item.id}>
            <SequenceItem
              index={index}
              emoji={item.emoji}
              title={item.title}
              minutes={item.durationMinutes}
              colorHex={item.colorHex}
              onEdit={() => setEditor({ visible: true, editId: item.id })}
              onDelete={async () => {
                await deleteSequence(item.id);
                if (runtime.currentSequenceIndex >= seqs.length - 1)
                  runtime.setState({
                    currentSequenceIndex: Math.max(0, seqs.length - 2),
                  });
                refresh();
              }}
              onUp={async () => {
                await bumpOrder(groupId, item.id, -1);
                refresh();
              }}
              onDown={async () => {
                await bumpOrder(groupId, item.id, +1);
                refresh();
              }}
              onDuplicate={async () => {
                await insertSequence({
                  ...item,
                  id: uuidv4(),
                  orderIndex: item.orderIndex + 1,
                  title: item.title + " (cop)",
                });
                refresh();
              }}
            />
            <Divider />
          </View>
        ))}
      </ScrollView>
      <FAB
        icon="plus"
        style={{ position: "absolute", right: 16, bottom: 16 + insets.bottom }}
        onPress={() => setEditor({ visible: true })}
      />

      {editor && (
        <SequenceEditorModal
          visible={editor.visible}
          initial={(() => {
            if (!editor.editId)
              return { emoji: "", title: "", minutes: 1, colorHex: "#2D6E80" };
            const s = seqs.find((x) => x.id === editor.editId)!;
            return {
              emoji: s.emoji || "",
              title: s.title,
              minutes: s.durationMinutes,
              colorHex: s.colorHex,
            };
          })()}
          onCancel={() => setEditor(null)}
          onSave={async (val) => {
            if (!editor?.editId) {
              await insertSequence({
                id: uuidv4(),
                groupId,
                orderIndex: seqs.length,
                emoji: val.emoji,
                title: val.title,
                durationMinutes: Math.max(1, val.minutes),
                colorHex: val.colorHex,
              });
            } else {
              const s = seqs.find((x) => x.id === editor.editId)!;
              await updateSequence({
                ...s,
                emoji: val.emoji,
                title: val.title,
                durationMinutes: Math.max(1, val.minutes),
                colorHex: val.colorHex,
              });
            }
            setEditor(null);
            refresh();
          }}
        />
      )}
    </View>
  );
}
