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

// const API_BASE_URL =
//   import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const API_BASE_URL = "http://localhost:8083";

class BookingApi {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem("authToken");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: response.statusText,
      }));
      throw new Error(error.message || "API request failed");
    }
    return response.json();
  }

  async getAvailableSlots(
    facilityId: number,
    date: string
  ): Promise<AvailableSlot[]> {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/bookings/availability/${facilityId}?date=${date}`,
      {
        headers: this.getAuthHeaders(),
      }
    );
    return this.handleResponse(response);
  }

  async getAvailableSlotsInRange(
    facilityId: number,
    startDate: string,
    endDate: string
  ): Promise<AvailableSlot[]> {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/bookings/availability/${facilityId}/range?startDate=${startDate}&endDate=${endDate}`,
      {
        headers: this.getAuthHeaders(),
      }
    );
    return this.handleResponse(response);
  }

  async getBookableSlots(
    facilityId: number,
    date: string
  ): Promise<AvailableSlot[]> {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/bookings/availability/${facilityId}/bookable?date=${date}`,
      {
        headers: this.getAuthHeaders(),
      }
    );
    return this.handleResponse(response);
  }

  async reserveSlot(request: CreateBookingRequest): Promise<BookingResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/bookings/reserve`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request),
    });
    return this.handleResponse(response);
  }

  async confirmBooking(
    bookingId: number,
    request: ConfirmBookingRequest
  ): Promise<BookingResponse> {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/bookings/${bookingId}/confirm`,
      {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request),
      }
    );
    return this.handleResponse(response);
  }

  async cancelBooking(
    bookingId: number,
    request: CancelBookingRequest
  ): Promise<BookingResponse> {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/bookings/${bookingId}/cancel`,
      {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request),
      }
    );
    return this.handleResponse(response);
  }
  async getMyBookings(status?: BookingStatus): Promise<BookingResponse[]> {
    const url = status
      ? `${API_BASE_URL}/api/v1/bookings/my-bookings?status=${status}`
      : `${API_BASE_URL}/api/v1/bookings/my-bookings`;

    const response = await fetch(url, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async getBookingById(bookingId: number): Promise<BookingResponse> {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/bookings/${bookingId}`,
      {
        headers: this.getAuthHeaders(),
      }
    );
    return this.handleResponse(response);
  }

  // ===== SCHEDULES (Admin) =====

  async createSchedule(
    request: CreateScheduleRequest
  ): Promise<ScheduleResponse> {
    const response = await fetch(`${API_BASE_URL}/api/schedules`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request),
    });
    return this.handleResponse(response);
  }

  async getScheduleById(scheduleId: number): Promise<ScheduleResponse> {
    const response = await fetch(
      `${API_BASE_URL}/api/schedules/${scheduleId}`,
      {
        headers: this.getAuthHeaders(),
      }
    );
    return this.handleResponse(response);
  }

  async getFacilitySchedules(facilityId: number): Promise<ScheduleResponse[]> {
    const response = await fetch(
      `${API_BASE_URL}/api/schedules/facility/${facilityId}`,
      {
        headers: this.getAuthHeaders(),
      }
    );
    return this.handleResponse(response);
  }
}

export const bookingApi = new BookingApi();
