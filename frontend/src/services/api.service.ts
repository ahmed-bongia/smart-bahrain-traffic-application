import { Config } from "@/src/constants/Config";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
  token?: string | null;
}

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = Config.API_BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {},
  ): Promise<T> {
    const { method = "GET", body, headers = {}, token } = options;

    const config: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    };

    if (body && method !== "GET") {
      config.body = JSON.stringify(body);
    }

    // Add timeout to prevent hanging indefinitely
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...config,
        signal: controller.signal,
      });

      if (!response.ok) {
        clearTimeout(timeoutId);
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.message || `Request failed with status ${response.status}`,
          response.status,
        );
      }

      const data = await response.json();
      clearTimeout(timeoutId);
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      // Handle network errors and other fetch errors
      if (error instanceof ApiError) {
        throw error;
      }
      
      const message = error instanceof Error 
        ? error.message 
        : "Network request failed";
      
      const isTimeout =
        error instanceof Error && error.name === "AbortError";
      const isNetworkError = message.includes("Failed to fetch");

      throw new ApiError(
        isTimeout
          ? `The request to ${this.baseUrl} timed out. Check that the backend is running and your device is on the same Wi-Fi network.`
          : isNetworkError
            ? `Cannot reach API server at ${this.baseUrl}. Check that the backend is running and your device is on the same Wi-Fi network.`
            : message,
        0,
      );
    }
  }

  async get<T>(endpoint: string, token?: string | null): Promise<T> {
    return this.request<T>(endpoint, { method: "GET", token });
  }

  async post<T>(
    endpoint: string,
    body: unknown,
    token?: string | null,
  ): Promise<T> {
    return this.request<T>(endpoint, { method: "POST", body, token });
  }

  async put<T>(
    endpoint: string,
    body: unknown,
    token?: string | null,
  ): Promise<T> {
    return this.request<T>(endpoint, { method: "PUT", body, token });
  }

  async patch<T>(
    endpoint: string,
    body: unknown,
    token?: string | null,
  ): Promise<T> {
    return this.request<T>(endpoint, { method: "PATCH", body, token });
  }

  async delete<T>(endpoint: string, token?: string | null): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE", token });
  }
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export const api = new ApiService();
