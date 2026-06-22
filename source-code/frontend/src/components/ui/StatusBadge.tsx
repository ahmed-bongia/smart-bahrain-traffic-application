import React from "react";
import { View, Text } from "react-native";
import type { ReportStatus } from "@/src/types";

interface StatusBadgeProps {
  status: ReportStatus | string;
  size?: "sm" | "md";
}

const statusConfig: Record<
  string,
  { label: string; bgColor: string; textColor: string; dotColor: string }
> = {
  pending: {
    label: "Pending",
    bgColor: "bg-amber-50",
    textColor: "text-amber-700",
    dotColor: "bg-amber-500",
  },
  in_progress: {
    label: "In Progress",
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
    dotColor: "bg-blue-500",
  },
  resolved: {
    label: "Verified",
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-700",
    dotColor: "bg-emerald-500",
  },
  rejected: {
    label: "Rejected",
    bgColor: "bg-red-50",
    textColor: "text-red-700",
    dotColor: "bg-red-500",
  },
};

export function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.pending;
  const sizeStyles = size === "sm" ? "px-2.5 py-1" : "px-3 py-1.5";
  const textSize = size === "sm" ? "text-xs" : "text-sm";
  const dotSize = size === "sm" ? "w-1.5 h-1.5" : "w-2 h-2";

  return (
    <View
      className={`flex-row items-center ${config.bgColor} rounded-full ${sizeStyles}`}
    >
      <View className={`${dotSize} rounded-full ${config.dotColor} mr-1.5`} />
      <Text className={`${textSize} font-medium ${config.textColor}`}>
        {config.label}
      </Text>
    </View>
  );
}
