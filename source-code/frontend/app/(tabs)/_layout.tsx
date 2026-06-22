import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, Platform } from "react-native";

import { Colors } from "@/src/constants/Colors";
const TAB_ACTIVE = Colors.primary.DEFAULT;
const TAB_INACTIVE = Colors.text.tertiary;

type IoniconsName = keyof typeof Ionicons.glyphMap;

interface TabIconProps {
  name: IoniconsName;
  focused: boolean;
  color: string;
  isCenter?: boolean;
}

function TabIcon({ name, focused, color, isCenter }: TabIconProps) {
  if (isCenter) {
    return (
      <View
        className="w-14 h-14 -mt-5 rounded-full bg-primary items-center justify-center"
        style={{
          shadowColor: Colors.primary.DEFAULT,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <Ionicons name={name} size={26} color={Colors.text.inverse} />
      </View>
    );
  }

  return (
    <View className="items-center justify-center pt-1">
      {focused && (
        <View className="absolute -top-1 w-5 h-1 rounded-full bg-primary" />
      )}
      <Ionicons name={name} size={24} color={color} />
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: TAB_ACTIVE,
        tabBarInactiveTintColor: TAB_INACTIVE,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: 2,
        },
        tabBarStyle: {
          backgroundColor: Colors.text.inverse,
          borderTopWidth: 0,
          height: Platform.OS === "ios" ? 88 : 68,
          paddingBottom: Platform.OS === "ios" ? 28 : 10,
          paddingTop: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.06,
          shadowRadius: 16,
          elevation: 12,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              name={focused ? "home" : "home-outline"}
              focused={focused}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="my-reports"
        options={{
          title: "My Reports",
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              name={focused ? "document-text" : "document-text-outline"}
              focused={focused}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="report"
        options={{
          title: "Report",
          tabBarIcon: ({ focused }) => (
            <TabIcon name="add" focused={focused} color={Colors.text.inverse} isCenter />
          ),
          tabBarLabel: () => null,
        }}
      />
      <Tabs.Screen
        name="rewards"
        options={{
          title: "Rewards",
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              name={focused ? "gift" : "gift-outline"}
              focused={focused}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              name={focused ? "person" : "person-outline"}
              focused={focused}
              color={color}
            />
          ),
        }}
      />
      {/* report-detail lives at app/report-detail.tsx (stack), hide if accidentally resolved here */}
      <Tabs.Screen name="report-detail" options={{ href: null }} />
    </Tabs>
  );
}

