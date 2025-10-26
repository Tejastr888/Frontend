import axios from "axios";
import { z } from "zod";

const api = axios.create({
  baseURL: "http://localhost:8084",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth.token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ============= SCHEMAS =============

export const GenderEnum = z.enum([
  "MALE",
  "FEMALE",
  "OTHER",
  "PREFER_NOT_TO_SAY",
]);
export const SkillLevelEnum = z.enum([
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
  "PROFESSIONAL",
]);
export const ProfileVisibilityEnum = z.enum([
  "PUBLIC",
  "FRIENDS_ONLY",
  "PRIVATE",
]);
export const SocialPlatformEnum = z.enum([
  "INSTAGRAM",
  "TWITTER",
  "FACEBOOK",
  "LINKEDIN",
  "YOUTUBE",
  "TIKTOK",
]);

export const UserStatsSchema = z.object({
  id: z.number(),
  userId: z.number(),
  totalBookings: z.number(),
  completedBookings: z.number(),
  cancelledBookings: z.number(),
  totalHoursPlayed: z.number(),
  totalSpent: z.number(),
  averageBookingPrice: z.number(),
  currentStreakDays: z.number(),
  longestStreakDays: z.number(),
  preferredBookingTime: z.string().nullable().optional(),
});

export const SocialLinkSchema = z.object({
  id: z.number(),
  platform: z.string(),
  username: z.string(),
  profileUrl: z.string(),
  isVerified: z.boolean(),
});

export const UserProfileSchema = z.object({
  id: z.number(),
  userId: z.number(),
  bio: z.string().nullable().optional(),
  avatarUrl: z.string().nullable().optional(),
  dateOfBirth: z.string().nullable().optional(),
  gender: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  favoriteSports: z.array(z.string()).optional(),
  skillLevel: z.string().nullable().optional(),
  isProfessional: z.boolean().optional(),
  profileVisibility: z.string(),
  socialLinks: z.array(SocialLinkSchema).optional(),
  stats: UserStatsSchema.nullable().optional(),
});

export const CreateProfileSchema = z.object({
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: GenderEnum.optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  favoriteSports: z.array(z.string()).optional(),
  skillLevel: SkillLevelEnum.optional(),
});

export const UpdateProfileSchema = z.object({
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().optional(),
  city: z.string().optional(),
  favoriteSports: z.array(z.string()).optional(),
  profileVisibility: ProfileVisibilityEnum.optional(),
});

export const AddSocialLinkSchema = z.object({
  platform: SocialPlatformEnum,
  username: z.string().min(1),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;
export type CreateProfileRequest = z.infer<typeof CreateProfileSchema>;
export type UpdateProfileRequest = z.infer<typeof UpdateProfileSchema>;
export type AddSocialLinkRequest = z.infer<typeof AddSocialLinkSchema>;
export type SocialLink = z.infer<typeof SocialLinkSchema>;
export type UserStats = z.infer<typeof UserStatsSchema>;

// ============= API FUNCTIONS =============

/**
 * Create user profile
 */
export const createUserProfile = async (
  data: CreateProfileRequest
): Promise<UserProfile> => {
  const response = await api.post("/api/profiles", data);
  return UserProfileSchema.parse(response.data);
};

/**
 * Get current user's profile
 */
export const getMyProfile = async (): Promise<UserProfile> => {
  const response = await api.get("/api/profiles/me");
  return UserProfileSchema.parse(response.data);
};

/**
 * Get user profile by ID (public)
 */
export const getUserProfile = async (userId: number): Promise<UserProfile> => {
  const response = await api.get(`/api/profiles/user/${userId}`);
  return UserProfileSchema.parse(response.data);
};

/**
 * Update user profile
 */
export const updateUserProfile = async (
  data: UpdateProfileRequest
): Promise<UserProfile> => {
  const response = await api.put("/api/profiles/me", data);
  return UserProfileSchema.parse(response.data);
};

/**
 * Add social link
 */
export const addSocialLink = async (
  data: AddSocialLinkRequest
): Promise<void> => {
  await api.post("/api/profiles/me/social-links", data);
};

/**
 * Get user's social links
 */
export const getMySocialLinks = async (): Promise<SocialLink[]> => {
  const response = await api.get("/api/profiles/me/social-links");
  return z.array(SocialLinkSchema).parse(response.data);
};

/**
 * Remove social link
 */
export const removeSocialLink = async (linkId: number): Promise<void> => {
  await api.delete(`/api/profiles/me/social-links/${linkId}`);
};

export default api;
