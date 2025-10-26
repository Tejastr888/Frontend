export const FACILITY_TYPES = [
  { value: "FIELD", label: "Field (Football, Cricket)" },
  { value: "COURT", label: "Court (Tennis, Badminton, Basketball)" },
  { value: "POOL", label: "Pool (Swimming)" },
  { value: "ARENA", label: "Arena (Multi-purpose indoor)" },
  { value: "ROOM", label: "Room (Gym, Yoga studio)" },
  { value: "TRACK", label: "Track (Running)" },
  { value: "OTHER", label: "Other" },
];

export const AMENITY_TYPES = [
  "CHANGING_ROOM",
  "SHOWER",
  "LOCKER",
  "PARKING",
  "LIGHTING",
  "SEATING",
  "SCOREBOARD",
  "WATER_FOUNTAIN",
  "FIRST_AID",
  "WIFI",
  "CAFETERIA",
  "PRO_SHOP",
  "OTHER",
];

export const DAYS_OF_WEEK = [
  { value: "MONDAY", label: "Monday" },
  { value: "TUESDAY", label: "Tuesday" },
  { value: "WEDNESDAY", label: "Wednesday" },
  { value: "THURSDAY", label: "Thursday" },
  { value: "FRIDAY", label: "Friday" },
  { value: "SATURDAY", label: "Saturday" },
  { value: "SUNDAY", label: "Sunday" },
];

export const BOOKING_STATUS_COLORS = {
  RESERVED: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  COMPLETED: "bg-blue-100 text-blue-800",
  NO_SHOW: "bg-gray-100 text-gray-800",
};

export const BOOKING_STATUS_LABELS = {
  RESERVED: "Reserved",
  CONFIRMED: "Confirmed",
  CANCELLED: "Cancelled",
  COMPLETED: "Completed",
  NO_SHOW: "No Show",
};
