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
import { CountryCodeDropdown } from "@/src/components/ui/Dropdown";

import { Colors } from "@/src/constants/Colors";
export default function RegisterScreen() {
  const { register, isAuthenticating, authError, clearError } = useAuth();

  const [cpr, setCpr] = useState("");
  const [name, setName] = useState("");
  const [countryCode, setCountryCode] = useState("+973");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const countryCodeOptions = [
    { label: "Bahrain", code: "+973", flag: "🇧🇭" },
    { label: "Saudi Arabia", code: "+966", flag: "🇸🇦" },
    { label: "United Arab Emirates", code: "+971", flag: "🇦🇪" },
    { label: "Kuwait", code: "+965", flag: "🇰🇼" },
    { label: "Qatar", code: "+974", flag: "🇶🇦" },
    { label: "Oman", code: "+968", flag: "🇴🇲" },
  ];

  const minPhoneDigits = 5;
  const passwordsMatch = password === confirmPassword;
  const canSubmit =
    cpr.trim().length === 9 &&
    name.trim().length >= 2 &&
    phone.trim().length >= minPhoneDigits &&
    password.length >= 6 &&
    passwordsMatch;

  const handleRegister = async () => {
    if (!canSubmit) return;
    clearError();
    const fullPhone = `${countryCode}${phone}`;
    try {
      await register({
        cpr: cpr.trim(),
        name: name.trim(),
        phone: fullPhone.trim(),
        password,
      });
      // AuthProvider updates token - root layout redirects to /(tabs)
    } catch {
      // Error stored in authError
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
          {/* Header */}
          <View className="flex-row items-center mt-8 mb-8">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 rounded-xl bg-white items-center justify-center shadow-sm mr-3"
            >
              <Ionicons name="chevron-back" size={22} color={Colors.text.DEFAULT} />
            </TouchableOpacity>
            <View>
              <Text className="text-2xl font-bold text-text">
                Create Account
              </Text>
              <Text className="text-sm text-text-secondary mt-0.5">
                Join and start reporting issues
              </Text>
            </View>
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
          <FieldGroup label="CPR Number" icon="card-outline">
            <TextInput
              value={cpr}
              onChangeText={(t) => setCpr(t.replace(/\D/g, "").slice(0, 9))}
              placeholder="9-digit Bahrain CPR"
              placeholderTextColor={Colors.text.tertiary}
              keyboardType="number-pad"
              maxLength={9}
              className="flex-1 text-base text-text ml-3"
            />
            {cpr.length === 9 && (
              <Ionicons name="checkmark-circle" size={20} color={Colors.status.success} />
            )}
          </FieldGroup>

          {/* Name Field */}
          <FieldGroup label="Full Name" icon="person-outline">
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Your full name"
              placeholderTextColor={Colors.text.tertiary}
              autoCapitalize="words"
              className="flex-1 text-base text-text ml-3"
            />
          </FieldGroup>

          {/* Phone Field */}
          <FieldGroup
            label="Phone Number"
            hint="Country code + phone number"
            icon="call-outline"
          >
            <View className="flex-row items-center gap-2 w-full">
              <View style={{ minWidth: 110 }}>
                <CountryCodeDropdown
                  value={countryCode}
                  options={countryCodeOptions}
                  onChange={setCountryCode}
                />
              </View>
              <TextInput
                value={phone}
                onChangeText={(t) => setPhone(t.replace(/\D/g, ""))}
                placeholder="Phone"
                placeholderTextColor={Colors.text.tertiary}
                keyboardType="number-pad"
                className="flex-1 text-base text-text"
              />
              {phone.length >= minPhoneDigits && (
                <Ionicons name="checkmark-circle" size={20} color={Colors.status.success} />
              )}
            </View>
          </FieldGroup>

          {/* Password Field */}
          <FieldGroup label="Password" icon="lock-closed-outline">
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Min 6 characters"
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
          </FieldGroup>

          {/* Confirm Password */}
          <FieldGroup
            label="Confirm Password"
            icon="lock-closed-outline"
            error={
              confirmPassword.length > 0 && !passwordsMatch
                ? "Passwords do not match"
                : undefined
            }
          >
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Repeat your password"
              placeholderTextColor={Colors.text.tertiary}
              secureTextEntry={!showPassword}
              className="flex-1 text-base text-text ml-3"
            />
            {confirmPassword.length > 0 && (
              <Ionicons
                name={passwordsMatch ? "checkmark-circle" : "close-circle"}
                size={20}
                color={passwordsMatch ? Colors.status.success : Colors.status.error}
              />
            )}
          </FieldGroup>

          {/* Register Button */}
          <View className="mt-2 mb-6">
            <Button
              title="Create Account"
              size="lg"
              loading={isAuthenticating}
              disabled={!canSubmit || isAuthenticating}
              onPress={handleRegister}
              className="shadow-button"
            />
          </View>

          {/* Login Link */}
          <View className="flex-row items-center justify-center mb-8">
            <Text className="text-sm text-text-secondary">
              Already have an account?{" "}
            </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text className="text-sm font-bold text-primary">Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Reusable field wrapper
function FieldGroup({
  label,
  icon,
  hint,
  error,
  children,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <View className="mb-4">
      <Text className="text-sm font-semibold text-text mb-2">{label}</Text>
      {hint && (
        <Text className="text-xs text-text-tertiary mb-1.5">{hint}</Text>
      )}
      <View
        className={`flex-row items-center bg-white rounded-2xl px-4 py-3.5 border ${
          error ? "border-red-400" : "border-border"
        }`}
      >
        <Ionicons name={icon} size={20} color={Colors.text.tertiary} />
        {children}
      </View>
      {error && <Text className="text-xs text-red-500 mt-1 ml-1">{error}</Text>}
    </View>
  );
}

