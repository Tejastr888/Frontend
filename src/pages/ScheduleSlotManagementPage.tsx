// src/pages/ScheduleSlotManagementPage.tsx

import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { Calendar as CalendarIcon, Loader2, ArrowLeft } from "lucide-react";
import { format, subDays, startOfDay } from "date-fns";
import { bookingApi } from "@/bookingservice/api/api";
import { Schedule, Slot } from "@/bookingservice/types/componentTypes";
import { SlotGrid } from "@/bookingservice/components/booking/SlotGrid"; // Your provided component
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar"; // Assuming a Shadcn Calendar component
import { Button } from "@/components/ui/button";

// A minimal interface to pass Schedule details via route state
interface LocationState {
  schedule: Schedule;
}

export default function ScheduleSlotManagementPage() {
  // Read scheduleId from URL params (assuming the new route is /schedules/:scheduleId/slots)
  const { scheduleId } = useParams<{ scheduleId: string }>();
  const location = useLocation();

  // Read schedule details from navigation state for initial display
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

  // Placeholder function for slot editing (You would implement this in detail later)
  const handleSlotEdit = (slot: Slot) => {
    // Here you would typically open a modal or form to edit the slot details (e.g., price, capacity)
    toast({
      title: "Edit Slot",
      description: `Editing slot ${slot.slotId} on ${format(
        selectedDate,
        "PPP"
      )}`,
    });
    console.log("Edit Slot:", slot);
  };

  // Fallback: Fetch full Schedule object if not passed via state (e.g., direct URL access)
  const fetchScheduleDetails = async () => {
    if (currentScheduleId) {
      try {
        setLoadingSchedule(true);
        const data = await bookingApi.getScheduleById(currentScheduleId); // Assuming a new API call
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
      // Assuming an API call to get slots for a specific schedule and date
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

  // Initial load and dependency on schedule ID
  useEffect(() => {
    if (!initialSchedule) {
      fetchScheduleDetails();
    }
  }, [currentScheduleId]);

  // Fetch slots whenever the selected date changes
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

  // Calculate the valid range for the calendar
  const validFromDate = new Date(schedule.validFrom);
  const validUntilDate = new Date(schedule.validUntil);
  const today = startOfDay(new Date());

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-8">
        <Link
          to={`/dashboard/club/facility/${schedule.facilityId}/schedules`}
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
        {/* Optional: Button for bulk operations */}
        <Button variant="outline">Bulk Slot Actions</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Column: Date Picker and Schedule Details */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select Date</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              {/* Calendar component for date selection */}
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  if (date) setSelectedDate(startOfDay(date));
                }}
                // Restrict dates based on schedule validity and future dates
                disabled={(date) =>
                  date < today || date < validFromDate || date > validUntilDate
                }
                initialFocus
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
        </div>

        {/* Right Column: Slot Grid */}
        <div className="lg:col-span-3">
          <h2 className="text-2xl font-semibold mb-6">
            Slots for {format(selectedDate, "EEEE, MMMM do, yyyy")}
          </h2>
          <SlotGrid
            slots={slots}
            mode="edit" // Club management mode
            loading={loadingSlots}
            onSlotSelect={handleSlotEdit} // Use the edit handler
          />
        </div>
      </div>
    </div>
  );
}
