import { SlotGenerationMode } from "../enums/enums";
import { Slot } from "./types";

// export interface Slot {
//   slotId: number;
//   facilityId: number;
//   facilityName?: string;
//   date: string;
//   startTime: string;
//   endTime: string;
//   duration: string;
//   maxCapacity: number;
//   availableSpots: number;
//   bookedCount: number;
//   isFull: boolean;
//   price: number;
//   isActive: boolean;
//   isBookable: boolean;
//   unavailableReason?: string;
// }

export interface SlotCardProps {
  slot: Slot;
  mode: "view" | "book" | "edit";
  onBook?: (slot: Slot) => void;
  onEdit?: (slot: Slot) => void;
  selected?: boolean;
}

export interface SlotGridProps {
  slots: Slot[];
  mode: "view" | "book" | "edit";
  onSlotSelect?: (slot: Slot) => void;
  selectedSlotId?: number;
  loading?: boolean;
}

export interface BookingModalProps {
  slot: any | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (slotId: number, numberOfPeople: number) => Promise<any>;
}

export interface CreateScheduleFormData {
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
  slots?: ManualSlot[];
}

export interface ManualSlot {
  slotDate: string;
  startTime: string;
  endTime: string;
  maxCapacity?: number;
  price?: number;
}

export interface Schedule {
  id: number;
  facilityId: number;
  facilityName?: string;
  maxParticipantsPerSlot: number;
  operatingStartTime: string;
  operatingEndTime: string;
  slotDurationMinutes: number;
  breakBetweenSlotsMinutes: number;
  generationMode: "AUTO" | "MANUAL";
  slotsPerDay?: number;
  pricePerSlot: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  description?: string;
  totalSlotsGenerated?: number;
  createdAt: string;
}
