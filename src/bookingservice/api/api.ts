// import { BookingStatus } from "../enums/enums";
// import {
//   AvailableSlot,
//   BookingResponse,
//   CancelBookingRequest,
//   ConfirmBookingRequest,
//   CreateBookingRequest,
//   CreateScheduleRequest,
//   ScheduleResponse,
// } from "../types/types";

// // const API_BASE_URL =
// //   import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

// const API_BASE_URL = "http://localhost:8083";

// class BookingApi {
//   private getAuthHeaders(): HeadersInit {
//     const token = localStorage.getItem("authToken");
//     return {
//       "Content-Type": "application/json",
//       ...(token ? { Authorization: `Bearer ${token}` } : {}),
//     };
//   }

//   private async handleResponse<T>(response: Response): Promise<T> {
//     if (!response.ok) {
//       const error = await response.json().catch(() => ({
//         message: response.statusText,
//       }));
//       throw new Error(error.message || "API request failed");
//     }
//     return response.json();
//   }

//   async getAvailableSlots(
//     facilityId: number,
//     date: string
//   ): Promise<AvailableSlot[]> {
//     const response = await fetch(
//       `${API_BASE_URL}/api/v1/bookings/availability/${facilityId}?date=${date}`,
//       {
//         headers: this.getAuthHeaders(),
//       }
//     );
//     return this.handleResponse(response);
//   }

//   async getAvailableSlotsInRange(
//     facilityId: number,
//     startDate: string,
//     endDate: string
//   ): Promise<AvailableSlot[]> {
//     const response = await fetch(
//       `${API_BASE_URL}/api/v1/bookings/availability/${facilityId}/range?startDate=${startDate}&endDate=${endDate}`,
//       {
//         headers: this.getAuthHeaders(),
//       }
//     );
//     return this.handleResponse(response);
//   }

//   async getBookableSlots(
//     facilityId: number,
//     date: string
//   ): Promise<AvailableSlot[]> {
//     const response = await fetch(
//       `${API_BASE_URL}/api/v1/bookings/availability/${facilityId}/bookable?date=${date}`,
//       {
//         headers: this.getAuthHeaders(),
//       }
//     );
//     return this.handleResponse(response);
//   }

//   async reserveSlot(request: CreateBookingRequest): Promise<BookingResponse> {
//     const response = await fetch(`${API_BASE_URL}/api/v1/bookings/reserve`, {
//       method: "POST",
//       headers: this.getAuthHeaders(),
//       body: JSON.stringify(request),
//     });
//     return this.handleResponse(response);
//   }

//   async confirmBooking(
//     bookingId: number,
//     request: ConfirmBookingRequest
//   ): Promise<BookingResponse> {
//     const response = await fetch(
//       `${API_BASE_URL}/api/v1/bookings/${bookingId}/confirm`,
//       {
//         method: "POST",
//         headers: this.getAuthHeaders(),
//         body: JSON.stringify(request),
//       }
//     );
//     return this.handleResponse(response);
//   }

//   async cancelBooking(
//     bookingId: number,
//     request: CancelBookingRequest
//   ): Promise<BookingResponse> {
//     const response = await fetch(
//       `${API_BASE_URL}/api/v1/bookings/${bookingId}/cancel`,
//       {
//         method: "POST",
//         headers: this.getAuthHeaders(),
//         body: JSON.stringify(request),
//       }
//     );
//     return this.handleResponse(response);
//   }
//   async getMyBookings(status?: BookingStatus): Promise<BookingResponse[]> {
//     const url = status
//       ? `${API_BASE_URL}/api/v1/bookings/my-bookings?status=${status}`
//       : `${API_BASE_URL}/api/v1/bookings/my-bookings`;

//     const response = await fetch(url, {
//       headers: this.getAuthHeaders(),
//     });
//     return this.handleResponse(response);
//   }

//   async getBookingById(bookingId: number): Promise<BookingResponse> {
//     const response = await fetch(
//       `${API_BASE_URL}/api/v1/bookings/${bookingId}`,
//       {
//         headers: this.getAuthHeaders(),
//       }
//     );
//     return this.handleResponse(response);
//   }

//   // ===== SCHEDULES (Admin) =====

//   async createSchedule(
//     request: CreateScheduleRequest
//   ): Promise<ScheduleResponse> {
//     const response = await fetch(`${API_BASE_URL}/api/schedules`, {
//       method: "POST",
//       headers: this.getAuthHeaders(),
//       body: JSON.stringify(request),
//     });
//     return this.handleResponse(response);
//   }

//   async getScheduleById(scheduleId: number): Promise<ScheduleResponse> {
//     const response = await fetch(
//       `${API_BASE_URL}/api/schedules/${scheduleId}`,
//       {
//         headers: this.getAuthHeaders(),
//       }
//     );
//     return this.handleResponse(response);
//   }

