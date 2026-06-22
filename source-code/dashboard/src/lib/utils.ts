import type { ReportStatus } from "@/types";

// Category human-readable labels
export const CATEGORY_LABELS: Record<string, string> = {
  reckless_driving: "Reckless Driving",
  speeding: "Speeding",
  accident: "Accident",
  road_hazard: "Road Hazard",
  illegal_parking: "Illegal Parking",
  traffic_signal: "Traffic Signal",
  drunk_driving: "Drunk Driving",
  other: "Other",
};

export function categoryLabel(cat?: string): string {
  return cat ? (CATEGORY_LABELS[cat] ?? cat) : "—";
}

export const STATUS_CONFIG: Record<
  ReportStatus,
  { label: string; color: string; bg: string; dot: string }
> = {
  pending: {
    label: "Pending",
    color: "text-warning",
    bg: "bg-warning-bg",
    dot: "bg-warning",
  },
  under_review: {
    label: "Under Review",
    color: "text-info",
    bg: "bg-info-bg",
    dot: "bg-info",
  },
  rejected: {
    label: "Rejected",
    color: "text-danger",
    bg: "bg-danger-bg",
    dot: "bg-danger",
  },
  resolved: {
    label: "Resolved",
    color: "text-primary-600",
    bg: "bg-primary-50",
    dot: "bg-primary-500",
  },
};

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateTime(dateStr: string): string {
  return `${formatDate(dateStr)}, ${formatTime(dateStr)}`;
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(dateStr);
}

