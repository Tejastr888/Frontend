/**
 * TypeScript types matching your GraphQL schema
 */

export interface UserProfile {
  id: string;
  userId: string;
  bio?: string;
  avatarUrl?: string;
  dateOfBirth?: string;
  gender?: string;
  city?: string;
  state?: string;
  country?: string;
  homeLat?: number;
  homeLng?: number;
  skillLevel?: string;
  preferredTimeSlots?: string[];
  isProfessional: boolean;
  yearsOfExperience?: number;
  achievements?: string[];
  profileVisibility: string;
  showStats: boolean;
  createdAt: string;
  updatedAt: string;
  favoriteSports?: FavoriteSport[];
  socialLinks?: SocialLink[];
  stats?: UserStats;
  currentLocation?: Location;
}

export interface FavoriteSport {
  id: string;
  sportId: string;
  addedAt: string;
}

export interface SocialLink {
  id: string;
  platform: string;
  username: string;
  profileUrl: string;
  isVerified: boolean;
}

export interface UserStats {
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalHoursPlayed: number;
  totalSpent: number;
  averageBookingPrice: number;
  currentStreakDays: number;
  longestStreakDays: number;
}

export interface Location {
  lat: number;
  lng: number;
  recordedAt: string;
}

/**
 * Input types for mutations
 */
export interface CreateProfileInput {
  bio?: string;
  avatarUrl?: string;
  dateOfBirth?: string;
  gender?: string;
  city?: string;
  state?: string;
  country?: string;
  skillLevel?: string;
  preferredTimeSlots?: string[];
  isProfessional?: boolean;
  yearsOfExperience?: number;
  achievements?: string[];
  profileVisibility?: string;
  showStats?: boolean;
}

export interface UpdateProfileInput {
  bio?: string;
  avatarUrl?: string;
  city?: string;
  state?: string;
  country?: string;
  skillLevel?: string;
  preferredTimeSlots?: string[];
  isProfessional?: boolean;
  yearsOfExperience?: number;
  achievements?: string[];
  profileVisibility?: string;
  showStats?: boolean;
}
