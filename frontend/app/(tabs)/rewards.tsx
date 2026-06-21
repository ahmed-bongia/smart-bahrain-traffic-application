import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { Card, SectionHeader } from "@/src/components/ui";
import { useAuth } from "@/src/context/AuthContext";
import { rewardService } from "@/src/services/reward.service";
import type {
  EarningEntry,
  WithdrawalRequest,
} from "@/src/types";

import { Colors } from "@/src/constants/Colors";
// Fine table (mirrors backend exactly)
const FINE_TABLE: Record<
  string,
  { fine: number; label: string; icon: string; color: string }
> = {
  drunk_driving: {
    fine: 500,
    label: "Drunk Driving",
    icon: "wine-outline",
    color: "#7c3aed",
  },
  reckless_driving: {
    fine: 200,
    label: "Reckless Driving",
    icon: "car-sport-outline",
    color: Colors.status.error,
  },
  accident: {
    fine: 100,
    label: "Accident",
    icon: "warning-outline",
    color: "#ea580c",
  },
  speeding: {
    fine: 80,
    label: "Speeding",
    icon: "speedometer-outline",
    color: Colors.accent.dark,
  },
  traffic_signal: {
    fine: 60,
    label: "Traffic Signal",
    icon: "radio-button-on-outline",
    color: "#0284c7",
  },
  road_hazard: {
    fine: 40,
    label: "Road Hazard",
    icon: "alert-circle-outline",
    color: Colors.status.success,
  },
  illegal_parking: {
    fine: 20,
    label: "Illegal Parking",
    icon: "ban-outline",
    color: Colors.text.tertiary,
  },
  other: {
    fine: 20,
    label: "Other",
    icon: "ellipsis-horizontal-circle-outline",
    color: Colors.text.tertiary,
  },
};
const REWARD_PERCENT = 5;

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatBHD(amount: number) {
  return amount.toFixed(3);
}

const WITHDRAWAL_STATUS_CONFIG = {
  pending: { label: "Pending", color: Colors.accent.dark, bg: Colors.status.warningBg },
  approved: { label: "Verified", color: Colors.status.success, bg: Colors.status.successBg },
  rejected: { label: "Rejected", color: Colors.status.error, bg: Colors.status.errorBg },
};

/* */

