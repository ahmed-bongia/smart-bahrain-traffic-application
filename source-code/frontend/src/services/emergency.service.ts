import { api } from "./api.service";
import type {
  EmergencyProfilePublicResponse,
  EmergencyProfileResponse,
  EmergencyContact,
} from "@/src/types";

export const emergencyService = {
  getMyEmergencyProfile: (token: string) =>
    api.get<EmergencyProfileResponse>("/emergency/me", token),

  updateMyEmergencyProfile: (
    token: string,
    emergencyContacts: EmergencyContact[],
  ) =>
    api.put<EmergencyProfileResponse>(
      "/emergency/me",
      { emergencyContacts },
      token,
    ),

  getPublicEmergencyProfile: (token: string) =>
    api.get<EmergencyProfilePublicResponse>(`/emergency/public/${token}`),
};
