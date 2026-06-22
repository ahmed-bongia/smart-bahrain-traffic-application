import { api } from "./api.service";
import type {
  AuthResponse,
  ForgotPasswordPayload,
  ForgotPasswordResponse,
  LoginPayload,
  ResetPasswordPayload,
  ResetPasswordResponse,
  RegisterPayload,
  User,
  VerifyOtpPayload,
  VerifyOtpResponse,
} from "@/src/types";

/**
 * Auth service - aligned with backend routes:
 *   POST /api/auth/login     -> { cpr, password }
 *   POST /api/auth/register  -> { cpr, name, phone, password }
 *   GET  /api/auth/me        -> User (requires Bearer token)
 *
 * Backend returns a flat AuthResponse (no nested `data` wrapper).
 */
export const authService = {
  login: (payload: LoginPayload) =>
    api.post<AuthResponse>("/auth/login", payload),

  register: (payload: RegisterPayload) =>
    api.post<AuthResponse>("/auth/register", payload),

  getMe: (token: string) => api.get<User>("/auth/me", token),

  forgotPassword: (payload: ForgotPasswordPayload) =>
    api.post<ForgotPasswordResponse>("/auth/forgot", payload),

  verifyOtp: (payload: VerifyOtpPayload) =>
    api.post<VerifyOtpResponse>("/auth/verify-otp", payload),

  resetPassword: (payload: ResetPasswordPayload) =>
    api.post<ResetPasswordResponse>("/auth/reset-password", payload),
};
