import React from "react";
import { View, Text } from "react-native";

interface ProgressBarProps {
  progress: number; // 0-100
  label?: string;
  showPercentage?: boolean;
  color?: string;
  height?: "sm" | "md" | "lg";
}

export function ProgressBar({
  progress,
  label,
  showPercentage = true,
  color = "bg-primary",
  height = "md",
}: ProgressBarProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));
  const heightStyles = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
  };

  return (
    <View className="w-full">
      {(label || showPercentage) && (
        <View className="flex-row justify-between items-center mb-2">
          {label && (
            <Text className="text-sm font-medium text-text">{label}</Text>
          )}
          {showPercentage && (
            <Text className="text-sm font-semibold text-primary">
              {Math.round(clampedProgress)}%
            </Text>
          )}
        </View>
      )}
      <View
        className={`w-full ${heightStyles[height]} bg-surface-tertiary rounded-full overflow-hidden`}
      >
        <View
          className={`${heightStyles[height]} ${color} rounded-full`}
          style={{ width: `${clampedProgress}%` }}
        />
      </View>
    </View>
  );
}
