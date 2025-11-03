import { Calendar, Loader2 } from "lucide-react";
import { SlotGridProps } from "../../types/componentTypes";
import { SlotCard } from "./SlotCard";
import { Slot } from "@/bookingservice/types/types";

export const SlotGrid: React.FC<SlotGridProps> = ({
  slots,
  mode,
  onSlotSelect,
  selectedSlotId,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-3 text-gray-600">Loading slots...</span>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600 font-medium">No slots available</p>
        <p className="text-sm text-gray-500 mt-1">
          {mode === "edit"
            ? "Create a schedule to generate slots"
            : "Please select a different date"}
        </p>
      </div>
    );
  }

  // Group slots by time of day
  const groupedSlots = {
    morning: slots.filter((s) => {
      const hour = parseInt(s.startTime.split(":")[0]);
      return hour >= 6 && hour < 12;
    }),
    afternoon: slots.filter((s) => {
      const hour = parseInt(s.startTime.split(":")[0]);
      return hour >= 12 && hour < 17;
    }),
    evening: slots.filter((s) => {
      const hour = parseInt(s.startTime.split(":")[0]);
      return hour >= 17;
    }),
  };

  const renderSlotGroup = (title: string, groupSlots: Slot[]) => {
    if (groupSlots.length === 0) return null;

    return (
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
          {title}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {groupSlots.map((slot) => (
            <SlotCard
              key={slot.slotId}
              slot={slot}
              mode={mode}
              selected={slot.slotId === selectedSlotId}
              onBook={onSlotSelect}
              onEdit={onSlotSelect}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div>
      {renderSlotGroup("Morning", groupedSlots.morning)}
      {renderSlotGroup("Afternoon", groupedSlots.afternoon)}
      {renderSlotGroup("Evening", groupedSlots.evening)}
    </div>
  );
};
