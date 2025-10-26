import axios from "axios";
import { z } from "zod";
import { FacilityTypeEnum } from "@/enums/enums";
import { SportOptionSchema } from "./club";

const api = axios.create({
  baseURL: "http://localhost:8082",
  headers: { "Content-Type": "application/json" },
});

// Schema for public facility listing
export const PublicFacilitySchema = z.object({
  id: z.number(),
  clubId: z.number(),
  clubName: z.string().optional(),
  name: z.string(),
  primarySport: z.string(),
  facilityType: FacilityTypeEnum,
  capacity: z.number(),
  description: z.string().nullable().optional(),
  location: z.string().optional(),
  isActive: z.boolean(),
  supportedSports: z.array(SportOptionSchema).optional(),
  amenities: z
    .array(
      z.object({
        id: z.number(),
        type: z.string(),
        additionalCost: z.number(),
      })
    )
    .optional(),
});

export type PublicFacility = z.infer<typeof PublicFacilitySchema>;

/**
 * Get all active public facilities (no auth required)
 */
export const getAllPublicFacilities = async (): Promise<PublicFacility[]> => {
  const response = await api.get("/api/public/facilities");
  return z.array(PublicFacilitySchema).parse(response.data);
};

/**
 * Get facility by ID (public view)
 */
export const getFacilityById = async (
  facilityId: number
): Promise<PublicFacility> => {
  const response = await api.get(`/api/public/facilities/${facilityId}`);
  return PublicFacilitySchema.parse(response.data);
};

export default api;
