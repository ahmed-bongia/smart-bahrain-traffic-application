import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "./Card";

import { Colors } from "@/src/constants/Colors";
interface StatCardProps {
  title: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
  iconBgColor?: string;
  iconColor?: string;
  trend?: { value: number; isPositive: boolean };
  onPress?: () => void;
}

export function StatCard({
  title,
  value,
  icon,
  iconBgColor = "bg-primary-50",
  iconColor = Colors.primary.DEFAULT,
  trend,
  onPress,
}: StatCardProps) {
  const Wrapper = onPress ? TouchableOpacity : View;

  return (
    <Wrapper onPress={onPress} activeOpacity={0.85}>
      <Card variant="elevated" className="flex-1">
        <View className="flex-row items-center justify-between mb-3">
          <View
            className={`w-10 h-10 rounded-xl ${iconBgColor} items-center justify-center`}
          >
            <Ionicons name={icon} size={20} color={iconColor} />
          </View>
          {trend && (
            <View
              className={`flex-row items-center px-2 py-0.5 rounded-full ${
                trend.isPositive ? "bg-emerald-50" : "bg-red-50"
              }`}
            >
              <Ionicons
                name={trend.isPositive ? "trending-up" : "trending-down"}
                size={12}
                color={trend.isPositive ? Colors.status.success : Colors.status.error}
              />
              <Text
                className={`text-xs font-semibold ml-0.5 ${
                  trend.isPositive ? "text-emerald-600" : "text-red-600"
                }`}
              >
                {trend.value}%
              </Text>
            </View>
          )}
        </View>
        <Text className="text-2xl font-bold text-text">{value}</Text>
        <Text className="text-xs text-text-secondary mt-0.5">{title}</Text>
      </Card>
    </Wrapper>
  );
}

