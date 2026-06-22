import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/src/context/AuthContext";
import { emergencyService } from "@/src/services/emergency.service";
import { Config } from "@/src/constants/Config";
import type { EmergencyContact } from "@/src/types";
import { NATIONAL_EMERGENCY_NUMBERS } from "@/src/constants/emergencyNumbers";
import QRCode from "react-native-qrcode-svg";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { CountryCodeDropdown, Dropdown } from "@/src/components/ui/Dropdown";
import { cleanDisplayText } from "@/src/utils/cleanDisplayText";

import { Colors } from "@/src/constants/Colors";
function memberSince(createdAt?: string) {
  if (!createdAt) return "-";
  return new Date(createdAt).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });
}

export default function ProfileScreen() {
  const { user, logout, token, refreshUser } = useAuth();

  // Refresh user data whenever this screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      refreshUser().catch(() => {
        // Silently handle refresh errors
      });
    }, [refreshUser]),
  );

  // COMMENTED OUT: Emergency contacts state and functions
  /* 
  const [emergencyContacts, setEmergencyContacts] = useState<
    EmergencyContact[]
  >([]);
  const [emergencyToken, setEmergencyToken] = useState("");
  const [isEmergencyLoading, setIsEmergencyLoading] = useState(true);
  const [isSavingEmergency, setIsSavingEmergency] = useState(false);
  const [emergencyError, setEmergencyError] = useState<string | null>(null);
  const qrRef = useRef<any>(null);
  */

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  const infoRows: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    value: string;
  }[] = [
    { icon: "card-outline", label: "CPR Number", value: cleanDisplayText(user?.cpr) },
    { icon: "call-outline", label: "Phone", value: cleanDisplayText(user?.phone) },
    {
      icon: "calendar-outline",
      label: "Member Since",
      value: memberSince(user?.createdAt),
    },
  ];

  // COMMENTED OUT: useEffect for emergency contacts
  /*
  useEffect(() => {
    if (!token) return;
    (async () => {
      setIsEmergencyLoading(true);
      setEmergencyError(null);
      try {
        const res = await emergencyService.getMyEmergencyProfile(token);
        setEmergencyContacts(res.emergencyContacts ?? []);
        setEmergencyToken(res.emergencyPublicToken ?? "");
      } catch (err: unknown) {
        setEmergencyError(
          err instanceof Error
            ? err.message
            : "Failed to load emergency contacts",
        );
      } finally {
        setIsEmergencyLoading(false);
      }
    })();
  }, [token]);
  */

  // COMMENTED OUT: Emergency contact helper functions
  /*
  const updateContact = (
    index: number,
    field: keyof EmergencyContact,
    value: string,
  ) => {
    setEmergencyContacts((prev) =>
      prev.map((contact, i) =>
        i === index ? { ...contact, [field]: value } : contact,
      ),
    );
  };

  const addContact = () => {
    setEmergencyContacts((prev) => [
      ...prev,
      { name: "", relationship: "", phone: "" },
    ]);
  };

  const relationshipOptions = [
    { label: "Mother", value: "mother" },
    { label: "Father", value: "father" },
    { label: "Brother", value: "brother" },
    { label: "Sister", value: "sister" },
    { label: "Son", value: "son" },
    { label: "Daughter", value: "daughter" },
    { label: "Spouse", value: "spouse" },
    { label: "Friend", value: "friend" },
    { label: "Guardian", value: "guardian" },
    { label: "Other", value: "other" },
  ];

  const gccCountryCodes = [
    { label: "Bahrain", code: "+973", flag: "BH" },
    { label: "Saudi Arabia", code: "+966", flag: "SA" },
    { label: "United Arab Emirates", code: "+971", flag: "AE" },
    { label: "Kuwait", code: "+965", flag: "KW" },
    { label: "Qatar", code: "+974", flag: "QA" },
    { label: "Oman", code: "+968", flag: "OM" },
  ];

  const phoneLengthsByCode: Record<string, number> = {
    "+973": 8,
    "+966": 9,
    "+971": 9,
    "+965": 8,
    "+974": 8,
    "+968": 8,
  };

  const getPhoneParts = (phone: string) => {
    const fallback = gccCountryCodes[0];
    if (!phone) return { code: fallback.code, number: "" };

    const match = gccCountryCodes.find((entry) => phone.startsWith(entry.code));
    if (!match) return { code: fallback.code, number: phone };

    return { code: match.code, number: phone.slice(match.code.length) };
  };

  const getMaxDigits = (code: string) => phoneLengthsByCode[code] ?? 8;

  const isPhoneValid = (phone: string) => {
    const { code, number } = getPhoneParts(phone);
    const expected = getMaxDigits(code);
    const digitsOnly = number.replace(/\D/g, "");
    return digitsOnly.length === expected;
  };

  const removeContact = (index: number) => {
    setEmergencyContacts((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveEmergency = async () => {
    if (!token) return;

    const cleaned = emergencyContacts
      .map((contact) => ({
        name: contact.name.trim(),
        relationship: contact.relationship?.trim() ?? "",
        phone: contact.phone.trim(),
      }))
      .filter((contact) => contact.name && contact.phone);

    if (cleaned.length === 0) {
      Alert.alert("Missing info", "Please add at least one valid contact.");
      return;
    }

    const invalidPhone = cleaned.find((contact) => {
      const { code, number } = getPhoneParts(contact.phone);
      const expected = getMaxDigits(code);
      const digitsOnly = number.replace(/\D/g, "");
      return digitsOnly.length !== expected;
    });

    if (invalidPhone) {
      Alert.alert(
        "Invalid phone",
        "Please enter a valid phone number length for the selected country code.",
      );
      return;
    }

    setIsSavingEmergency(true);
    setEmergencyError(null);
    try {
      const res = await emergencyService.updateMyEmergencyProfile(
        token,
        cleaned,
      );
      setEmergencyContacts(res.emergencyContacts ?? []);
      setEmergencyToken(res.emergencyPublicToken ?? "");
      Alert.alert("Saved", "Emergency contacts updated successfully.");
    } catch (err: unknown) {
      setEmergencyError(
        err instanceof Error
          ? err.message
          : "Failed to save emergency contacts",
      );
    } finally {
      setIsSavingEmergency(false);
    }
  };

  const publicUrl = emergencyToken
    ? `${Config.PUBLIC_EMERGENCY_BASE_URL}/${emergencyToken}`
    : "";

  const handleExportQr = async () => {
    if (!qrRef.current) return;
    if (!publicUrl) return;

    const canShare = await Sharing.isAvailableAsync();
    if (!canShare) {
      Alert.alert(
        "Sharing unavailable",
        "Sharing is not available on this device.",
      );
      return;
    }

    if (!FileSystem.cacheDirectory) {
      Alert.alert("Storage error", "Unable to access cache directory.");
      return;
    }

    qrRef.current.toDataURL(async (data: string) => {
      try {
        const fileUri = `${FileSystem.cacheDirectory}emergency-qr.png`;
        await FileSystem.writeAsStringAsync(fileUri, data, {
          encoding: FileSystem.EncodingType.Base64,
        });
        await Sharing.shareAsync(fileUri, {
          mimeType: "image/png",
          dialogTitle: "Emergency QR Code",
        });
      } catch {
        Alert.alert("Export failed", "Could not export QR code.");
      }
    });
  };
  */

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/*  Header  */}
        <View className="px-5 pt-4 pb-2">
          <Text className="text-2xl font-bold text-text">Profile</Text>
        </View>

        {/*Avatar + Name*/}
        <View className="items-center mt-6 mb-5 px-5">
          <View
            className="w-24 h-24 rounded-full bg-primary-100 items-center justify-center"
            style={{
              shadowColor: Colors.primary.DEFAULT,
              shadowOpacity: 0.15,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 4 },
              elevation: 6,
            }}
          >
            <Text style={{ fontSize: 36, fontWeight: "800", color: Colors.primary.DEFAULT }}>
              {user?.name?.charAt(0)?.toUpperCase() ?? "?"}
            </Text>
          </View>
          <Text className="text-xl font-bold text-text mt-4">
            {cleanDisplayText(user?.name)}
          </Text>
          <View className="flex-row items-center mt-1.5 bg-primary-50 px-3 py-1 rounded-full">
            <Ionicons name="person-circle-outline" size={13} color={Colors.primary.DEFAULT} />
            <Text className="text-xs font-semibold text-primary ml-1">
              Citizen Reporter
            </Text>
          </View>
        </View>

        {/*  Balance Stats  */}
        <View className="mx-5 bg-white rounded-2xl shadow-sm overflow-hidden">
          <View style={{ flexDirection: "row" }}>
            {[
              {
                label: "Balance",
                value: `${(user?.balance ?? 0).toFixed(3)} BHD`,
                icon: "wallet-outline" as const,
                color: Colors.primary.DEFAULT,
              },
              {
                label: "Total Earned",
                value: `${(user?.totalEarned ?? 0).toFixed(3)} BHD`,
                icon: "cash-outline" as const,
                color: Colors.accent.DEFAULT,
              },
            ].map((stat, i) => (
              <View
                key={stat.label}
                style={{
                  flex: 1,
                  alignItems: "center",
                  paddingVertical: 18,
                  borderRightWidth: i === 0 ? 1 : 0,
                  borderRightColor: Colors.border.light,
                }}
              >
                <Ionicons name={stat.icon} size={20} color={stat.color} />
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "800",
                    color: Colors.text.DEFAULT,
                    marginTop: 6,
                  }}
                >
                  {stat.value}
                </Text>
                <Text style={{ fontSize: 11, color: Colors.text.tertiary, marginTop: 2 }}>
                  {stat.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/*  Account Info  */}
        <View className="mx-5 mt-5">
          <Text className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-3 px-1">
            Account Information
          </Text>
          <View className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {infoRows.map((row, i) => (
              <View
                key={row.label}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  borderBottomWidth: i < infoRows.length - 1 ? 1 : 0,
                  borderBottomColor: Colors.border.light,
                }}
              >
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    backgroundColor: Colors.primary["50"],
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 12,
                  }}
                >
                  <Ionicons name={row.icon} size={18} color={Colors.primary.DEFAULT} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{ fontSize: 11, color: Colors.text.tertiary, marginBottom: 2 }}
                  >
                    {row.label}
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: Colors.text.DEFAULT,
                    }}
                  >
                    {row.value}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* COMMENTED OUT: Emergency Contacts + QR Section
        <View className="mx-5 mt-6">
          <Text className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-3 px-1">
            Emergency Contacts
          </Text>

          {emergencyError ? (
            <View className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 mb-4">
              <Text className="text-sm text-red-700">{emergencyError}</Text>
            </View>
          ) : null}

          <View className="bg-white rounded-2xl shadow-sm overflow-hidden p-4">
            {isEmergencyLoading ? (
              <View className="items-center py-6">
                <ActivityIndicator size="small" color={Colors.primary.DEFAULT} />
                <Text className="text-xs text-text-secondary mt-2">
                  Loading emergency contacts...
                </Text>
              </View>
            ) : (
              <>
                {emergencyContacts.length === 0 ? (
                  <Text className="text-sm text-text-secondary mb-3">
                    No contacts added yet.
                  </Text>
                ) : null}

                {emergencyContacts.map((contact, index) => (
                  <View key={`contact-${index}`} className="mb-4">
                    <View className="flex-row items-center justify-between mb-2">
                      <Text className="text-sm font-semibold text-text">
                        Contact {index + 1}
                      </Text>
                      <TouchableOpacity
                        onPress={() => removeContact(index)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={18}
                          color={Colors.status.error}
                        />
                      </TouchableOpacity>
                    </View>

                    <TextInput
                      value={contact.name}
                      onChangeText={(value) =>
                        updateContact(index, "name", value)
                      }
                      placeholder="Full name"
                      placeholderTextColor={Colors.text.tertiary}
                      className="border border-border rounded-xl px-3 py-2 text-sm text-text mb-2"
                    />
                    <View className="mb-2">
                      <Dropdown
                        placeholder="Relationship"
                        value={contact.relationship ?? ""}
                        options={relationshipOptions}
                        onChange={(value) =>
                          updateContact(index, "relationship", value)
                        }
                        modalTitle="Select Relationship"
                      />
                    </View>
                    {(() => {
                      const { code, number } = getPhoneParts(contact.phone);
                      const maxDigits = getMaxDigits(code);
                      const invalidPhone =
                        number.length > 0 && !isPhoneValid(contact.phone);
                      return (
                        <View className="flex-row items-center">
                          <View className="mr-2" style={{ minWidth: 110 }}>
                            <CountryCodeDropdown
                              value={code}
                              options={gccCountryCodes}
                              onChange={(nextCode) =>
                                updateContact(
                                  index,
                                  "phone",
                                  `${nextCode}${number}`,
                                )
                              }
                            />
                          </View>
                          <TextInput
                            value={number}
                            onChangeText={(value) =>
                              updateContact(
                                index,
                                "phone",
                                `${code}${value.replace(/\D/g, "").slice(0, maxDigits)}`,
                              )
                            }
                            placeholder="Phone number"
                            placeholderTextColor={Colors.text.tertiary}
                            keyboardType="phone-pad"
                            maxLength={maxDigits}
                            className={`flex-1 border rounded-xl px-3 py-2 text-sm text-text ${
                              invalidPhone ? "border-red-400" : "border-border"
                            }`}
                          />
                        </View>
                      );
                    })()}
                  </View>
                ))}

                <TouchableOpacity
                  onPress={addContact}
                  className="flex-row items-center justify-center bg-primary-50 rounded-xl py-2.5"
                >
                  <Ionicons
                    name="add-circle-outline"
                    size={18}
                    color={Colors.primary.DEFAULT}
                  />
                  <Text className="text-sm font-semibold text-primary ml-2">
                    Add Contact
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSaveEmergency}
                  disabled={isSavingEmergency}
                  className="flex-row items-center justify-center bg-primary rounded-xl py-3 mt-3"
                >
                  <Text className="text-sm font-semibold text-white">
                    {isSavingEmergency ? "Saving..." : "Save Contacts"}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          <View className="bg-white rounded-2xl shadow-sm overflow-hidden mt-4 p-4 items-center">
            {publicUrl ? (
              <>
                <QRCode
                  value={publicUrl}
                  size={180}
                  getRef={(c) => (qrRef.current = c)}
                />
                <Text className="text-xs text-text-secondary mt-3 text-center">
                  Scan this QR code to view emergency contacts.
                </Text>
                <Text
                  className="text-[10px] text-text-tertiary mt-1"
                  numberOfLines={1}
                >
                  {publicUrl}
                </Text>
                <TouchableOpacity
                  onPress={handleExportQr}
                  className="mt-3 bg-primary-50 px-4 py-2 rounded-full"
                >
                  <Text className="text-xs font-semibold text-primary">
                    Export QR Code
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <Text className="text-sm text-text-secondary">
                Save contacts to generate your emergency QR code.
              </Text>
            )}
          </View>
        */}

          {/* National Emergency Numbers */}
          <View className="mt-6">
            <Text className="text-lg font-bold text-text-primary mb-3 px-5">
              NATIONAL EMERGENCY NUMBERS
            </Text>
            <View className="mx-5 space-y-3">
              {NATIONAL_EMERGENCY_NUMBERS.map((emergency) => (
                <TouchableOpacity
                  key={emergency.id}
                  activeOpacity={0.7}
                  onPress={() => {
                    Alert.alert(
                      emergency.name,
                      `Call ${emergency.number}?`,
                      [
                        { text: "Cancel", style: "cancel" },
                        { text: "Call", style: "default" },
                      ],
                    );
                  }}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: Colors.surface.DEFAULT,
                    paddingVertical: 14,
                    paddingHorizontal: 16,
                    borderRadius: 12,
                    shadowColor: "#000",
                    shadowOpacity: 0.05,
                    shadowRadius: 4,
                    shadowOffset: { width: 0, height: 2 },
                    elevation: 2,
                  }}
                >
                  <View
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 10,
                      backgroundColor: "rgba(220, 38, 38, 0.1)",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 12,
                    }}
                  >
                    <Ionicons
                      name={emergency.icon as any}
                      size={24}
                      color={Colors.status.error}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "600",
                        color: Colors.text.DEFAULT,
                      }}
                    >
                      {emergency.name}
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "700",
                      color: Colors.status.error,
                    }}
                  >
                    {emergency.number}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

        {/*  Log Out */}
        <View className="mx-5 mt-6">
          <TouchableOpacity
            onPress={handleLogout}
            activeOpacity={0.8}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: Colors.surface.DEFAULT,
              paddingVertical: 15,
              borderRadius: 16,
              shadowColor: "#000",
              shadowOpacity: 0.05,
              shadowRadius: 6,
              shadowOffset: { width: 0, height: 2 },
              elevation: 2,
            }}
          >
            <Ionicons name="log-out-outline" size={20} color={Colors.status.error} />
            <Text
              style={{
                fontSize: 15,
                fontWeight: "700",
                color: Colors.status.error,
                marginLeft: 8,
              }}
            >
              Log Out
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer  */}
        <View className="items-center mt-6">
          <Text className="text-xs text-text-tertiary">Smart Bahrain v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

