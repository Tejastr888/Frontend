import axios from "axios";
import { z } from "zod";
import { AmenityTypeEnum, FacilityTypeEnum } from "@/enums/enums";
import { CLUB_SERVICE_URL, SportOptionSchema } from "./club";

const api = axios.create({
  baseURL: CLUB_SERVICE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth.token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const CreateAmenitySchema = z.object({
  type: AmenityTypeEnum,
  name: z.string().optional(),
  description: z.string().max(500).optional(),
  isAvailable: z.boolean().default(true),
  additionalCost: z.number().min(0, "Cost cannot be negative").default(0),
});

export const AmenitySchema = z.object({
  id: z.number(),
  facilityId: z.number(),
  type: AmenityTypeEnum,
  name: z.string().optional(),
  description: z.string().max(500).optional(),
  isAvailable: z.boolean().default(true),
  additionalCost: z.number().min(0, "Cost cannot be negative").default(0),
});

export const CreateFacilitySchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(255),
  primarySport: z.string().optional(),
  facilityType: FacilityTypeEnum,
  description: z.string().max(1000).optional(),
  capacity: z.number().min(1, "Capacity must be at least 1"),
  amenities: z.array(CreateAmenitySchema).default([]).optional(),
  supportedSports: z.array(z.number()).default([]),
});

const FacilitySchema = z.object({
  id: z.number(),
  clubId: z.number(),
  name: z.string(),
  primarySport: z.string(),
  facilityType: FacilityTypeEnum,
  capacity: z.number(),
  description: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
  supportedSports: z.array(SportOptionSchema).default([]).optional(),
  amenities: z.array(AmenitySchema).default([]).optional(),
});

export type CreateFacilityReq = z.infer<typeof CreateFacilitySchema>;
export type Facility = z.infer<typeof FacilitySchema>;

export const createFacility = async (
  clubId: number,
  data: CreateFacilityReq
): Promise<Facility> => {
  console.log("Creating facility for club:", clubId, data);

  const response = await api.post(`/api/clubs/${clubId}/facilities`, data);

  console.log("Facility created:", response.data);
  return FacilitySchema.parse(response.data);
};

export const getAllFacilities = async (clubId: number): Promise<Facility[]> => {
  console.log("get all facilities", clubId);
  const response = await api.get(`/api/clubs/${clubId}/facilities`);
  console.log("list of all facilities", response.data);

  // Parse the array of facilities using z.array()
  return z.array(FacilitySchema).parse(response.data);
};

// Additional utility functions you might find helpful
export const getFacilityById = async (
  clubId: number,
  facilityId: number
): Promise<Facility> => {
  console.log("Getting facility:", facilityId, "for club:", clubId);
  const response = await api.get(
    `/api/clubs/${clubId}/facilities/${facilityId}`
  );
  return FacilitySchema.parse(response.data);
};

export const updateFacility = async (
  clubId: number,
  facilityId: number,
  data: Partial<CreateFacilityReq>
): Promise<Facility> => {
  console.log("Updating facility:", facilityId, "for club:", clubId, data);
  const response = await api.put(
    `/api/clubs/${clubId}/facilities/${facilityId}`,
    data
  );
  return FacilitySchema.parse(response.data);
};

export const deleteFacility = async (
  clubId: number,
  facilityId: number,
  hardDelete: boolean = false
): Promise<void> => {
  console.log(
    "Deleting facility:",
    facilityId,
    "for club:",
    clubId,
    "hardDelete:",
    hardDelete
  );
  await api.delete(`/api/clubs/${clubId}/facilities/${facilityId}`, {
    params: { hardDelete },
  });
};

export default api;
