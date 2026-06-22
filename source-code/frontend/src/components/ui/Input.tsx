import React, { useState } from "react";
import { View, TextInput, Text, type TextInputProps } from "react-native";

import { Colors } from "@/src/constants/Colors";
interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export function Input({
  label,
  error,
  icon,
  className = "",
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View className={`mb-4 ${className}`}>
      {label && (
        <Text className="text-sm font-medium text-text mb-1.5">{label}</Text>
      )}
      <View
        className={`flex-row items-center bg-surface-secondary rounded-xl px-4 py-3 border ${
          error
            ? "border-status-error"
            : isFocused
              ? "border-primary"
              : "border-transparent"
        }`}
      >
        {icon && <View className="mr-3">{icon}</View>}
        <TextInput
          className="flex-1 text-base text-text"
          placeholderTextColor={Colors.text.tertiary}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
      </View>
      {error && <Text className="text-xs text-status-error mt-1">{error}</Text>}
    </View>
  );
}
