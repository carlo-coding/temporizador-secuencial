import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import GroupDetailScreen from "../ui/screens/GroupDetailScreen";
import GroupsScreen from "../ui/screens/GroupsScreen";
import SettingsScreen from "../ui/screens/SettingsScreen";

export type RootStackParamList = {
  Groups: undefined;
  GroupDetail: { groupId: string };
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Groups"
        component={GroupsScreen}
        options={{ title: "Grupos" }}
      />
      <Stack.Screen
        name="GroupDetail"
        component={GroupDetailScreen}
        options={{ title: "Detalle de Grupo" }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: "Configuración" }}
      />
    </Stack.Navigator>
  );
}
