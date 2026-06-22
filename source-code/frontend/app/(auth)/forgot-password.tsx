import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Button } from "@/src/components/ui";
import { authService } from "@/src/services/auth.service";

import { Colors } from "@/src/constants/Colors";
type Step = "cpr" | "otp" | "reset";

export default function ForgotPasswordScreen() {
  const [step, setStep] = useState<Step>("cpr");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [cpr, setCpr] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const canSubmitCpr = useMemo(() => cpr.trim().length === 9, [cpr]);
  const canSubmitOtp = useMemo(() => otp.trim().length === 6, [otp]);
  const canSubmitReset = useMemo(() => {
    return (
      newPassword.trim().length >= 6 &&
      confirmPassword.trim().length >= 6 &&
      newPassword === confirmPassword
    );
  }, [newPassword, confirmPassword]);

  const handleRequestOtp = async () => {
    if (!canSubmitCpr) return;
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.forgotPassword({ cpr: cpr.trim() });
      Alert.alert("Code Sent", response.message || "OTP sent to your phone.");
      setStep("otp");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to request OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!canSubmitOtp) return;
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.verifyOtp({
        cpr: cpr.trim(),
        otp: otp.trim(),
      });
      setResetToken(response.resetToken);
      setStep("reset");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!canSubmitReset) return;
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.resetPassword({
        resetToken,
        newPassword: newPassword.trim(),
      });
      Alert.alert("Success", response.message || "Password reset successful", [
        {
          text: "Go to Login",
          onPress: () => router.replace("/login" as never),
        },
      ]);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to reset password.",
      );
    } finally {
      setIsLoading(false);
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
          <View className="items-center mt-12 mb-8">
            <View className="w-20 h-20 rounded-3xl bg-primary items-center justify-center mb-4">
              <Ionicons name="lock-closed" size={34} color={Colors.text.inverse} />
            </View>
            <Text className="text-3xl font-bold text-text">
              Forgot Password
            </Text>
            <Text className="text-base text-text-secondary mt-2 text-center">
              {step === "cpr"
                ? "Enter your CPR to receive a 6-digit SMS code"
                : step === "otp"
                  ? "Enter the code sent to your phone"
                  : "Set your new password"}
            </Text>
          </View>

          {error ? (
            <View className="flex-row items-center bg-red-50 border border-red-200 rounded-2xl px-4 py-3 mb-5">
              <Ionicons name="alert-circle-outline" size={18} color={Colors.status.error} />
              <Text className="text-sm text-red-700 flex-1 ml-2">{error}</Text>
              <TouchableOpacity onPress={() => setError(null)}>
                <Ionicons name="close" size={16} color={Colors.status.error} />
              </TouchableOpacity>
            </View>
          ) : null}

          {step === "cpr" && (
            <>
              <Text className="text-sm font-semibold text-text mb-2">
                CPR Number
              </Text>
              <View className="flex-row items-center bg-white rounded-2xl px-4 py-3.5 border border-border mb-6">
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
              </View>
              <Button
                title="Send OTP"
                size="lg"
                loading={isLoading}
                disabled={!canSubmitCpr || isLoading}
                onPress={handleRequestOtp}
              />
            </>
          )}

          {step === "otp" && (
            <>
              <Text className="text-sm font-semibold text-text mb-2">
                6-digit OTP
              </Text>
              <View className="flex-row items-center bg-white rounded-2xl px-4 py-3.5 border border-border mb-6">
                <Ionicons name="key-outline" size={20} color={Colors.text.tertiary} />
                <TextInput
                  value={otp}
                  onChangeText={(t) => setOtp(t.replace(/\D/g, "").slice(0, 6))}
                  placeholder="Enter OTP"
                  placeholderTextColor={Colors.text.tertiary}
                  keyboardType="number-pad"
                  maxLength={6}
                  className="flex-1 text-base text-text ml-3"
                />
              </View>
              <Button
                title="Verify OTP"
                size="lg"
                loading={isLoading}
                disabled={!canSubmitOtp || isLoading}
                onPress={handleVerifyOtp}
              />
              <TouchableOpacity
                onPress={handleRequestOtp}
                disabled={isLoading || !canSubmitCpr}
                className="mt-4 items-center"
              >
                <Text className="text-sm font-semibold text-primary">
                  Resend Code
                </Text>
              </TouchableOpacity>
            </>
          )}

          {step === "reset" && (
            <>
              <Text className="text-sm font-semibold text-text mb-2">
                New Password
              </Text>
              <View className="flex-row items-center bg-white rounded-2xl px-4 py-3.5 border border-border mb-4">
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={Colors.text.tertiary}
                />
                <TextInput
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Minimum 6 characters"
                  placeholderTextColor={Colors.text.tertiary}
                  secureTextEntry={!showPassword}
                  className="flex-1 text-base text-text ml-3"
                />
                <TouchableOpacity onPress={() => setShowPassword((v) => !v)}>
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={Colors.text.tertiary}
                  />
                </TouchableOpacity>
              </View>

              <Text className="text-sm font-semibold text-text mb-2">
                Confirm Password
              </Text>
              <View className="flex-row items-center bg-white rounded-2xl px-4 py-3.5 border border-border mb-6">
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={Colors.text.tertiary}
                />
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Re-enter new password"
                  placeholderTextColor={Colors.text.tertiary}
                  secureTextEntry={!showPassword}
                  className="flex-1 text-base text-text ml-3"
                />
              </View>

              <Button
                title="Reset Password"
                size="lg"
                loading={isLoading}
                disabled={!canSubmitReset || isLoading}
                onPress={handleResetPassword}
              />
            </>
          )}

          <View className="flex-row items-center justify-center mt-8">
            <Text className="text-sm text-text-secondary">
              Remembered your password?{" "}
            </Text>
            <TouchableOpacity onPress={() => router.replace("/login" as never)}>
              <Text className="text-sm font-bold text-primary">Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