export default function RewardsScreen() {
  const { token } = useAuth();
  const [balance, setBalance] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [earnings, setEarnings] = useState<EarningEntry[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [minimumWithdrawal, setMinimum] = useState(100);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [withdrawModalVisible, setWithdrawModalVisible] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"earnings" | "withdrawals">("earnings");

  const fetchData = useCallback(async () => {
    if (!token) return;
    try {
      const rewardsData = await rewardService.getMyRewards(token);
      setBalance(rewardsData.balance);
      setTotalEarned(rewardsData.totalEarned);
      setEarnings(rewardsData.earnings.slice().reverse()); // newest first
      setWithdrawals(rewardsData.withdrawalRequests.slice().reverse());
      setMinimum(rewardsData.minimumWithdrawal);
    } catch (err) {
      console.error("Rewards fetch error:", err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert("Invalid amount", "Please enter a valid amount.");
      return;
    }
    if (amount < minimumWithdrawal) {
      Alert.alert(
        "Minimum not met",
        `Minimum withdrawal is ${minimumWithdrawal} BHD.`,
      );
      return;
    }
    if (amount > balance) {
      Alert.alert(
        "Insufficient balance",
        `Your available balance is ${formatBHD(balance)} BHD.`,
      );
      return;
    }
    setWithdrawLoading(true);
    try {
      await rewardService.requestWithdrawal(token!, amount);
      setWithdrawModalVisible(false);
      setWithdrawAmount("");
      fetchData();
      Alert.alert(
        "Request Submitted",
        `Your withdrawal of ${formatBHD(amount)} BHD has been submitted and will be processed shortly.`,
      );
    } catch (err: unknown) {
      Alert.alert(
        "Error",
        err instanceof Error ? err.message : "Withdrawal failed",
      );
    } finally {
      setWithdrawLoading(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color={Colors.primary.DEFAULT} />
      </SafeAreaView>
    );
  }

  const hasPendingWithdrawal = withdrawals.some((w) => w.status === "pending");

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary.DEFAULT}
          />
        }
      >
        {/* Header */}
        <View className="px-5 pt-4 pb-2">
          <Text className="text-2xl font-bold text-text">Rewards</Text>
          <Text className="text-sm text-text-secondary mt-1">
            Earn BHD by reporting traffic violations
          </Text>
        </View>

        {/* Balance Hero Card */}
        <View className="px-5 mt-3">
          <View
            style={{
              backgroundColor: Colors.primary.DEFAULT,
              borderRadius: 24,
              padding: 20,
              overflow: "hidden",
              shadowColor: Colors.primary.DEFAULT,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.3,
              shadowRadius: 16,
              elevation: 10,
            }}
          >
            {/* Decorative circles */}
            <View
              style={{
                position: "absolute",
                top: -32,
                right: -32,
                width: 120,
                height: 120,
                borderRadius: 60,
                backgroundColor: "rgba(255,255,255,0.07)",
              }}
            />
            <View
              style={{
                position: "absolute",
                bottom: -40,
                left: -20,
                width: 110,
                height: 110,
                borderRadius: 55,
                backgroundColor: "rgba(255,255,255,0.05)",
              }}
            />

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <View>
                <Text
                  style={{
                    color: "rgba(255,255,255,0.65)",
                    fontSize: 13,
                    fontWeight: "500",
                  }}
                >
                  Available Balance
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "baseline",
                    marginTop: 4,
                  }}
                >
                  <Text
                    style={{ color: Colors.text.inverse, fontSize: 38, fontWeight: "800" }}
                  >
                    {formatBHD(balance)}
                  </Text>
                  <Text
                    style={{
                      color: "rgba(255,255,255,0.7)",
                      fontSize: 16,
                      fontWeight: "600",
                      marginLeft: 6,
                    }}
                  >
                    BHD
                  </Text>
                </View>
              </View>
              <View
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 16,
                  backgroundColor: "rgba(255,255,255,0.12)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="wallet-outline" size={26} color={Colors.accent.DEFAULT} />
              </View>
            </View>

            {/* Total earned */}
            <View
              style={{
                marginTop: 16,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View>
                <Text style={{ color: "rgba(255,255,255,0.55)", fontSize: 12 }}>
                  Total Earned
                </Text>
                <Text
                  style={{
                    color: "rgba(255,255,255,0.85)",
                    fontSize: 15,
                    fontWeight: "700",
                  }}
                >
                  {formatBHD(totalEarned)} BHD
                </Text>
              </View>
              <View>
                <Text
                  style={{
                    color: "rgba(255,255,255,0.55)",
                    fontSize: 12,
                    textAlign: "right",
                  }}
                >
                  Reports Verified
                </Text>
                <Text
                  style={{
                    color: "rgba(255,255,255,0.85)",
                    fontSize: 15,
                    fontWeight: "700",
                    textAlign: "right",
                  }}
                >
                  {earnings.length}
                </Text>
              </View>
            </View>

            {/* Withdraw button */}
            <TouchableOpacity
              onPress={() => setWithdrawModalVisible(true)}
              disabled={balance < minimumWithdrawal || hasPendingWithdrawal}
              style={{
                marginTop: 18,
                backgroundColor:
                  balance >= minimumWithdrawal && !hasPendingWithdrawal
                    ? Colors.accent.DEFAULT
                    : "rgba(255,255,255,0.12)",
                borderRadius: 14,
                paddingVertical: 13,
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <Ionicons
                name="arrow-down-circle-outline"
                size={20}
                color={
                  balance >= minimumWithdrawal && !hasPendingWithdrawal
                    ? Colors.primary.DEFAULT
                    : "rgba(255,255,255,0.4)"
                }
              />
              <Text
                style={{
                  fontWeight: "700",
                  fontSize: 15,
                  color:
                    balance >= minimumWithdrawal && !hasPendingWithdrawal
                      ? Colors.primary.DEFAULT
                      : "rgba(255,255,255,0.4)",
                }}
              >
                {hasPendingWithdrawal
                  ? "Withdrawal Pending..."
                  : balance < minimumWithdrawal
                    ? `Withdraw (min ${minimumWithdrawal} BHD)`
                    : "Withdraw Funds"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* How It Works */}
        <View className="px-5 mt-5">
          <SectionHeader title="How You Earn" />
          <View className="bg-white rounded-2xl overflow-hidden shadow-sm">
            {Object.entries(FINE_TABLE).map(([key, info], idx, arr) => {
              const reward = (info.fine * REWARD_PERCENT) / 100;
              return (
                <View
                  key={key}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderBottomWidth: idx < arr.length - 1 ? 1 : 0,
                    borderBottomColor: Colors.border.light,
                  }}
                >
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      backgroundColor: `${info.color}18`,
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 12,
                    }}
                  >
                    <Ionicons
                      name={info.icon as any}
                      size={18}
                      color={info.color}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "600",
                        color: Colors.text.DEFAULT,
                      }}
                    >
                      {info.label}
                    </Text>
                    <Text
                      style={{ fontSize: 11, color: Colors.text.tertiary, marginTop: 1 }}
                    >
                      {info.fine} BHD fine, {REWARD_PERCENT}% to you
                    </Text>
                  </View>
                  <View
                    style={{
                      backgroundColor: Colors.primary["50"],
                      borderRadius: 8,
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "800",
                        color: Colors.primary.DEFAULT,
                      }}
                    >
                      +{formatBHD(reward)} BHD
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Tabs */}
        <View className="px-5 mt-5">
          <View
            style={{
              flexDirection: "row",
              backgroundColor: Colors.border.light,
              borderRadius: 14,
              padding: 4,
            }}
          >
            {(["earnings", "withdrawals"] as const).map(
              (tab) => (
                <TouchableOpacity
                  key={tab}
                  onPress={() => setActiveTab(tab)}
                  style={{
                    flex: 1,
                    paddingVertical: 9,
                    borderRadius: 10,
                    alignItems: "center",
                    backgroundColor: activeTab === tab ? Colors.surface.DEFAULT : "transparent",
                    shadowColor: activeTab === tab ? "#000" : "transparent",
                    shadowOpacity: 0.06,
                    shadowRadius: 4,
                    elevation: activeTab === tab ? 2 : 0,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "700",
                      color: activeTab === tab ? Colors.primary.DEFAULT : Colors.text.tertiary,
                      textTransform: "capitalize",
                    }}
                  >
                    {tab === "withdrawals" ? "Withdrawals" : "Earnings"}
                  </Text>
                </TouchableOpacity>
              ),
            )}
          </View>
        </View>

        {/* Earnings Tab */}
        {activeTab === "earnings" && (
          <View className="px-5 mt-4">
            {earnings.length === 0 ? (
              <Card variant="elevated" className="items-center py-10">
                <View className="w-14 h-14 rounded-full bg-primary-50 items-center justify-center mb-3">
                  <Ionicons name="cash-outline" size={28} color={Colors.primary.DEFAULT} />
                </View>
                <Text className="text-base font-semibold text-text text-center">
                  No earnings yet
                </Text>
                <Text className="text-sm text-text-secondary text-center mt-1">
                  Submit reports and earn BHD when they&apos;re verified
                </Text>
              </Card>
            ) : (
              earnings.map((entry, i) => {
                const info = FINE_TABLE[entry.category] ?? FINE_TABLE.other;
                return (
                  <Card
                    key={entry._id ?? i}
                    variant="elevated"
                    className="mb-3"
                  >
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <View
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 13,
                          backgroundColor: `${info.color}15`,
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: 12,
                        }}
                      >
                        <Ionicons
                          name={info.icon as any}
                          size={22}
                          color={info.color}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: "700",
                            color: Colors.text.DEFAULT,
                          }}
                        >
                          {info.label}
                        </Text>
                        <Text
                          style={{
                            fontSize: 11,
                            color: Colors.text.tertiary,
                            marginTop: 2,
                          }}
                        >
                          {entry.rewardPercent}% of{" "}
                          {formatBHD(entry.fineAmountBHD)} BHD fine
                        </Text>
                        <Text
                          style={{
                            fontSize: 11,
                            color: Colors.text.tertiary,
                            marginTop: 1,
                          }}
                        >
                          {formatDate(entry.awardedAt)}
                        </Text>
                      </View>
                      <View
                        style={{
                          backgroundColor: Colors.primary["50"],
                          borderRadius: 10,
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 15,
                            fontWeight: "800",
                            color: Colors.primary.DEFAULT,
                          }}
                        >
                          +{formatBHD(entry.amountBHD)}
                        </Text>
                        <Text
                          style={{
                            fontSize: 10,
                            color: Colors.text.secondary,
                            textAlign: "center",
                          }}
                        >
                          BHD
                        </Text>
                      </View>
                    </View>
                  </Card>
                );
              })
            )}
          </View>
        )}

        {/* Withdrawals Tab */}
        {activeTab === "withdrawals" && (
          <View className="px-5 mt-4">
            {withdrawals.length === 0 ? (
              <Card variant="elevated" className="items-center py-10">
                <View className="w-14 h-14 rounded-full bg-primary-50 items-center justify-center mb-3">
                  <Ionicons
                    name="arrow-down-circle-outline"
                    size={28}
                    color={Colors.primary.DEFAULT}
                  />
                </View>
                <Text className="text-base font-semibold text-text text-center">
                  No withdrawals yet
                </Text>
                <Text className="text-sm text-text-secondary text-center mt-1">
                  Earn {minimumWithdrawal} BHD to make your first withdrawal
                </Text>
              </Card>
            ) : (
              withdrawals.map((w, i) => {
                const cfg = WITHDRAWAL_STATUS_CONFIG[w.status];
                return (
                  <Card key={w._id ?? i} variant="elevated" className="mb-3">
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <View
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 13,
                          backgroundColor: Colors.primary["50"],
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: 12,
                        }}
                      >
                        <Ionicons
                          name="arrow-down-circle-outline"
                          size={22}
                          color={Colors.primary.DEFAULT}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: "700",
                            color: Colors.text.DEFAULT,
                          }}
                        >
                          Withdrawal Request
                        </Text>
                        <Text
                          style={{
                            fontSize: 11,
                            color: Colors.text.tertiary,
                            marginTop: 2,
                          }}
                        >
                          {formatDate(w.requestedAt)}
                        </Text>
                        {w.processedAt && (
                          <Text style={{ fontSize: 11, color: Colors.text.tertiary }}>
                            Processed: {formatDate(w.processedAt)}
                          </Text>
                        )}
                      </View>
                      <View style={{ alignItems: "flex-end", gap: 4 }}>
                        <Text
                          style={{
                            fontSize: 15,
                            fontWeight: "800",
                            color: Colors.primary.DEFAULT,
                          }}
                        >
                          {formatBHD(w.amountBHD)} BHD
                        </Text>
                        <View
                          style={{
                            backgroundColor: cfg.bg,
                            borderRadius: 8,
                            paddingHorizontal: 8,
                            paddingVertical: 3,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 11,
                              fontWeight: "700",
                              color: cfg.color,
                            }}
                          >
                            {cfg.label}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </Card>
                );
              })
            )}
          </View>
        )}

      </ScrollView>

      <Modal
        visible={withdrawModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setWithdrawModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "flex-end",
            backgroundColor: "rgba(0,0,0,0.45)",
          }}
        >
          <View
            style={{
              backgroundColor: Colors.surface.DEFAULT,
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              padding: 24,
              paddingBottom: 40,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 20,
              }}
            >
              <Text
                style={{ fontSize: 20, fontWeight: "800", color: Colors.text.DEFAULT }}
              >
                Withdraw Funds
              </Text>
              <TouchableOpacity onPress={() => setWithdrawModalVisible(false)}>
                <Ionicons name="close-circle" size={28} color={Colors.text.tertiary} />
              </TouchableOpacity>
            </View>

            {/* Balance info */}
            <View
              style={{
                backgroundColor: Colors.primary["50"],
                borderRadius: 16,
                padding: 16,
                marginBottom: 20,
              }}
            >
              <Text style={{ fontSize: 13, color: Colors.text.secondary, marginBottom: 4 }}>
                Available Balance
              </Text>
              <Text
                style={{ fontSize: 28, fontWeight: "800", color: Colors.primary.DEFAULT }}
              >
                {formatBHD(balance)} BHD
              </Text>
              <Text style={{ fontSize: 12, color: Colors.text.tertiary, marginTop: 4 }}>
                Minimum withdrawal: {minimumWithdrawal} BHD
              </Text>
            </View>

            {/* Amount input */}
            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: Colors.text.secondary,
                marginBottom: 8,
              }}
            >
              Enter amount (BHD)
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: Colors.surface.secondary,
                borderWidth: 1.5,
                borderColor: Colors.border.DEFAULT,
                borderRadius: 14,
                paddingHorizontal: 16,
                paddingVertical: 14,
                marginBottom: 8,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: Colors.text.secondary,
                  marginRight: 8,
                }}
              >
                BHD
              </Text>
              <TextInput
                value={withdrawAmount}
                onChangeText={setWithdrawAmount}
                keyboardType="decimal-pad"
                placeholder={`${minimumWithdrawal}.000`}
                placeholderTextColor={Colors.text.tertiary}
                style={{
                  flex: 1,
                  fontSize: 18,
                  fontWeight: "700",
                  color: Colors.text.DEFAULT,
                }}
              />
              <TouchableOpacity
                onPress={() => setWithdrawAmount(formatBHD(balance))}
              >
                <Text
                  style={{ fontSize: 12, fontWeight: "700", color: Colors.primary.DEFAULT }}
                >
                  MAX
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={{ fontSize: 11, color: Colors.text.tertiary, marginBottom: 24 }}>
              Funds will be transferred to your registered bank account within
              3-5 business days.
            </Text>

            {/* Confirm button */}
            <TouchableOpacity
              onPress={handleWithdraw}
              disabled={withdrawLoading}
              style={{
                backgroundColor: Colors.primary.DEFAULT,
                borderRadius: 16,
                paddingVertical: 16,
                alignItems: "center",
              }}
            >
              {withdrawLoading ? (
                <ActivityIndicator color={Colors.text.inverse} />
              ) : (
                <Text
                  style={{ color: Colors.text.inverse, fontSize: 16, fontWeight: "800" }}
                >
                  Confirm Withdrawal
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

