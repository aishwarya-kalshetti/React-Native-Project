import "react-native-gesture-handler";
import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Provider as PaperProvider } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";

import UserDashboard from "./src/screens/UserDashboard";
import AdminDashboard from "./src/screens/AdminDashboard";
import { initDB } from "./src/db/database";

export type RootTabParamList = {
  UserDashboard: undefined;
  AdminDashboard: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function App() {
  useEffect(() => {
    initDB(); 
  }, []);

  return (
    <PaperProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: true,
            tabBarIcon: ({ color, size }) => {
              let iconName: keyof typeof MaterialIcons.glyphMap =
                route.name === "UserDashboard"
                  ? "person"
                  : "admin-panel-settings";
              return <MaterialIcons name={iconName} size={size} color={color} />;
            },
          })}
        >
          <Tab.Screen
            name="UserDashboard"
            component={UserDashboard}
            options={{ title: "User" }}
          />
          <Tab.Screen
            name="AdminDashboard"
            component={AdminDashboard}
            options={{ title: "Admin" }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
