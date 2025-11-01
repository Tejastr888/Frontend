import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { Calendar as CalendarIcon, Loader2, ArrowLeft } from "lucide-react";
import { format, startOfDay } from "date-fns";
import { bookingApi } from "@/bookingservice/api/api";
import { Schedule, Slot } from "@/bookingservice/types/componentTypes";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  BulkUpdateResponse,
  SlotUpdateRequest,
} from "@/bookingservice/types/types";
import { SlotGridWithEditing } from "@/bookingservice/components/schedule/SlotGridWithEditing";

interface LocationState {
  schedule: Schedule;
}

export default function ScheduleSlotManagementPage() {
  const { scheduleId, clubId } = useParams<{
    scheduleId: string;
    clubId: string;
  }>();
  const location = useLocation();
  const initialSchedule = (location.state as LocationState)?.schedule;

  const currentScheduleId = parseInt(scheduleId || "0");
  const { toast } = useToast();

  // State
  const [schedule, setSchedule] = useState<Schedule | null>(
    initialSchedule || null
  );
  const [selectedDate, setSelectedDate] = useState<Date>(
    startOfDay(new Date())
  );
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSchedule, setLoadingSchedule] = useState(!initialSchedule);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // ✅ NEW: Bulk update handler
  const handleBulkUpdate = async (
    updates: SlotUpdateRequest[]
  ): Promise<BulkUpdateResponse> => {
    try {
      const result = await bookingApi.updateSlots(updates);

      // ✅ Re-fetch slots to show updated data
      await fetchSlots(selectedDate);

      // ✅ Show success toast
      if (result.successfulUpdates.length > 0) {
        toast({
          title: "Success!",
          description: `${result.successfulUpdates.length} slot(s) updated successfully`,
        });
      }

      // ✅ Show warning if some failed
      if (result.failedUpdates.length > 0) {
        toast({
          variant: "destructive",
          title: "Partial Success",
          description: `${result.failedUpdates.length} slot(s) failed to update`,
        });
      }

      return result;
    } catch (error) {
      console.error("Bulk update failed:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update slots. Please try again.",
      });
      throw error;
    }
  };

  // Fallback: Fetch schedule if not passed via state
  const fetchScheduleDetails = async () => {
    if (currentScheduleId) {
      try {
        setLoadingSchedule(true);
        const data = await bookingApi.getScheduleById(currentScheduleId);
        setSchedule(data);
      } catch (error) {
        console.error("Failed to fetch schedule details:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load schedule details.",
        });
      } finally {
        setLoadingSchedule(false);
      }
    }
  };

  // Fetch Slots
  const fetchSlots = async (date: Date) => {
    if (!currentScheduleId) return;

    try {
      setLoadingSlots(true);
      const dateString = format(date, "yyyy-MM-dd");
      const data = await bookingApi.getScheduleSlots(
        currentScheduleId,
        dateString
      );
      setSlots(data);
    } catch (error) {
      console.error("Failed to fetch slots:", error);
      setSlots([]);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch slots for the selected date.",
      });
    } finally {
      setLoadingSlots(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (!initialSchedule) {
      fetchScheduleDetails();
    }
  }, [currentScheduleId]);

  // Fetch slots when date changes
  useEffect(() => {
    fetchSlots(selectedDate);
  }, [selectedDate, currentScheduleId]);

  if (loadingSchedule || !schedule) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] p-8">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
        <p className="mt-4 text-lg text-gray-600">
          Loading Schedule Details...
        </p>
      </div>
    );
  }

  // Calculate valid date range
  const validFromDate = new Date(schedule.validFrom);
  const validUntilDate = new Date(schedule.validUntil);
  const today = startOfDay(new Date());

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-8">
        <Link
          to={`/dashboard/club/${clubId}/facility/${schedule.facilityId}`}
          className="text-gray-500 hover:text-gray-800"
        >
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">
            Manage Slots for {schedule.facilityName || "Facility"}
          </h1>
          <p className="text-gray-600">
            Schedule ID: {schedule.id} ({schedule.validFrom} to{" "}
            {schedule.validUntil})
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Column: Date Picker and Schedule Details */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select Date</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  if (date) setSelectedDate(startOfDay(date));
                }}
                disabled={(date) =>
                  date < today || date < validFromDate || date > validUntilDate
                }
              />
            </CardContent>
          </Card>

          {/* Schedule Details Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Schedule Configuration</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p>
                <strong>Duration:</strong> {schedule.slotDurationMinutes} mins
              </p>
              <p>
                <strong>Break:</strong> {schedule.breakBetweenSlotsMinutes} mins
              </p>
              <p>
                <strong>Price:</strong> ₹{schedule.pricePerSlot}
              </p>
              <p>
                <strong>Capacity:</strong> {schedule.maxParticipantsPerSlot}
              </p>
              <p
                className={`font-medium ${
                  schedule.isActive ? "text-green-600" : "text-red-600"
                }`}
              >
                Status: {schedule.isActive ? "Active" : "Inactive"}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {schedule.description}
              </p>
            </CardContent>
          </Card>

          {/* Instructions Card */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <p className="text-sm text-blue-900">
                <strong>💡 Tip:</strong> Click any slot to edit its details.
                Changes are queued until you click "Save Changes".
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Slot Grid with Editing */}
        <div className="lg:col-span-3">
          <h2 className="text-2xl font-semibold mb-6">
            Slots for {format(selectedDate, "EEEE, MMMM do, yyyy")}
          </h2>

          {/* ✅ REPLACED: SlotGrid → SlotGridWithEditing */}
          <SlotGridWithEditing
            slots={slots}
            mode="edit"
            loading={loadingSlots}
            onBulkUpdate={handleBulkUpdate}
          />
        </div>
      </div>
    </div>
  );
}
