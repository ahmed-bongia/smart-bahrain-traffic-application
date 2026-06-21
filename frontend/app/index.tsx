import { useEffect } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "@/src/context/AuthContext";
import { View, ActivityIndicator } from "react-native";

import { Colors } from "@/src/constants/Colors";
/**
 * Entry-point - redirects based on auth state.
 * The root layout's useEffect handles navigation after login/logout;
 * this handles the very first load before any segment is active.
 */
export default function Index() {
  const { token, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (token) {
      router.replace("/(tabs)");
    } else {
      router.replace("/(auth)/login");
    }
  }, [token, isLoading]);

  // Show nothing while deciding - root layout already shows a spinner
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <ActivityIndicator size="large" color={Colors.primary.DEFAULT} />
    </View>
  );
}

