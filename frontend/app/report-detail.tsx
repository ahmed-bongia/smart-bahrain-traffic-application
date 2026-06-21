import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
  StatusBar,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBadge } from "@/src/components/ui";

import { Colors } from "@/src/constants/Colors";
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

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

const CATEGORY_ICONS: Record<string, string> = {
  reckless_driving: "car-sport-outline",
  speeding: "speedometer-outline",
  accident: "warning-outline",
  road_hazard: "alert-circle-outline",
  illegal_parking: "ban-outline",
  traffic_signal: "radio-button-on-outline",
  drunk_driving: "wine-outline",
  other: "ellipsis-horizontal-circle-outline",
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

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface MediaItem {
  url: string;
  publicId: string;
  mimetype?: string;
}

export default function ReportDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ report: string }>();

  const report = params.report ? JSON.parse(params.report) : null;

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (!report) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <Text className="text-text-secondary">Report not found.</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4">
          <Text className="text-primary-600 font-semibold">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const media: MediaItem[] = report.media ?? [];
  const images = media.filter((m) => m.mimetype?.startsWith("image"));
  const videos = media.filter((m) => !m.mimetype?.startsWith("image"));

  const allLightboxMedia = [...images, ...videos];

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const goPrev = () =>
    setLightboxIndex((i) =>
      i !== null ? (i - 1 + allLightboxMedia.length) % allLightboxMedia.length : null,
    );
  const goNext = () =>
    setLightboxIndex((i) =>
      i !== null ? (i + 1) % allLightboxMedia.length : null,
    );

  const categoryLabel =
    CATEGORY_LABELS[report.category] ?? report.category ?? "Unknown";
  const categoryIcon =
    (CATEGORY_ICONS[report.category] as any) ?? "alert-circle-outline";

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-border-light bg-white">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-9 h-9 rounded-xl bg-surface-secondary items-center justify-center mr-3"
        >
          <Ionicons name="arrow-back" size={20} color={Colors.primary.DEFAULT} />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-base font-bold text-text">Report Details</Text>
          <Text className="text-xs text-text-tertiary">
            #{report._id.slice(-6).toUpperCase()}
          </Text>
        </View>
        <StatusBadge status={report.status} />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Category Banner */}
        <View
          style={{ backgroundColor: Colors.primary["50"] }}
          className="mx-4 mt-4 rounded-2xl p-4 flex-row items-center gap-3"
        >
          <View
            style={{ backgroundColor: Colors.primary.DEFAULT }}
            className="w-12 h-12 rounded-xl items-center justify-center"
          >
            <Ionicons name={categoryIcon} size={24} color={Colors.text.inverse} />
          </View>
          <View className="flex-1">
            <Text className="text-xs text-text-tertiary font-medium uppercase tracking-wide">
              Category
            </Text>
            <Text className="text-base font-bold text-text">{categoryLabel}</Text>
          </View>
        </View>

        {/* Description */}
        <View className="mx-4 mt-3 bg-white rounded-2xl p-4 shadow-sm">
          <Text className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2">
            Description
          </Text>
          <Text className="text-sm text-text leading-relaxed">
            {report.description}
          </Text>
        </View>

        {/* Details Grid */}
        <View className="mx-4 mt-3 flex-row gap-3">
          <View className="flex-1 bg-white rounded-2xl p-4 shadow-sm">
            <View className="flex-row items-center gap-2 mb-1">
              <Ionicons name="location-outline" size={14} color={Colors.text.tertiary} />
              <Text className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">
                Location
              </Text>
            </View>
            <Text className="text-xs text-text font-mono leading-relaxed">
              {report.location.coordinates[1].toFixed(5)},{"\n"}
              {report.location.coordinates[0].toFixed(5)}
            </Text>
          </View>
          <View className="flex-1 bg-white rounded-2xl p-4 shadow-sm">
            <View className="flex-row items-center gap-2 mb-1">
              <Ionicons name="time-outline" size={14} color={Colors.text.tertiary} />
              <Text className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">
                Submitted
              </Text>
            </View>
            <Text className="text-xs text-text leading-relaxed">
              {formatDateTime(report.createdAt)}
            </Text>
          </View>
        </View>

        {/* Admin notes */}
        {!!report.adminNotes && (
          <View className="mx-4 mt-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <View className="flex-row items-center gap-2 mb-1">
              <Ionicons name="chatbox-outline" size={14} color={Colors.accent.dark} />
              <Text className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
                Admin Note
              </Text>
            </View>
            <Text className="text-sm text-amber-900">{report.adminNotes}</Text>
          </View>
        )}

        {/* Media Gallery */}
        {media.length > 0 && (
          <View className="mx-4 mt-4">
            <Text className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-3">
              Evidence ({media.length} file{media.length !== 1 ? "s" : ""})
            </Text>

            {/* Images */}
            {images.length > 0 && (
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: 8,
                }}
              >
                {images.map((m, idx) => (
                  <TouchableOpacity
                    key={m.publicId}
                    onPress={() => openLightbox(idx)}
                    activeOpacity={0.85}
                    style={{
                      width: (SCREEN_WIDTH - 48 - 8) / 2,
                      height: (SCREEN_WIDTH - 48 - 8) / 2,
                      borderRadius: 16,
                      overflow: "hidden",
                      backgroundColor: Colors.border.light,
                    }}
                  >
                    <Image
                      source={{ uri: m.url }}
                      style={{ width: "100%", height: "100%" }}
                      contentFit="cover"
                    />
                    <View
                      style={{
                        position: "absolute",
                        bottom: 6,
                        right: 6,
                        backgroundColor: "rgba(0,0,0,0.4)",
                        borderRadius: 8,
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                      }}
                    >
                      <Text style={{ color: Colors.text.inverse, fontSize: 10, fontWeight: "600" }}>
                        {idx + 1}/{images.length}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Videos */}
            {videos.length > 0 && (
              <View className="mt-3 gap-2">
                {videos.map((m, idx) => (
                  <TouchableOpacity
                    key={m.publicId}
                    onPress={() => Linking.openURL(m.url)}
                    activeOpacity={0.85}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: Colors.primary.DEFAULT,
                      borderRadius: 14,
                      padding: 14,
                      gap: 12,
                    }}
                  >
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        backgroundColor: "rgba(255,255,255,0.15)",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Ionicons name="play-circle" size={24} color={Colors.text.inverse} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: Colors.text.inverse, fontWeight: "700", fontSize: 14 }}>
                        Video {idx + 1}
                      </Text>
                      <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, marginTop: 2 }}>
                        Tap to open
                      </Text>
                    </View>
                    <Ionicons name="open-outline" size={18} color="rgba(255,255,255,0.6)" />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {media.length === 0 && (
          <View className="mx-4 mt-3 bg-white rounded-2xl p-5 shadow-sm items-center gap-2">
            <Ionicons name="image-outline" size={32} color={Colors.text.tertiary} />
            <Text className="text-sm text-text-tertiary">No media attached</Text>
          </View>
        )}
      </ScrollView>

      {/* Image Lightbox */}
      <Modal
        visible={lightboxIndex !== null}
        transparent
        animationType="fade"
        onRequestClose={closeLightbox}
        statusBarTranslucent
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.95)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

          {/* Close */}
          <TouchableOpacity
            onPress={closeLightbox}
            style={{
              position: "absolute",
              top: 52,
              right: 20,
              zIndex: 10,
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "rgba(255,255,255,0.15)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="close" size={22} color={Colors.text.inverse} />
          </TouchableOpacity>

          {/* Counter */}
          <Text
            style={{
              position: "absolute",
              top: 60,
              alignSelf: "center",
              color: "rgba(255,255,255,0.7)",
              fontSize: 14,
              fontWeight: "600",
              zIndex: 10,
            }}
          >
            {lightboxIndex !== null ? `${lightboxIndex + 1} / ${images.length}` : ""}
          </Text>

          {/* Image */}
          {lightboxIndex !== null && images[lightboxIndex] && (
            <Image
              source={{ uri: images[lightboxIndex].url }}
              style={{
                width: SCREEN_WIDTH,
                height: SCREEN_HEIGHT * 0.75,
              }}
              contentFit="contain"
            />
          )}

          {/* Prev / Next */}
          {images.length > 1 && (
            <>
              <TouchableOpacity
                onPress={goPrev}
                style={{
                  position: "absolute",
                  left: 16,
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: "rgba(255,255,255,0.15)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="chevron-back" size={24} color={Colors.text.inverse} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={goNext}
                style={{
                  position: "absolute",
                  right: 16,
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: "rgba(255,255,255,0.15)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="chevron-forward" size={24} color={Colors.text.inverse} />
              </TouchableOpacity>
            </>
          )}

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ position: "absolute", bottom: 40 }}
              contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
            >
              {images.map((m, i) => (
                <TouchableOpacity
                  key={m.publicId}
                  onPress={() => setLightboxIndex(i)}
                  style={{
                    width: 52,
                    height: 40,
                    borderRadius: 8,
                    overflow: "hidden",
                    borderWidth: 2,
                    borderColor: lightboxIndex === i ? Colors.text.inverse : "transparent",
                    opacity: lightboxIndex === i ? 1 : 0.5,
                  }}
                >
                  <Image
                    source={{ uri: m.url }}
                    style={{ width: "100%", height: "100%" }}
                    contentFit="cover"
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

