import { Config } from "@/src/constants/Config";
import { api } from "./api.service";
import type { Report, CreateReportPayload } from "@/src/types";

export interface MediaFile {
  uri: string;
  type: string; // e.g. "image/jpeg", "video/mp4"
  name: string;
}

/**
 * Report service - aligned with backend routes:
 *   GET  /api/reports       -> Report[]  (my reports, newest first)
 *   POST /api/reports       -> Report    (multipart/form-data with description + coords)
 *   GET  /api/reports/:id   -> Report
 */
export const reportService = {
  /** Fetch all reports belonging to the logged-in user */
  getMyReports: (token: string) => api.get<Report[]>("/reports", token),

  /** Fetch a single report by ID */
  getById: (token: string, id: string) =>
    api.get<Report>(`/reports/${id}`, token),

  /**
   * Submit a new report with optional media attachments.
   * Sends multipart/form-data so the backend can upload files to Cloudinary.
   */
  create: async (
    token: string,
    payload: CreateReportPayload,
    media: MediaFile[] = [],
  ): Promise<Report> => {
    const form = new FormData();
    form.append("description", payload.description);
    form.append("category", payload.category);
    form.append("latitude", String(payload.latitude));
    form.append("longitude", String(payload.longitude));

    media.forEach((file) => {
      // React Native FormData accepts { uri, type, name }
      form.append("media", {
        uri: file.uri,
        type: file.type,
        name: file.name,
      } as unknown as Blob);
    });

    const response = await fetch(`${Config.API_BASE_URL}/reports`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        // Do NOT set Content-Type - fetch sets it with the boundary automatically
      },
      body: form,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(
        err.message || `Request failed with status ${response.status}`,
      );
    }

    return response.json();
  },
};
