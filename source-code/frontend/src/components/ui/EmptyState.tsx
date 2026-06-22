import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Colors } from "@/src/constants/Colors";
interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon = "document-text-outline",
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center py-12 px-8">
      <View className="w-20 h-20 rounded-full bg-primary-50 items-center justify-center mb-5">
        <Ionicons name={icon} size={36} color={Colors.primary.DEFAULT} />
      </View>
      <Text className="text-lg font-bold text-text text-center mb-2">
        {title}
      </Text>
      {description && (
        <Text className="text-sm text-text-secondary text-center leading-5">
          {description}
        </Text>
      )}
      {action && <View className="mt-5">{action}</View>}
    </View>
  );
}