//   async getFacilitySchedules(facilityId: number): Promise<ScheduleResponse[]> {
//     const response = await fetch(
//       `${API_BASE_URL}/api/schedules/facility/${facilityId}`,
//       {
//         headers: this.getAuthHeaders(),
//       }
//     );
//     return this.handleResponse(response);
//   }
// }

// export const bookingApi = new BookingApi();

import axios, { AxiosInstance } from "axios";
import { BookingStatus } from "../enums/enums";
import {
  AvailableSlot,
  BookingResponse,
  CancelBookingRequest,
  ConfirmBookingRequest,
  CreateBookingRequest,
  CreateScheduleRequest,
  ScheduleResponse,
} from "../types/types";
import { Schedule } from "@/bookingservice/types/componentTypes"; // Assuming Schedule is a similar type to ScheduleResponse

// Configuration
const API_BASE_URL = "http://localhost:8083";

class BookingApi {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Request Interceptor to attach Authorization Header
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("auth.token"); // Standardizing on 'authToken'
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  // Helper to handle Axios response data and errors
  private async handleRequest<T>(request: Promise<any>): Promise<T> {
    try {
      const response = await request;
      return response.data as T;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        // Throw the specific API error message if available
        throw new Error(
          error.response.data.message || error.response.statusText
        );
      }
      throw new Error("An unexpected error occurred");
    }
  }

  // ===== BOOKINGS (User/General) =====

  async getAvailableSlots(
    facilityId: number,
    date: string
  ): Promise<AvailableSlot[]> {
    return this.handleRequest<AvailableSlot[]>(
      this.axiosInstance.get(
        `/api/v1/bookings/availability/${facilityId}?date=${date}`
      )
    );
  }

  async getAvailableSlotsInRange(
    facilityId: number,
    startDate: string,
    endDate: string
  ): Promise<AvailableSlot[]> {
    return this.handleRequest<AvailableSlot[]>(
      this.axiosInstance.get(
        `/api/v1/bookings/availability/${facilityId}/range`,
        {
          params: { startDate, endDate },
        }
      )
    );
  }

  async getBookableSlots(
    facilityId: number,
    date: string
  ): Promise<AvailableSlot[]> {
    return this.handleRequest<AvailableSlot[]>(
      this.axiosInstance.get(
        `/api/v1/bookings/availability/${facilityId}/bookable?date=${date}`
      )
    );
  }

  async reserveSlot(request: CreateBookingRequest): Promise<BookingResponse> {
    return this.handleRequest<BookingResponse>(
      this.axiosInstance.post("/api/v1/bookings/reserve", request)
    );
  }

  async confirmBooking(
    bookingId: number,
    request: ConfirmBookingRequest
  ): Promise<BookingResponse> {
    return this.handleRequest<BookingResponse>(
      this.axiosInstance.post(`/api/v1/bookings/${bookingId}/confirm`, request)
    );
  }

  async cancelBooking(
    bookingId: number,
    request: CancelBookingRequest
  ): Promise<BookingResponse> {
    return this.handleRequest<BookingResponse>(
      this.axiosInstance.post(`/api/v1/bookings/${bookingId}/cancel`, request)
    );
  }

  async getMyBookings(status?: BookingStatus): Promise<BookingResponse[]> {
    return this.handleRequest<BookingResponse[]>(
      this.axiosInstance.get("/api/v1/bookings/my-bookings", {
        params: status ? { status } : {},
      })
    );
  }

  async getBookingById(bookingId: number): Promise<BookingResponse> {
    return this.handleRequest<BookingResponse>(
      this.axiosInstance.get(`/api/v1/bookings/${bookingId}`)
    );
  }

  // ===== SCHEDULES (Admin) =====

  async createSchedule(
    request: CreateScheduleRequest
  ): Promise<ScheduleResponse> {
    return this.handleRequest<ScheduleResponse>(
      this.axiosInstance.post("/api/schedules", request)
    );
  }

  async getScheduleById(scheduleId: number): Promise<ScheduleResponse> {
    return this.handleRequest<ScheduleResponse>(
      this.axiosInstance.get(`/api/schedules/${scheduleId}`)
    );
  }

  async getFacilitySchedules(facilityId: number): Promise<ScheduleResponse[]> {
    return this.handleRequest<ScheduleResponse[]>(
      this.axiosInstance.get(`/api/schedules/facility/${facilityId}`)
    );
  }

  // ** New Endpoints for ScheduleList Component **

  async getClubSchedules(clubId: number): Promise<Schedule[]> {
    return this.handleRequest<Schedule[]>(
      this.axiosInstance.get(`/api/schedules/club/${clubId}`)
    );
  }

  async activateSchedule(scheduleId: number): Promise<void> {
    return this.handleRequest<void>(
      this.axiosInstance.post(`/api/schedules/${scheduleId}/activate`)
    );
  }

  async deactivateSchedule(scheduleId: number): Promise<void> {
    return this.handleRequest<void>(
      this.axiosInstance.post(`/api/schedules/${scheduleId}/deactivate`)
    );
  }
}

export const bookingApi = new BookingApi();
