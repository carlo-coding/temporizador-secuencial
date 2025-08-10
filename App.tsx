import { NavigationContainer } from "@react-navigation/native";
import * as Application from "expo-application";
import React, { useEffect } from "react";
import { Provider as PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AppNavigator from "./src/app/AppNavigator";
import theme from "./src/app/theme";
import { initDb } from "./src/data/db";
import { installGlobalErrorHandlers } from "./src/instrumentation/globalErrors";
import {
  clearLogs,
  forceFlush,
  getLogPath,
  initLogger,
  logEvent,
} from "./src/instrumentation/logger";
import {
  hookPeriodicSnapshot,
  readLastSnapshot,
} from "./src/instrumentation/sessionMonitor";
import {
  detectUncleanExitOnBoot,
  startWatchdog,
} from "./src/instrumentation/watchdog";
import { newSessionId } from "./src/utils/newSessionId";

export default function App() {
  useEffect(() => {
    (async () => {
      const sid = newSessionId();
      await initLogger(sid);
      installGlobalErrorHandlers();
      await initDb();

      const unclean = await detectUncleanExitOnBoot();
      const last = await readLastSnapshot();
      logEvent("AppBoot", {
        sessionId: sid,
        appVersion: Application.nativeApplicationVersion ?? "unknown",
        appBuild: Application.nativeBuildVersion ?? "unknown",
        uncleanExitPrev: unclean,
        prevSnapshot: last,
      });

      startWatchdog(sid);
      hookPeriodicSnapshot();
    })().catch((e) => console.error("startup error", e));

    return () => {
      // Garantiza flush de logs si RN desmonta
      forceFlush().catch(() => {});
    };
  }, []);
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

export async function exportCurrentLogPath(): Promise<string> {
  return await getLogPath();
}
export async function purgeAllLogs() {
  await clearLogs();
}
