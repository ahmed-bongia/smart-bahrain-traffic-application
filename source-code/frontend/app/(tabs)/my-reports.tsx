import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { Card, StatusBadge, EmptyState } from "@/src/components/ui";
import { useAuth } from "@/src/context/AuthContext";
import { reportService } from "@/src/services/report.service";
import type { Report, ReportStatus } from "@/src/types";

import { Colors } from "@/src/constants/Colors";
// Config
type FilterValue = ReportStatus | "all";

const FILTER_OPTIONS: { label: string; value: FilterValue }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Under Review", value: "under_review" },
  { label: "Verified", value: "resolved" },
  { label: "Rejected", value: "rejected" },
];

// Map backend status -> UI badge status
const STATUS_DISPLAY: Record<string, ReportStatus> = {
  pending: "pending",
  under_review: "pending",
  rejected: "rejected",
  resolved: "resolved",
};

const CATEGORY_LABELS: Record<string, string> = {
  reckless_driving: "Reckless Driving",
  speeding: "Speeding",
  accident: "Accident",
  road_hazard: "Road Hazard",
  illegal_parking: "Illegal Parking",
  traffic_signal: "Traffic Signal",
  drunk_driving: "Drunk Driving",
  other: "Other",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Screen
export default function MyReportsScreen() {
  const { token } = useAuth();
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterValue>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchReports = useCallback(async () => {
    if (!token) return;
    try {
      const data = await reportService.getMyReports(token);
      setReports(data);
    } catch (err) {
      console.error("My Reports fetch error:", err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      fetchReports();
    }, [fetchReports]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchReports();
  };

  const filtered = reports.filter((r) => {
    const matchesFilter =
      activeFilter === "all" ||
      r.status === activeFilter ||
      // "pending" filter shows both pending + under_review
      (activeFilter === "pending" && r.status === "under_review");
    const matchesSearch =
      !searchQuery ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      {/* Header */}
      <View className="px-5 pt-4 pb-2">
        <Text className="text-2xl font-bold text-text">My Reports</Text>
        <Text className="text-sm text-text-secondary mt-1">
          Track and manage your submissions
        </Text>
      </View>

      {/* Search */}
      <View className="px-5 mt-2">
        <View className="flex-row items-center bg-white rounded-2xl px-4 py-3 shadow-sm">
          <Ionicons name="search-outline" size={20} color={Colors.text.tertiary} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search your reports..."
            placeholderTextColor={Colors.text.tertiary}
            className="flex-1 text-base text-text ml-3"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color={Colors.text.tertiary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Pills */}
      <View style={{ height: 44, marginTop: 12 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            gap: 8,
            alignItems: "center",
          }}
        >
          {FILTER_OPTIONS.map((opt) => {
            const isActive = activeFilter === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                onPress={() => setActiveFilter(opt.value)}
                style={[
                  {
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 999,
                    backgroundColor: isActive ? Colors.primary.DEFAULT : Colors.text.inverse,
                  },
                  !isActive && {
                    shadowColor: "#000",
                    shadowOpacity: 0.04,
                    shadowRadius: 4,
                    elevation: 1,
                  },
                ]}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: isActive ? Colors.text.inverse : Colors.text.secondary,
                  }}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Report Count */}
      <View className="px-5 mt-4 mb-3">
        <Text className="text-sm text-text-secondary">
          {isLoading
            ? "Loading..."
            : `${filtered.length} report${filtered.length !== 1 ? "s" : ""} found`}
        </Text>
      </View>

      {/* Report List */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 4,
          paddingBottom: 32,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary.DEFAULT}
          />
        }
      >
        {isLoading ? (
          [1, 2, 3].map((i) => (
            <View key={i} className="h-24 rounded-2xl bg-white/60 mb-3" />
          ))
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="document-text-outline"
            title="No reports found"
            description={
              searchQuery
                ? "Try a different search term."
                : "You haven't submitted any reports yet."
            }
          />
        ) : (
          filtered.map((report) => (
            <TouchableOpacity
              key={report._id}
              activeOpacity={0.85}
              onPress={() =>
                router.push({
                  pathname: "/report-detail",
                  params: { report: JSON.stringify(report) },
                })
              }
            >
              <Card variant="elevated" className="mb-3 mx-0.5">
                {/* Top row */}
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
                        {report.category
                          ? (CATEGORY_LABELS[report.category] ??
                            report.category)
                          : "Report"}
                      </Text>
                      <StatusBadge
                        status={STATUS_DISPLAY[report.status] ?? "pending"}
                      />
                    </View>
                    <Text
                      className="text-xs text-text-secondary mt-1"
                      numberOfLines={2}
                    >
                      {report.description}
                    </Text>
                  </View>
                </View>

                {/* Divider */}
                <View className="h-px bg-border-light my-3" />

                {/* Bottom meta row */}
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <Ionicons
                      name="location-outline"
                      size={13}
                      color={Colors.text.tertiary}
                    />
                    <Text
                      className="text-xs text-text-tertiary ml-1"
                      numberOfLines={1}
                    >
                      {report.location.coordinates[1].toFixed(4)},{" "}
                      {report.location.coordinates[0].toFixed(4)}
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons name="time-outline" size={13} color={Colors.text.tertiary} />
                    <Text className="text-xs text-text-tertiary ml-1">
                      {timeAgo(report.createdAt)}
                    </Text>
                  </View>
                </View>

                {/* Media count + chevron row */}
                <View className="flex-row items-center justify-between mt-2">
                  {report.media.length > 0 ? (
                    <View className="flex-row items-center">
                      <Ionicons
                        name="image-outline"
                        size={13}
                        color={Colors.text.tertiary}
                      />
                      <Text className="text-xs text-text-tertiary ml-1">
                        {report.media.length} file
                        {report.media.length !== 1 ? "s" : ""}
                      </Text>
                    </View>
                  ) : (
                    <View />
                  )}
                  <View className="flex-row items-center gap-1">
                    <Text className="text-xs text-primary-600 font-semibold">
                      View details
                    </Text>
                    <Ionicons
                      name="chevron-forward"
                      size={13}
                      color={Colors.primary.DEFAULT}
                    />
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

