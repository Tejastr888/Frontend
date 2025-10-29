import { useState, useEffect } from "react";
import { bookingApi } from "../api/api";
import { AvailableSlot, BookingResponse } from "../types/types";

export function useAvailableSlots(facilityId: number, date: string) {
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchSlots() {
      try {
        setLoading(true);
        setError(null);
        const data = await bookingApi.getAvailableSlots(facilityId, date);
        if (mounted) {
          setSlots(data);
        }
      } catch (err) {
        if (mounted) {
          setError(
            err instanceof Error ? err.message : "Failed to fetch slots"
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    if (facilityId && date) {
      fetchSlots();
    }

    return () => {
      mounted = false;
    };
  }, [facilityId, date]);

  return { slots, loading, error, refetch: () => {} };
}

export function useBookingFlow() {
  const [booking, setBooking] = useState<BookingResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reserveSlot = async (slotId: number, numberOfPeople: number) => {
    try {
      setLoading(true);
      setError(null);
      const result = await bookingApi.reserveSlot({
        slotId,
        numberOfPeople,
      });
      setBooking(result);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Reservation failed";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const confirmBooking = async (
    bookingId: number,
    paymentTransactionId: string
  ) => {
    try {
      setLoading(true);
      setError(null);
      const result = await bookingApi.confirmBooking(bookingId, {
        paymentTransactionId,
      });
      setBooking(result);
      return result;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Confirmation failed";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId: number, reason?: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await bookingApi.cancelBooking(bookingId, { reason });
      setBooking(result);
      return result;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Cancellation failed";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  return {
    booking,
    loading,
    error,
    reserveSlot,
    confirmBooking,
    cancelBooking,
  };
}
