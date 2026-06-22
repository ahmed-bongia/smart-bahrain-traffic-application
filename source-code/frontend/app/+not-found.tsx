import React from "react";
import { View, Text } from "react-native";
import { Link, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { Colors } from "@/src/constants/Colors";
export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View className="flex-1 items-center justify-center bg-background px-8">
        <View className="w-20 h-20 rounded-full bg-primary-50 items-center justify-center mb-5">
          <Ionicons name="alert-circle-outline" size={40} color={Colors.primary.DEFAULT} />
        </View>
        <Text className="text-xl font-bold text-text mb-2">Page Not Found</Text>
        <Text className="text-sm text-text-secondary text-center mb-6">
          The screen you&apos;re looking for doesn&apos;t exist.
        </Text>
        <Link href="/" className="bg-primary px-6 py-3 rounded-2xl">
          <Text className="text-white font-semibold">Go Home</Text>
        </Link>
      </View>
    </>
  );
}

