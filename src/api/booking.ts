import axios from "axios";
import { z } from "zod";

const api = axios.create({
  baseURL: "http://localhost:8083",
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

export const BookingStatusEnum = z.enum([
  "RESERVED",
  "CONFIRMED",
  "CANCELLED",
  "COMPLETED",
  "NO_SHOW",
]);

export const BookingSchema = z.object({
  id: z.number(),
  userId: z.number(),
  clubId: z.number(),
  facilityId: z.number(),
  startTime: z.string(),
  endTime: z.string(),
  status: BookingStatusEnum,
  reservedUntil: z.string().nullable().optional(),
  totalPrice: z.number(),
  platformFee: z.number().optional(),
  createdAt: z.string(),
});

export const CreateBookingSchema = z.object({
  userId: z.number(),
  clubId: z.number(),
  facilityId: z.number(),
  startTime: z.string(),
  endTime: z.string(),
  totalPrice: z.number(),
});

export const PaymentConfirmationSchema = z.object({
  transactionId: z.string().min(1, "Transaction ID is required"),
  amount: z.number().positive("Amount must be positive"),
  paymentMethod: z.string().optional(),
});

export type Booking = z.infer<typeof BookingSchema>;
export type CreateBookingRequest = z.infer<typeof CreateBookingSchema>;
export type PaymentConfirmation = z.infer<typeof PaymentConfirmationSchema>;

// ============= API FUNCTIONS =============

/**
 * Reserve a slot (temporary hold for 10 minutes)
 */
export const reserveSlot = async (
  data: CreateBookingRequest
): Promise<Booking> => {
  const idempotencyKey = `booking-${Date.now()}-${Math.random()}`;

  const response = await api.post("/api/bookings/reserve", data, {
    headers: {
      "Idempotency-Key": idempotencyKey,
    },
  });

  return BookingSchema.parse(response.data);
};

/**
 * Confirm a reserved booking after payment
 */
export const confirmBooking = async (
  bookingId: number,
  payment: PaymentConfirmation
): Promise<Booking> => {
  const response = await api.post(
    `/api/bookings/${bookingId}/confirm`,
    payment
  );

  return BookingSchema.parse(response.data);
};

/**
 * Cancel a booking
 */
export const cancelBooking = async (
  bookingId: number,
  userId: number,
  reason?: string
): Promise<Booking> => {
  const response = await api.delete(`/api/bookings/${bookingId}`, {
    params: { userId, reason },
  });

  return BookingSchema.parse(response.data);
};

/**
 * Get all bookings for a user
 */
export const getUserBookings = async (userId: number): Promise<Booking[]> => {
  const response = await api.get(`/api/bookings/user/${userId}`);
  return z.array(BookingSchema).parse(response.data);
};

/**
 * Get booking by ID
 */
export const getBookingById = async (bookingId: number): Promise<Booking> => {
  const response = await api.get(`/api/bookings/${bookingId}`);
  return BookingSchema.parse(response.data);
};

export default api;
