import React from "react";
import { View, Text } from "react-native";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function SectionHeader({ title, subtitle, action }: SectionHeaderProps) {
  return (
    <View className="flex-row items-center justify-between mb-3 px-1">
      <View>
        <Text className="text-lg font-bold text-text">{title}</Text>
        {subtitle && (
          <Text className="text-sm text-text-secondary mt-0.5">{subtitle}</Text>
        )}
      </View>
      {action && <View>{action}</View>}
    </View>
  );
}
