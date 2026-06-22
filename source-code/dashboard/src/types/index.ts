// Report status — mirrors backend exactly
export type ReportStatus = "pending" | "under_review" | "rejected" | "resolved";

export type IncidentType =
  | "reckless_driving"
  | "speeding"
  | "accident"
  | "road_hazard"
  | "illegal_parking"
  | "traffic_signal"
  | "drunk_driving"
  | "other";

// Report
export interface Report {
  _id: string;
  user: {
    _id: string;
    cpr: string;
    name: string;
    phone: string;
  };
  description: string;
  category?: IncidentType;
  media: { url: string; publicId: string; mimetype: string }[];
  location: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };
  status: ReportStatus;
  adminNotes?: string;
  assignedTo?: { _id: string; name: string; email: string } | null;
  createdAt: string;
  updatedAt: string;
}

// Dashboard stats
export interface DashboardStats {
  total: number;
  pending: number;
  under_review: number;
  rejected: number;
  resolved: number;
  totalUsers: number;
  reportsThisMonth: number;
  reportsLastMonth: number;
  monthlyData: { month: string; reports: number }[];
  statusBreakdown: { status: string; count: number }[];
}

// Auth
export interface Admin {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "moderator";
}

// Moderator
export interface Moderator {
  _id: string;
  name: string;
  email: string;
  role: "moderator";
  createdAt: string;
  updatedAt: string;
}

