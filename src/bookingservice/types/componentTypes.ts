export interface Slot {
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
  slot: Slot | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (slotId: number, numberOfPeople: number) => Promise<void>;
}
