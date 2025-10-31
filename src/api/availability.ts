import axios from "axios";
import { z } from "zod";
// import { TimeSlotSchema } from "./schedule";

const api = axios.create({
  baseURL: "http://localhost:8083",
  headers: { "Content-Type": "application/json" },
});

// ============= SCHEMAS =============

export const AvailabilityUpdateSchema = z.object({
  eventType: z.string(),
  facilityId: z.number(),
  startTime: z.string(),
  message: z.string(),
  timestamp: z.string(),
});

export type AvailabilityUpdate = z.infer<typeof AvailabilityUpdateSchema>;

// ============= API FUNCTIONS =============

/**
 * Get available slots for a facility on a specific date
 */
export const getAvailableSlots = async (
  facilityId: number,
  date: string // Format: YYYY-MM-DD
) => {
  const response = await api.get(`/api/availability/facility/${facilityId}`, {
    params: { date },
  });

  return z.array(TimeSlotSchema).parse(response.data);
};

/**
 * Subscribe to real-time availability updates via SSE
 */
export const subscribeToAvailability = (
  facilityId: number,
  date: string,
  onUpdate: (update: AvailabilityUpdate) => void,
  onError?: (error: Event) => void
) => {
  const eventSource = new EventSource(
    `http://localhost:8081/api/availability/facility/${facilityId}/stream?date=${date}`
  );

  eventSource.addEventListener("availability-changed", (event) => {
    const update = AvailabilityUpdateSchema.parse(JSON.parse(event.data));
    onUpdate(update);
  });

  eventSource.onerror = (error) => {
    console.error("SSE connection error:", error);
    if (onError) onError(error);
  };

  return eventSource;
};

export default api;
