// import axios from "axios";
// import { z } from "zod";

// const api = axios.create({
//   baseURL: "http://localhost:8083",
//   headers: { "Content-Type": "application/json" },
// });

// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem("auth.token");
//   if (token && config.headers) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// // ============= SCHEMAS =============

// export const DayOfWeekEnum = z.enum([
//   "MONDAY",
//   "TUESDAY",
//   "WEDNESDAY",
//   "THURSDAY",
//   "FRIDAY",
//   "SATURDAY",
//   "SUNDAY",
// ]);

// export const ScheduleSchema = z.object({
//   id: z.number(),
//   clubId: z.number(),
//   facilityId: z.number(),
//   dayOfWeek: DayOfWeekEnum,
//   startTime: z.string(),
//   endTime: z.string(),
//   slotDuration: z.number(),
//   pricePerSlot: z.number(),
//   isActive: z.boolean(),
//   validFrom: z.string().nullable().optional(),
//   validUntil: z.string().nullable().optional(),
//   createdAt: z.string(),
//   updatedAt: z.string(),
// });

// export const CreateScheduleSchema = z.object({
//   clubId: z.number(),
//   facilityId: z.number(),
//   dayOfWeek: DayOfWeekEnum,
//   startTime: z.string().regex(/^\d{2}:\d{2}$/, "Format: HH:mm"),
//   endTime: z.string().regex(/^\d{2}:\d{2}$/, "Format: HH:mm"),
//   slotDuration: z.number().min(15).max(480),
//   pricePerSlot: z.number().positive("Price must be positive"),
//   validFrom: z.string().optional(),
//   validUntil: z.string().optional(),
// });

// export const TimeSlotSchema = z.object({
//   facilityId: z.number(),
//   startTime: z.string(),
//   endTime: z.string(),
//   price: z.number(),
//   duration: z.number(),
//   available: z.boolean(),
// });

// export type Schedule = z.infer<typeof ScheduleSchema>;
// export type CreateScheduleRequest = z.infer<typeof CreateScheduleSchema>;
// export type TimeSlot = z.infer<typeof TimeSlotSchema>;

// // ============= API FUNCTIONS =============

// /**
//  * Create a new schedule (Club Owner only)
//  */
// export const createSchedule = async (
//   data: CreateScheduleRequest
// ): Promise<Schedule> => {
//   console.log("Creating Schedule", data);
//   const response = await api.post("api/schedules", data);
//   console.log("Creating Schedule", response);
//   return ScheduleSchema.parse(response.data);
// };

// /**
//  * Update an existing schedule
//  */
// export const updateSchedule = async (
//   scheduleId: number,
//   data: Partial<CreateScheduleRequest>
// ): Promise<Schedule> => {
//   const response = await api.put(`/api/schedules/${scheduleId}`, data);
//   return ScheduleSchema.parse(response.data);
// };

// /**
//  * Delete a schedule
//  */
// export const deleteSchedule = async (scheduleId: number): Promise<void> => {
//   await api.delete(`/api/schedules/${scheduleId}`);
// };

// /**
//  * Get all schedules for a facility (Public)
//  */
// export const getFacilitySchedules = async (
//   facilityId: number
// ): Promise<Schedule[]> => {
//   const response = await api.get(`/api/schedules/facility/${facilityId}`);
//   return z.array(ScheduleSchema).parse(response.data);
// };

// /**
//  * Get all schedules for a club (Club Owner only)
//  */

// /**
//  * Activate a schedule
//  */
// export const activateSchedule = async (
//   scheduleId: number
// ): Promise<Schedule> => {
//   const response = await api.post(`/api/schedules/${scheduleId}/activate`);
//   return ScheduleSchema.parse(response.data);
// };

// /**
//  * Deactivate a schedule
//  */
// export const deactivateSchedule = async (
//   scheduleId: number
// ): Promise<Schedule> => {
//   const response = await api.post(`/api/schedules/${scheduleId}/deactivate`);
//   return ScheduleSchema.parse(response.data);
// };

// export default api;
