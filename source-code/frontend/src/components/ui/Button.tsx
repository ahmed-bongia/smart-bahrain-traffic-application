import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  type TouchableOpacityProps,
} from "react-native";

import { Colors } from "@/src/constants/Colors";
interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
}

export function Button({
  title,
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const baseStyle = "flex-row items-center justify-center rounded-2xl";

  const variants = {
    primary: "bg-primary",
    secondary: "bg-primary-50",
    outline: "bg-transparent border border-primary",
    ghost: "bg-transparent",
  };

  const sizes = {
    sm: "px-4 py-2",
    md: "px-6 py-3.5",
    lg: "px-8 py-4",
  };

  const textVariants = {
    primary: "text-white font-semibold",
    secondary: "text-primary font-semibold",
    outline: "text-primary font-semibold",
    ghost: "text-primary font-medium",
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  return (
    <TouchableOpacity
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${
        disabled || loading ? "opacity-50" : ""
      } ${className}`}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "primary" ? Colors.text.inverse : Colors.primary.DEFAULT}
          size="small"
        />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text
            className={`${textVariants[variant]} ${textSizes[size]} ${
              icon ? "ml-2" : ""
            }`}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

