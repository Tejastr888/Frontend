import axios from "axios";
import {z} from "zod";


const api = axios.create({
  baseURL: "http://localhost:8080",
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

export const AddressSchema = z.object({
  id: z.number().optional(),
  street: z.string(),
  area: z.string().nullable().optional(),
  city: z.string(),
  state: z.string(),
  country: z.string(),
  pincode: z.string().nullable().optional(),
  postalCode: z.string().nullable().optional(),
  googleMapsLink: z.string().nullable().optional(),
});


export const SportOptionSchema = z.object({
  id: z.number(),
  name: z.string(),
  category: z.string(),
});


export const ClubSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  location: z.string(),
  contact: z.string(),
  description: z.string().nullable().optional(),
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]),
  ownerUserId: z.number(),
  address: AddressSchema.optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  sportsOffered: z.array(z.number()).min(1, "Please select at least one sport"),
});


export const SportSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().optional(),
  pricePerHour: z.number(),
  category: z.string(),
  capacity: z.number(),
  facilities: z.string().optional(),
  availability: z.string(),
  isActive: z.boolean(),
  clubId: z.number(),
  clubName: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});


export const CreateClubSchema = z.object({
  name: z.string().min(2, "Club name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  location: z.string().min(2, "Location is required"),
  contact: z.string().min(10, "Contact number must be at least 10 digits"),
  description: z.string().optional(),
  street: z.string().min(5, "Street address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  country: z.string().min(2, "Country is required"),
  postalCode: z.string().min(4, "Postal code is required"),
  sportsOffered: z.array(z.number()).min(1, "Please select at least one sport"),
});



export const CreateSportSchema = z.object({
  name: z.string().min(2, "Sport name is required"),
  description: z.string().optional(),
  pricePerHour: z.number().positive("Price must be positive"),
  category: z.string().min(1, "Category is required"),
  capacity: z.number().positive("Capacity must be positive"),
  facilities: z.string().optional(),
  availability: z.string().min(1, "Availability is required"),
  isActive: z.boolean().default(true),
});

export type Club = z.infer<typeof ClubSchema>;
export type Sport = z.infer<typeof SportSchema>;
export type CreateClubRequest = z.infer<typeof CreateClubSchema>;
export type CreateSportRequest = z.infer<typeof CreateSportSchema>;
export type SportOption = z.infer<typeof SportOptionSchema>;



// ============= API FUNCTIONS =============

// Club Management
export const getMyClub = async (): Promise<Club | null> => {
  try {
    const response = await api.get("/api/clubs/my-club");
    console.log("hellooooooo",response)
    const club=ClubSchema.parse(response.data);
    // club.status = "APPROVED";
    return club;
  } catch (error: any) {
    if (error.response?.status === 404) return null;
    throw error;
  }
};


export const createClub = async (data: CreateClubRequest): Promise<Club> => {
  console.log("heloooooo", data);
  const response = await api.post("/api/clubs", data);
  console.log("heloooooo",data);
  return ClubSchema.parse(response.data);
};



export const updateMyClub = async (
  data: Partial<CreateClubRequest>
): Promise<Club> => {
  const response = await api.put("/api/clubs/my-club", data);
  return ClubSchema.parse(response.data);
};

export const deleteMyClub = async (): Promise<void> => {
  await api.delete("/api/clubs/my-club");
};

// Sports Management
export const getMyClubSports = async (): Promise<Sport[]> => {
  const response = await api.get("/api/clubs/my-club/sports");
  return z.array(SportSchema).parse(response.data);
};

export const addSportToMyClub = async (
  data: CreateSportRequest
): Promise<Sport> => {
  const response = await api.post("/api/clubs/my-club/sports", data);
  return SportSchema.parse(response.data);
};

export const updateMyClubSport = async (
  id: number,
  data: Partial<CreateSportRequest>
): Promise<Sport> => {
  const response = await api.put(`/api/clubs/my-club/sports/${id}`, data);
  return SportSchema.parse(response.data);
};

export const removeMyClubSport = async (id: number): Promise<void> => {
  await api.delete(`/api/clubs/my-club/sports/${id}`);
};

// Get all available sports (for dropdown)
export const getAllSportsOptions = async (): Promise<SportOption[]> => {
  const response = await api.get(`/api/sports`);
  return z.array(SportOptionSchema).parse(response.data);
};


// Get sports by category
export const getSportsByCategory = async (category: string): Promise<SportOption[]> => {
  const response = await api.get(`/api/sports/category/${category}`);
  return z.array(SportOptionSchema).parse(response.data);
};

export default api;