import { BookingStatus, PaymentStatus, SlotGenerationMode } from "../enums/enums";

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
