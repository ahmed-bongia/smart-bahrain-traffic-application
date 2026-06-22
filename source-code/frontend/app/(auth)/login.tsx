import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuth } from "@/src/context/AuthContext";
import { Button } from "@/src/components/ui";

import { Colors } from "@/src/constants/Colors";
export default function LoginScreen() {
  const { login, isAuthenticating, authError, clearError } = useAuth();

  const [cpr, setCpr] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const canSubmit = cpr.trim().length === 9 && password.trim().length >= 6;

  const handleLogin = async () => {
    if (!canSubmit) return;
    clearError();
    try {
      await login({ cpr: cpr.trim(), password });
      // AuthProvider updates token - root layout redirects to /(tabs)
    } catch {
      // Error is already stored in authError
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="flex-grow px-6"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo / Hero */}
          <View className="items-center mt-14 mb-10">
            <View
              className="w-20 h-20 rounded-3xl bg-primary items-center justify-center mb-5"
              style={{
                shadowColor: Colors.primary.DEFAULT,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.25,
                shadowRadius: 16,
                elevation: 10,
              }}
            >
              <Ionicons name="flag" size={36} color={Colors.text.inverse} />
            </View>
            <Text className="text-3xl font-bold text-text">Smart Bahrain</Text>
            <Text className="text-base text-text-secondary mt-2 text-center">
              Sign in with your Bahrain CPR number
            </Text>
          </View>

          {/* Error Banner */}
          {authError ? (
            <View className="flex-row items-center bg-red-50 border border-red-200 rounded-2xl px-4 py-3 mb-5">
              <Ionicons name="alert-circle-outline" size={18} color={Colors.status.error} />
              <Text className="text-sm text-red-700 flex-1 ml-2">
                {authError}
              </Text>
              <TouchableOpacity onPress={clearError}>
                <Ionicons name="close" size={16} color={Colors.status.error} />
              </TouchableOpacity>
            </View>
          ) : null}

          {/* CPR Field */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-text mb-2">
              CPR Number
            </Text>
            <View className="flex-row items-center bg-white rounded-2xl px-4 py-3.5 border border-border">
              <Ionicons name="card-outline" size={20} color={Colors.text.tertiary} />
              <TextInput
                value={cpr}
                onChangeText={(t) => setCpr(t.replace(/\D/g, "").slice(0, 9))}
                placeholder="9-digit CPR number"
                placeholderTextColor={Colors.text.tertiary}
                keyboardType="number-pad"
                maxLength={9}
                className="flex-1 text-base text-text ml-3"
              />
              {cpr.length === 9 && (
                <Ionicons name="checkmark-circle" size={20} color={Colors.status.success} />
              )}
            </View>
          </View>

          {/* Password Field */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-text mb-2">
              Password
            </Text>
            <View className="flex-row items-center bg-white rounded-2xl px-4 py-3.5 border border-border">
              <Ionicons name="lock-closed-outline" size={20} color={Colors.text.tertiary} />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor={Colors.text.tertiary}
                secureTextEntry={!showPassword}
                className="flex-1 text-base text-text ml-3"
              />
              <TouchableOpacity
                onPress={() => setShowPassword((v) => !v)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={Colors.text.tertiary}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => router.push("/forgot-password" as never)}
              className="mt-3 self-end"
            >
              <Text className="text-sm font-semibold text-primary">
                Forgot password?
              </Text>
            </TouchableOpacity>
          </View>

          {/* Login Button */}
          <Button
            title="Sign In"
            size="lg"
            loading={isAuthenticating}
            disabled={!canSubmit || isAuthenticating}
            onPress={handleLogin}
            className="shadow-button"
          />

          {/* Register Link */}
          <View className="flex-row items-center justify-center mt-6">
            <Text className="text-sm text-text-secondary">
              Don&apos;t have an account?{" "}
            </Text>
            <TouchableOpacity onPress={() => router.push("/register" as never)}>
              <Text className="text-sm font-bold text-primary">Register</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

