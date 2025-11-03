import {
  BookingStatus,
  PaymentStatus,
  SlotGenerationMode,
} from "../enums/enums";

export interface AvailableSlot {
  slotId: number;
  facilityId: number;
  facilityName?: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: string;
  maxCapacity: number;
  availableSpots: number;
  bookedCount: number;
  isFull: boolean;
  price: number;
  isBookable: boolean;
  unavailableReason?: string;
}

export interface CreateBookingRequest {
  slotId: number;
  numberOfPeople: number;
  idempotencyKey?: string;
}

export interface ConfirmBookingRequest {
  paymentTransactionId: string;
  paymentMethod?: string;
}

export interface CancelBookingRequest {
  reason?: string;
}

export interface BookingResponse {
  id: number;
  idempotencyKey: string;
  slotId: number;
  userId: number;
  facilityId: number;
  clubId: number;
  numberOfPeople: number;
  slotDate: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  platformFee: number;
  amountPaid?: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  reservedUntil?: string;
  isExpired?: boolean;
  canBeCancelled?: boolean;
  canBeConfirmed?: boolean;
  minutesUntilExpiry?: number;
  cancelledAt?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateScheduleRequest {
  clubId: number;
  facilityId: number;
  maxParticipantsPerSlot: number;
  operatingStartTime: string;
  operatingEndTime: string;
  slotDurationMinutes: number;
  breakBetweenSlotsMinutes: number;
  generationMode: SlotGenerationMode;
  slotsPerDay?: number;
  pricePerSlot: number;
  validFrom: string;
  validUntil: string;
  description?: string;
  slots?: CreateSlotDto[];
}

export interface CreateSlotDto {
  slotDate: string;
  startTime: string;
  endTime: string;
  maxCapacity?: number;
  price?: number;
}

export interface ScheduleResponse {
  slots: any;
  id: number;
  version: number;
  clubId: number;
  facilityId: number;
  maxParticipantsPerSlot: number;
  operatingStartTime: string;
  operatingEndTime: string;
  slotDurationMinutes: number;
  breakBetweenSlotsMinutes: number;
  generationMode: SlotGenerationMode;
  slotsPerDay?: number;
  pricePerSlot: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
  totalSlotsGenerated?: number;
  isCurrentlyValid?: boolean;
}

/**
 * Represents a single time slot managed by a schedule, containing
 * booking status and pricing information.
 */
export interface Slot {
  id: number;
  slotId?: number; // Corresponds to SlotResponse.id
  facilityId: number;
  facilityName?: string; // Often denormalized or looked up in the UI
  date: string; // Corresponds to SlotResponse.slotDate (e.g., "2025-10-31")
  startTime: string; // Corresponds to SlotResponse.startTime (e.g., "09:00:00")
  endTime: string; // Corresponds to SlotResponse.endTime (e.g., "10:00:00")
  duration: string; // Calculated or derived, often 'HH:mm' or simplified duration string
  maxCapacity: number; // Corresponds to SlotResponse.maxCapacity
  availableSpots: number; // Corresponds to SlotResponse.availableCapacity
  bookedCount: number; // Corresponds to SlotResponse.currentBookings
  isFull: boolean; // Corresponds to SlotResponse.isFull
  price: number; // Corresponds to SlotResponse.price (BigDecimal in Java, converted to number/string)
  isActive: boolean;
  isBookable: boolean; // Corresponds to SlotResponse.isBookable
  unavailableReason?: string; // Optional field for user-friendly explanation (e.g., "Fully booked", "Schedule Inactive")
}

export interface FailedUpdate {
  slotId: number;
  message: string;
}
export interface SlotUpdateRequest {
  slotId: number;
  startTime?: string;
  endTime?: string;
  maxCapacity?: number;
  price?: number;
  isActive?: boolean;
}

export interface BulkUpdateResponse {
  successfulUpdates: Slot[];
  failedUpdates: FailedUpdate[];
}
