/** Shared API types for the frontend - aligned with backend schema */

// Generic HTTP response wrappers
export interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  totalPages: number;
  totalCount: number;
}

// Earnings / Rewards
export interface EarningEntry {
  _id?: string;
  title: string;
  description: string;
  amountBHD: number; // reward paid to user  e.g. 1.000
  fineAmountBHD: number; // full fine issued      e.g. 20.000
  rewardPercent: number; // percentage            e.g. 5
  category: string;
  reportId?: string;
  awardedAt: string;
}

export interface WithdrawalRequest {
  _id?: string;
  amountBHD: number;
  status: "pending" | "approved" | "rejected";
  requestedAt: string;
  processedAt?: string;
}

export interface MyRewardsResponse {
  balance: number;
  totalEarned: number;
  earnings: EarningEntry[];
  withdrawalRequests: WithdrawalRequest[];
  minimumWithdrawal: number;
}

export interface LeaderboardEntry {
  _id: string;
  name: string;
  totalEarned: number;
}

// User
export interface User {
  _id: string;
  cpr: string;
  name: string;
  phone: string;
  role: "user" | "admin";
  balance: number;
  totalEarned: number;
  createdAt: string;
  updatedAt: string;
}

// Emergency contacts / QR
export interface EmergencyContact {
  name: string;
  relationship?: string;
  phone: string;
}

export interface EmergencyProfileResponse {
  emergencyContacts: EmergencyContact[];
  emergencyPublicToken: string;
}

export interface EmergencyProfilePublicResponse {
  name: string;
  updatedAt: string;
  emergencyContacts: EmergencyContact[];
}

// Report
export type ReportStatus = "pending" | "under_review" | "rejected" | "resolved";

export type ReportCategory =
  | "reckless_driving"
  | "speeding"
  | "accident"
  | "road_hazard"
  | "illegal_parking"
  | "traffic_signal"
  | "drunk_driving"
  | "other";

export interface ReportMedia {
  url: string;
  publicId: string;
  mimetype?: string;
}

export interface Report {
  _id: string;
  description: string;
  category: ReportCategory;
  media: ReportMedia[];
  location: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  status: ReportStatus;
  adminNotes?: string;
  assignedTo?: string | { _id: string; name: string; email: string } | null;
  user: string | User;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReportPayload {
  description: string;
  category: string;
  longitude: number;
  latitude: number;
}

// Auth
export interface AuthResponse {
  _id: string;
  cpr: string;
  name: string;
  phone: string;
  role: "user" | "admin";
  balance: number;
  totalEarned: number;
  token: string;
}

export interface LoginPayload {
  cpr: string;
  password: string;
}

export interface ForgotPasswordPayload {
  cpr: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface VerifyOtpPayload {
  cpr: string;
  otp: string;
}

export interface VerifyOtpResponse {
  resetToken: string;
}

export interface ResetPasswordPayload {
  resetToken: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface RegisterPayload {
  cpr: string;
  name: string;
  phone: string;
  password: string;
}
