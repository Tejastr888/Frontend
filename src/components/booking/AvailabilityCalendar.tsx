import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  Loader2,
  Clock,
  DollarSign,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAvailableSlots } from "@/api/availability";
import { TimeSlot } from "@/api/schedule";
import { cn } from "@/lib/utils";

interface AvailabilityCalendarProps {
  facilityId: number;
  onSelectSlot: (slot: TimeSlot) => void;
}

export default function AvailabilityCalendar({
  facilityId,
  onSelectSlot,
}: AvailabilityCalendarProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  useEffect(() => {
    if (date) {
      loadSlots();
    }
  }, [date, facilityId]);

  const loadSlots = async () => {
    if (!date) return;

    try {
      setLoading(true);
      setError(null);

      const dateStr = format(date, "yyyy-MM-dd");
      const availableSlots = await getAvailableSlots(facilityId, dateStr);

      setSlots(availableSlots);
    } catch (err: any) {
      setError(err.message || "Failed to load availability");
    } finally {
      setLoading(false);
    }
  };

  const handleSlotClick = (slot: TimeSlot) => {
    if (!slot.available) return;
    setSelectedSlot(slot);
    onSelectSlot(slot);
  };

  const availableSlots = slots.filter((s) => s.available);
  const bookedSlots = slots.filter((s) => !s.available);

  return (
    <div className="space-y-4">
      {/* Date Picker */}
      <Card>
        <CardHeader>
          <CardTitle>Select Date</CardTitle>
          <CardDescription>
            Choose a date to see available time slots
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(date) => date < new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </CardContent>
      </Card>

      {/* Time Slots */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Available Time Slots
            <div className="flex gap-2 text-sm font-normal">
              <Badge variant="outline" className="bg-green-50">
                {availableSlots.length} Available
              </Badge>
              <Badge variant="outline" className="bg-gray-50">
                {bookedSlots.length} Booked
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-destructive">{error}</div>
          ) : slots.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No slots available for this date
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {slots.map((slot, index) => (
                <Button
                  key={index}
                  variant={
                    selectedSlot === slot
                      ? "default"
                      : slot.available
                      ? "outline"
                      : "ghost"
                  }
                  className={cn(
                    "flex flex-col items-start h-auto p-3",
                    !slot.available && "opacity-50 cursor-not-allowed"
                  )}
                  onClick={() => handleSlotClick(slot)}
                  disabled={!slot.available}
                >
                  <div className="flex items-center gap-1 text-sm">
                    <Clock className="h-3 w-3" />
                    {format(new Date(slot.startTime), "hh:mm a")}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <DollarSign className="h-3 w-3" />₹{slot.price}
                  </div>
                  {!slot.available && (
                    <Badge variant="secondary" className="mt-1 text-xs">
                      Booked
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
