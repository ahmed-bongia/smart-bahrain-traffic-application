// â”€â”€â”€ Development API URL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// "localhost" only works in the iOS Simulator.
// For a physical device (Expo Go) use your machine's local network IP.
// Run `ipconfig getifaddr en0` (macOS) to find it.
const DEV_HOST = "10.53.242.56"; // ↑ your Mac's LAN IP (auto-detected)

export const Config = {
  API_BASE_URL: __DEV__
    ? `http://${DEV_HOST}:5000/api`
    : "https://your-production-api.com/api",
  PUBLIC_EMERGENCY_BASE_URL:
    process.env.EXPO_PUBLIC_EMERGENCY_BASE_URL ??
    (__DEV__
      ? `http://${DEV_HOST}:5173/public/emergency`
      : "https://your-public-site.com/public/emergency"),
  APP_NAME: "Smart Bahrain",
  VERSION: "1.0.0",
} as const;
