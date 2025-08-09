import { NavigationContainer } from "@react-navigation/native";
import React, { useEffect } from "react";
import { Provider as PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AppNavigator from "./src/app/AppNavigator";
import theme from "./src/app/theme";
import { initDb } from "./src/data/db";

export default function App() {
  useEffect(() => {
    initDb().catch((e) => console.error("DB init error", e));
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
