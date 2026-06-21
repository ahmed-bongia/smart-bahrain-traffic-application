import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View } from "react-native";
import { AuthProvider, useAuth } from "@/src/context/AuthContext";
import "../global.css";

import { Colors } from "@/src/constants/Colors";
/**
 * Inner layout - has access to AuthContext.
 * Watches token changes and imperatively redirects so navigation
 * actually fires after login / logout / register.
 */
function RootLayoutNav() {
  const { token, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return; // still restoring token from storage

    const inAuthGroup = segments[0] === "(auth)";

    if (token && inAuthGroup) {
      // Logged in but still on an auth screen - go to tabs
      router.replace("/(tabs)");
    } else if (!token && !inAuthGroup) {
      // Logged out but not on auth screen - go to login
      router.replace("/(auth)/login");
    }
  }, [token, isLoading, segments]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color={Colors.primary.DEFAULT} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="index" />
      <Stack.Screen name="report-detail" />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <RootLayoutNav />
    </AuthProvider>
  );
}

