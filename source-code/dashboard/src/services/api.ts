// Base URL - update to your machine's LAN IP for device testing
const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

// Token helpers
export const getToken = (): string | null =>
  localStorage.getItem("dashboard_token");

const authHeader = (): Record<string, string> => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Core fetch wrapper
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...authHeader(),
        ...(options.headers as Record<string, string>),
      },
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(
        (data as { message?: string }).message ?? `HTTP ${res.status}`,
      );
    }

    return data as T;
  } catch (err) {
    // If it's already an Error with a message, re-throw it
    if (err instanceof Error && err.message !== "Failed to fetch") {
      throw err;
    }
    // Network error or fetch failed
    const message = err instanceof Error ? err.message : "Network request failed";
    throw new Error(message || "Failed to connect to server");
  }
}

// Auth endpoints
export interface AdminAuthResponse {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "moderator";
  token: string;
}

export const adminRegister = (payload: {
  name: string;
  email: string;
  password: string;
}) =>
  request<AdminAuthResponse>("/admin/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const adminLogin = (payload: { email: string; password: string }) =>
  request<AdminAuthResponse>("/admin/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const getAdminMe = () =>
  request<Omit<AdminAuthResponse, "token">>("/admin/me");

// Dashboard stats
export interface DashboardStatsResponse {
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

export const fetchDashboardStats = () =>
  request<DashboardStatsResponse>("/admin/stats");

// Reports
export interface BackendReport {
  _id: string;
  user: {
    _id: string;
    cpr: string;
    name: string;
    phone: string;
  };
  description: string;
  category?: string;
  media: { url: string; publicId: string; mimetype: string }[];
  location: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };
  status: "pending" | "under_review" | "rejected" | "resolved";
  adminNotes?: string;
  assignedTo?: { _id: string; name: string; email: string } | null;
  createdAt: string;
  updatedAt: string;
}

export const fetchAllReports = () =>
  request<BackendReport[]>("/reports/all/list");

export const fetchReportById = (id: string) =>
  request<BackendReport>(`/reports/${id}`);

export const assignReport = (id: string) =>
  request<BackendReport>(`/reports/${id}/assign`, { method: "PUT" });

export const updateReportStatus = (
  id: string,
  payload: { status: string; adminNotes?: string },
) =>
  request<BackendReport>(`/reports/${id}/status`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

// Users
export interface BackendUser {
  _id: string;
  cpr: string;
  name: string;
  phone: string;
  balance: number;
  totalEarned: number;
  createdAt: string;
}

export const fetchAllUsers = () => request<BackendUser[]>("/admin/users");

export const resetUserPassword = (userId: string, newPassword: string) =>
  request<{ message: string }>(`/admin/users/${userId}/password`, {
    method: "PUT",
    body: JSON.stringify({ newPassword }),
  });

// Public emergency profile (QR)
export interface PublicEmergencyContact {
  name: string;
  relationship?: string;
  phone: string;
}

export interface PublicEmergencyProfile {
  name: string;
  updatedAt: string;
  emergencyContacts: PublicEmergencyContact[];
}

export const fetchPublicEmergencyProfile = (token: string) =>
  request<PublicEmergencyProfile>(`/emergency/public/${token}`);

// Moderator management (admin-only)
export interface BackendModerator {
  _id: string;
  name: string;
  email: string;
  role: "moderator";
  createdAt: string;
  updatedAt: string;
}

export const fetchModerators = () =>
  request<BackendModerator[]>("/admin/moderators");

export const createModerator = (payload: {
  name: string;
  email: string;
  password: string;
}) =>
  request<BackendModerator>("/admin/moderators", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updateModerator = (
  id: string,
  payload: { name?: string; email?: string; password?: string },
) =>
  request<BackendModerator>(`/admin/moderators/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

export const deleteModerator = (id: string) =>
  request<{ message: string }>(`/admin/moderators/${id}`, {
    method: "DELETE",
  });

export const resetModeratorPassword = (moderatorId: string, newPassword: string) =>
  request<{ message: string }>(`/admin/moderators/${moderatorId}/password`, {
    method: "PUT",
    body: JSON.stringify({ newPassword }),
  });
const withQuery = (path: string, params?: Record<string, unknown>) => {
  if (!params || Object.keys(params).length === 0) return path;
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });
  const qs = query.toString();
  return qs ? `${path}?${qs}` : path;
};

const api = {
  get: <T = unknown>(path: string, options?: { params?: Record<string, unknown>; responseType?: string }) =>
    request<T>(withQuery(path, options?.params)).then((data) => ({ data })),
  post: <T = unknown>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined }).then((data) => ({ data })),
  put: <T = unknown>(path: string, body?: unknown) =>
    request<T>(path, { method: "PUT", body: body ? JSON.stringify(body) : undefined }).then((data) => ({ data })),
  delete: <T = unknown>(path: string) =>
    request<T>(path, { method: "DELETE" }).then((data) => ({ data })),
};

export default api;
