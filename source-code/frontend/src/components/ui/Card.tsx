import React from "react";
import { View, type ViewProps } from "react-native";

interface CardProps extends ViewProps {
  variant?: "default" | "elevated" | "outlined";
}

export function Card({
  children,
  className = "",
  variant = "default",
  ...props
}: CardProps & { children: React.ReactNode }) {
  const variants = {
    default: "bg-white rounded-2xl p-4",
    elevated: "bg-white rounded-2xl p-4",
    outlined: "bg-white rounded-2xl p-4 border border-border",
  };

  const shadowStyle =
    variant === "elevated"
      ? {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.07,
          shadowRadius: 8,
          elevation: 3,
        }
      : variant === "default"
        ? {
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.04,
            shadowRadius: 4,
            elevation: 1,
          }
        : undefined;

  return (
    <View
      className={`${variants[variant]} ${className}`}
      style={[shadowStyle, props.style]}
      {...props}
    >
      {children}
    </View>
  );
}
