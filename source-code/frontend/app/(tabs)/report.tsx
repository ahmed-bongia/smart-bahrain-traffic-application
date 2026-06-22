import React, { useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Modal,
  Image,
  FlatList,
  StatusBar,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import MapView, { Marker, Region } from "react-native-maps";
import { useAuth } from "@/src/context/AuthContext";
import { reportService, type MediaFile } from "@/src/services/report.service";
import { Button } from "@/src/components/ui";

import { Colors } from "@/src/constants/Colors";

const MAX_MEDIA_FILES = 10;

// Categories
const CATEGORIES = [
  {
    id: "reckless_driving",
    label: "Reckless Driving",
    icon: "warning-outline" as const,
  },
  { id: "speeding", label: "Speeding", icon: "speedometer-outline" as const },
  { id: "accident", label: "Accident", icon: "car-outline" as const },
  {
    id: "road_hazard",
    label: "Road Hazard",
    icon: "alert-circle-outline" as const,
  },
  {
    id: "illegal_parking",
    label: "Illegal Parking",
    icon: "close-circle-outline" as const,
  },
  {
    id: "traffic_signal",
    label: "Traffic Signal",
    icon: "bulb-outline" as const,
  },
  {
    id: "drunk_driving",
    label: "Drunk Driving",
    icon: "wine-outline" as const,
  },
  { id: "other", label: "Other", icon: "ellipsis-horizontal-outline" as const },
];

// Screen
export default function ReportScreen() {
  const { token } = useAuth();
  const insets = useSafeAreaInsets();

  // Form state
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Media state
  const [media, setMedia] = useState<MediaFile[]>([]);

  // Location state
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [locationLabel, setLocationLabel] = useState("");
  const [mapModalVisible, setMapModalVisible] = useState(false);
  const [tempRegion, setTempRegion] = useState<Region>({
    latitude: 26.0667,
    longitude: 50.5577,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [gettingLocation, setGettingLocation] = useState(false);
  const [mediaOptionsVisible, setMediaOptionsVisible] = useState(false);
  const mapRef = useRef<MapView>(null);

  const canSubmit =
    description.trim().length > 0 && category && coords !== null;

  // Open map picker
  const openMapPicker = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Location permission is required.");
      return;
    }
    // Centre on current location when opening
    try {
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const region: Region = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setTempRegion(region);
    } catch {
      // fall back to Bahrain centre
    }
    setMapModalVisible(true);
  };

  // Snap to current GPS position inside the map modal
  const handleGoToCurrentLocation = async () => {
    setGettingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location permission is required.");
        return;
      }
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const region: Region = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      };
      setTempRegion(region);
      mapRef.current?.animateToRegion(region, 400);
    } catch {
      Alert.alert("Error", "Could not get your location.");
    } finally {
      setGettingLocation(false);
    }
  };

  // Confirm the pin location
  const confirmLocation = async () => {
    setCoords({ lat: tempRegion.latitude, lng: tempRegion.longitude });
    // Reverse geocode for a human-readable label
    try {
      const results = await Location.reverseGeocodeAsync({
        latitude: tempRegion.latitude,
        longitude: tempRegion.longitude,
      });
      if (results[0]) {
        const { street, district, city } = results[0];
        setLocationLabel([street, district, city].filter(Boolean).join(", "));
      } else {
        setLocationLabel(
          `${tempRegion.latitude.toFixed(5)}, ${tempRegion.longitude.toFixed(5)}`,
        );
      }
    } catch {
      setLocationLabel(
        `${tempRegion.latitude.toFixed(5)}, ${tempRegion.longitude.toFixed(5)}`,
      );
    }
    setMapModalVisible(false);
  };

  // Media helpers
  const addMediaFiles = (files: MediaFile[]) => {
    if (media.length >= MAX_MEDIA_FILES) {
      Alert.alert("Media Limit", `You can attach up to ${MAX_MEDIA_FILES} files.`);
      return;
    }

    const availableSlots = MAX_MEDIA_FILES - media.length;
    const acceptedFiles = files.slice(0, availableSlots);

    if (files.length > availableSlots) {
      Alert.alert(
        "Media Limit",
        `Only ${availableSlots} more file${availableSlots === 1 ? "" : "s"} can be added.`,
      );
    }

    setMedia((prev) => [...prev, ...acceptedFiles]);
  };

  const addImagePickerMedia = (assets: ImagePicker.ImagePickerAsset[]) => {
    const files: MediaFile[] = assets.map((asset, index) => {
      const isVideo = asset.type === "video";

      return {
        uri: asset.uri,
        type: asset.mimeType ?? (isVideo ? "video/mp4" : "image/jpeg"),
        name:
          asset.fileName ??
          `report_${isVideo ? "video" : "photo"}_${Date.now()}_${index}.${isVideo ? "mp4" : "jpg"}`,
      };
    });

    if (files.length === 0) {
      Alert.alert("No Media", "Please take a photo or record a video.");
      return;
    }

    addMediaFiles(files);
  };

  const handleTakePhoto = async () => {
    if (media.length >= MAX_MEDIA_FILES) {
      Alert.alert("Media Limit", `You can attach up to ${MAX_MEDIA_FILES} files.`);
      return;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Camera permission is required to take photos.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });

    if (!result.canceled) addImagePickerMedia(result.assets);
  };

  const handleRecordVideo = async () => {
    if (media.length >= MAX_MEDIA_FILES) {
      Alert.alert("Media Limit", `You can attach up to ${MAX_MEDIA_FILES} files.`);
      return;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Camera permission is required to record video.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["videos"],
      quality: 0.8,
      videoMaxDuration: 60,
    });
    if (!result.canceled) addImagePickerMedia(result.assets);
  };

  const runMediaAction = (action: () => Promise<void>) => {
    setMediaOptionsVisible(false);
    setTimeout(() => {
      void action();
    }, 180);
  };

  const showMediaOptions = () => {
    setMediaOptionsVisible(true);
  };

  const removeMedia = (index: number) => {
    setMedia((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit
  const handleSubmit = async () => {
    if (!canSubmit || !token || !coords) return;
    setIsSubmitting(true);
    try {
      await reportService.create(
        token,
        {
          description: description.trim(),
          category,
          latitude: coords.lat,
          longitude: coords.lng,
        },
        media,
      );
      Alert.alert(
        "Report Submitted",
        "Your report has been submitted successfully!",
        [
          {
            text: "OK",
            onPress: () => {
              setDescription("");
              setCategory("");
              setCoords(null);
              setLocationLabel("");
              setMedia([]);
            },
          },
        ],
      );
    } catch (err: unknown) {
      Alert.alert(
        "Error",
        err instanceof Error ? err.message : "Failed to submit report.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render
  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header */}
        <View className="px-5 pt-4 pb-2">
          <Text className="text-2xl font-bold text-text">Create Report</Text>
          <Text className="text-sm text-text-secondary mt-1">
            Report a traffic incident
          </Text>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerClassName="px-5 pb-10"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Category */}
          <Text className="text-sm font-semibold text-text mb-3 mt-4">
            Category *
          </Text>
          <View className="flex-row flex-wrap gap-2 mb-5">
            {CATEGORIES.map((cat) => {
              const active = category === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setCategory(cat.id)}
                  className={`flex-row items-center px-4 py-2.5 rounded-xl ${active ? "bg-primary" : "bg-white"}`}
                  style={
                    !active
                      ? {
                          shadowColor: "#000",
                          shadowOpacity: 0.05,
                          shadowRadius: 4,
                          elevation: 1,
                        }
                      : undefined
                  }
                >
                  <Ionicons
                    name={cat.icon}
                    size={17}
                    color={active ? Colors.text.inverse : Colors.text.secondary}
                  />
                  <Text
                    className={`text-sm font-medium ml-2 ${active ? "text-white" : "text-text-secondary"}`}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Description */}
          <Text className="text-sm font-semibold text-text mb-1.5">
            Description *
          </Text>
          <View className="bg-surface-secondary rounded-xl px-4 py-3 mb-5">
            <TextInput
              placeholder="Describe the issue in detail..."
              placeholderTextColor={Colors.text.tertiary}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              className="text-base text-text min-h-[100px]"
            />
          </View>

          {/* Location */}
          <Text className="text-sm font-semibold text-text mb-2">
            Location *
          </Text>

          {/* Preview box - tapping opens the map picker */}
          <TouchableOpacity
            onPress={openMapPicker}
            activeOpacity={0.8}
            className="rounded-2xl overflow-hidden mb-3 border border-border"
            style={{ height: coords ? 180 : undefined }}
          >
            {coords ? (
              /* Mini map preview */
              <MapView
                style={{ width: "100%", height: 180 }}
                region={{
                  latitude: coords.lat,
                  longitude: coords.lng,
                  latitudeDelta: 0.005,
                  longitudeDelta: 0.005,
                }}
                scrollEnabled={false}
                zoomEnabled={false}
                pitchEnabled={false}
                rotateEnabled={false}
                pointerEvents="none"
              >
                <Marker
                  coordinate={{ latitude: coords.lat, longitude: coords.lng }}
                />
              </MapView>
            ) : (
              <View className="bg-surface-secondary px-4 py-5 flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center">
                  <Ionicons name="map-outline" size={20} color={Colors.primary.DEFAULT} />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-text">
                    Pick on Map
                  </Text>
                  <Text className="text-xs text-text-tertiary mt-0.5">
                    Tap to open the map
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Colors.text.tertiary} />
              </View>
            )}
          </TouchableOpacity>

          {/* Location label / coords */}
          {coords && (
            <View className="flex-row items-center mb-1">
              <Ionicons name="location" size={14} color={Colors.status.success} />
              <Text
                className="text-xs text-text-secondary ml-1.5 flex-1"
                numberOfLines={1}
              >
                {locationLabel ||
                  `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`}
              </Text>
              <TouchableOpacity onPress={openMapPicker}>
                <Text className="text-xs text-primary font-semibold ml-2">
                  Change
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <View className="mb-5" />

          {/* Media */}
          <Text className="text-sm font-semibold text-text mb-2">
            Photo & Video Evidence (optional)
          </Text>

          {/* Thumbnails */}
          {media.length > 0 && (
            <FlatList
              data={media}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(_, i) => String(i)}
              contentContainerStyle={{ gap: 10, marginBottom: 12 }}
              renderItem={({ item, index }) => (
                <View
                  className="rounded-xl overflow-hidden"
                  style={{ width: 100, height: 100 }}
                >
                  {item.type.startsWith("video") ? (
                    <View className="w-full h-full bg-gray-200 items-center justify-center">
                      <Ionicons name="videocam" size={32} color={Colors.text.secondary} />
                      <Text className="text-xs text-text-secondary mt-1">
                        Video
                      </Text>
                    </View>
                  ) : (
                    <Image
                      source={{ uri: item.uri }}
                      style={{ width: 100, height: 100 }}
                      resizeMode="cover"
                    />
                  )}
                  {/* Remove button */}
                  <TouchableOpacity
                    onPress={() => removeMedia(index)}
                    className="absolute top-1 right-1 bg-black/60 rounded-full w-6 h-6 items-center justify-center"
                  >
                    <Ionicons name="close" size={14} color={Colors.text.inverse} />
                  </TouchableOpacity>
                </View>
              )}
            />
          )}

          {/* Add media button */}
          <TouchableOpacity
            onPress={showMediaOptions}
            activeOpacity={0.8}
            className="flex-row items-center justify-center gap-2 py-4 rounded-xl border border-dashed border-border bg-surface-secondary mb-6"
          >
            <Ionicons name="camera-outline" size={22} color={Colors.primary.DEFAULT} />
            <Text className="text-sm font-semibold text-primary">
              {media.length > 0 ? "Add More Evidence" : "Add Live Evidence"}
            </Text>
          </TouchableOpacity>

          {/* Submit */}
          <Button
            title="Submit Report"
            size="lg"
            loading={isSubmitting}
            disabled={!canSubmit}
            onPress={handleSubmit}
            icon={
              <Ionicons
                name="send"
                size={18}
                color={Colors.text.inverse}
                style={{ marginRight: 4 }}
              />
            }
            className="shadow-button"
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={mediaOptionsVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMediaOptionsVisible(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "flex-end",
            backgroundColor: "rgba(15, 23, 42, 0.55)",
          }}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setMediaOptionsVisible(false)}
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
            }}
          />
          <View
            style={{
              marginHorizontal: 16,
              marginBottom: Math.max(insets.bottom, 16),
              borderRadius: 24,
              backgroundColor: Colors.surface.DEFAULT,
              borderWidth: 1,
              borderColor: Colors.border.DEFAULT,
              padding: 18,
              shadowColor: "#000",
              shadowOpacity: 0.18,
              shadowRadius: 18,
              elevation: 8,
            }}
          >
            <View className="flex-row items-start justify-between mb-4">
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text className="text-lg font-bold text-text">
                  Add Evidence
                </Text>
                <Text className="text-sm text-text-secondary mt-1">
                  Capture live evidence for this report.
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setMediaOptionsVisible(false)}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: Colors.primary["50"],
                }}
              >
                <Ionicons name="close" size={20} color={Colors.primary.DEFAULT} />
              </TouchableOpacity>
            </View>
            <View style={{ gap: 10 }}>
              <TouchableOpacity
                activeOpacity={0.86}
                onPress={() => runMediaAction(handleTakePhoto)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  borderRadius: 16,
                  backgroundColor: Colors.primary.DEFAULT,
                  paddingHorizontal: 16,
                  paddingVertical: 15,
                }}
              >
                <View
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 19,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "rgba(255,255,255,0.18)",
                    marginRight: 12,
                  }}
                >
                  <Ionicons name="camera-outline" size={21} color={Colors.text.inverse} />
                </View>
                <Text className="text-base font-bold text-white">
                  Take Photo
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.86}
                onPress={() => runMediaAction(handleRecordVideo)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  borderRadius: 16,
                  backgroundColor: Colors.primary.dark,
                  paddingHorizontal: 16,
                  paddingVertical: 15,
                }}
              >
                <View
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 19,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "rgba(255,255,255,0.18)",
                    marginRight: 12,
                  }}
                >
                  <Ionicons name="videocam-outline" size={21} color={Colors.text.inverse} />
                </View>
                <Text className="text-base font-bold text-white">
                  Record Video
                </Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={() => setMediaOptionsVisible(false)}
              className="items-center justify-center mt-3 py-3 rounded-2xl bg-surface-secondary"
            >
              <Text className="text-sm font-bold text-text-secondary">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Map Picker Modal */}
      <Modal
        visible={mapModalVisible}
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setMapModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: Colors.surface.DEFAULT }}>
          <StatusBar barStyle="dark-content" />

          {/* Header - sits below the notch */}
          <View
            style={{
              paddingTop: insets.top,
              backgroundColor: Colors.surface.DEFAULT,
              borderBottomWidth: 1,
              borderBottomColor: Colors.border.DEFAULT,
            }}
          >
            <View className="flex-row items-center justify-between px-5 py-3">
              <TouchableOpacity
                onPress={() => setMapModalVisible(false)}
                className="p-1"
              >
                <Ionicons name="close" size={26} color={Colors.text.DEFAULT} />
              </TouchableOpacity>
              <Text className="text-base font-bold text-text">
                Pick Location
              </Text>
              <TouchableOpacity
                onPress={confirmLocation}
                className="bg-primary px-4 py-2 rounded-xl"
              >
                <Text className="text-white text-sm font-semibold">
                  Confirm
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Map - fills remaining space between header and bottom bar */}
          <View style={{ flex: 1 }}>
            <MapView
              ref={mapRef}
              style={{ width: "100%", height: "100%" }}
              initialRegion={tempRegion}
              onRegionChangeComplete={(region) => setTempRegion(region)}
              showsUserLocation
              showsMyLocationButton={false}
            />

            {/* Fixed centre pin - perfectly centred over the map view */}
            <View
              pointerEvents="none"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* Shift up by half the icon height so the tip of the pin is centred */}
              <View style={{ marginBottom: 44 }}>
                <Ionicons name="location" size={44} color={Colors.primary.DEFAULT} />
              </View>
            </View>

            {/* GPS button - above the bottom bar */}
            <TouchableOpacity
              onPress={handleGoToCurrentLocation}
              disabled={gettingLocation}
              style={{
                position: "absolute",
                bottom: 24,
                right: 20,
                backgroundColor: Colors.primary.DEFAULT,
                borderRadius: 50,
                width: 52,
                height: 52,
                alignItems: "center",
                justifyContent: "center",
                shadowColor: "#000",
                shadowOpacity: 0.25,
                shadowRadius: 6,
                elevation: 6,
              }}
            >
              {gettingLocation ? (
                <ActivityIndicator color={Colors.text.inverse} size="small" />
              ) : (
                <Ionicons name="navigate" size={24} color={Colors.text.inverse} />
              )}
            </TouchableOpacity>
          </View>

          {/* Coords bar - sits above the home indicator */}
          <View
            style={{
              paddingBottom: insets.bottom || 16,
              paddingTop: 12,
              paddingHorizontal: 20,
              borderTopWidth: 1,
              borderTopColor: Colors.border.DEFAULT,
              backgroundColor: Colors.surface.DEFAULT,
            }}
          >
            <Text className="text-xs text-text-tertiary text-center">
              {tempRegion.latitude.toFixed(6)},{" "}
              {tempRegion.longitude.toFixed(6)}
            </Text>
            <Text className="text-xs text-text-secondary text-center mt-0.5">
              Move the map to position the pin, then tap Confirm
            </Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

