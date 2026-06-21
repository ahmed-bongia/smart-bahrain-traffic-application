import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "@/src/context/AuthContext";
import { reportService } from "@/src/services/report.service";
import { rewardService } from "@/src/services/reward.service";
import { cleanDisplayText } from "@/src/utils/cleanDisplayText";
import {
  Card,
  StatCard,
  SectionHeader,
  StatusBadge,
} from "@/src/components/ui";
import type { Report, ReportStatus } from "@/src/types";
import { Colors } from "@/src/constants/Colors";

const STATUS_LABEL_MAP: Record<string, ReportStatus> = {
  pending: "pending",
  under_review: "pending",
  confirmed: "resolved",
  rejected: "rejected",
  resolved: "resolved",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function HomeScreen() {
  const { user, token } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!token) return;
    try {
      const [fetchedReports, rewardsData] = await Promise.all([
        reportService.getMyReports(token),
        rewardService.getMyRewards(token),
      ]);
      setReports(fetchedReports);
      setBalance(rewardsData.balance);
    } catch (err) {
      console.error("Home fetch error:", err);
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

  const total = reports.length;
  const resolved = reports.filter((r) => r.status === "resolved").length;
  const pending = reports.filter((r) =>
    ["pending", "under_review"].includes(r.status),
  ).length;
  const recentReports = reports.slice(0, 5);
  const firstName = cleanDisplayText(user?.name, "there").split(" ")[0];

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-8"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary.DEFAULT}
          />
        }
      >
        <View className="px-5 pt-4 pb-2">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="w-12 h-12 rounded-full bg-primary-100 items-center justify-center mr-3">
                <Ionicons name="person" size={22} color={Colors.primary.DEFAULT} />
              </View>
              <View>
                <Text className="text-lg font-bold text-text">
                  Hi, {firstName}
                </Text>
                <View className="flex-row items-center">
                  <Ionicons name="cash-outline" size={13} color={Colors.accent.DEFAULT} />
                  <Text className="text-sm text-text-secondary ml-1">
                    {balance.toFixed(3)} BHD
                  </Text>
                </View>
              </View>
            </View>
            <TouchableOpacity className="w-10 h-10 rounded-xl bg-white items-center justify-center shadow-sm">
              <Ionicons
                name="notifications-outline"
                size={22}
                color={Colors.text.DEFAULT}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View className="px-5 mt-6">
          <SectionHeader title="Overview" />
          <View className="flex-row gap-3">
            <View className="flex-1">
              <StatCard
                title="Total Reports"
                value={isLoading ? "..." : total}
                icon="document-text"
              />
            </View>
            <View className="flex-1">
              <StatCard
                title="BHD Earned"
                value={isLoading ? "..." : balance.toFixed(3)}
                icon="cash"
              />
            </View>
          </View>
          <View className="flex-row gap-3 mt-3">
            <View className="flex-1">
              <StatCard
                title="Verified"
                value={isLoading ? "..." : resolved}
                icon="checkmark-circle"
              />
            </View>
            <View className="flex-1">
              <StatCard
                title="Pending"
                value={isLoading ? "..." : pending}
                icon="time"
              />
            </View>
          </View>
        </View>

        <View className="px-5 mt-6">
          <SectionHeader
            title="Recent Reports"
            action={
              <TouchableOpacity
                onPress={() => router.push("/(tabs)/my-reports" as never)}
              >
                <Text className="text-sm font-semibold text-primary">
                  View All
                </Text>
              </TouchableOpacity>
            }
          />

          {isLoading ? (
            [1, 2, 3].map((i) => (
              <View key={i} className="h-20 rounded-2xl bg-white/60 mb-3" />
            ))
          ) : recentReports.length === 0 ? (
            <View className="items-center py-8">
              <Ionicons
                name="document-text-outline"
                size={36}
                color={Colors.text.tertiary}
              />
              <Text className="text-sm text-text-tertiary mt-2">
                No reports yet. Tap Report to start.
              </Text>
            </View>
          ) : (
            recentReports.map((report) => (
              <TouchableOpacity key={report._id} activeOpacity={0.85}>
                <Card variant="elevated" className="mb-3">
                  <View className="flex-row items-start">
                    <View className="w-11 h-11 rounded-xl bg-primary-50 items-center justify-center mr-3">
                      <Ionicons
                        name="alert-circle-outline"
                        size={20}
                        color={Colors.primary.DEFAULT}
                      />
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center justify-between">
                        <Text
                          className="text-base font-semibold text-text flex-1 mr-2"
                          numberOfLines={1}
                        >
                          {cleanDisplayText(report.description, "Untitled report")}
                        </Text>
                        <StatusBadge
                          status={STATUS_LABEL_MAP[report.status] ?? "pending"}
                        />
                      </View>
                      <View className="flex-row items-center mt-1.5">
                        <Ionicons
                          name="location-outline"
                          size={13}
                          color={Colors.text.tertiary}
                        />
                        <Text
                          className="text-xs text-text-tertiary ml-1 flex-1"
                          numberOfLines={1}
                        >
                          {report.location.coordinates[1].toFixed(4)},{" "}
                          {report.location.coordinates[0].toFixed(4)}
                        </Text>
                      </View>
                      <Text className="text-xs text-text-tertiary mt-1">
                        {timeAgo(report.createdAt)}
                      </Text>
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
