import { Calendar, Edit2, Loader2, Save } from "lucide-react";
import { BulkUpdateResultsModal } from "./BulkUpdateResultsModal";
import { SlotEditForm } from "./SlotEditForm";
import { Slot } from "@/bookingservice/types/types";
import {
  BulkUpdateResponse,
  SlotUpdateRequest,
} from "@/bookingservice/types/types";
import { useState } from "react";

export const SlotGridWithEditing = ({
  slots,
  mode,
  loading = false,
  onBulkUpdate,
}: {
  slots: Slot[];
  mode: "view" | "book" | "edit";
  loading?: boolean;
  onBulkUpdate: (updates: SlotUpdateRequest[]) => Promise<BulkUpdateResponse>;
}) => {
  console.log(slots);
  const [editedSlots, setEditedSlots] = useState<
    Map<number, Partial<SlotUpdateRequest>>
  >(new Map());
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [updateResults, setUpdateResults] = useState<BulkUpdateResponse | null>(
    null
  );

  const handleSlotEdit = (slot: Slot) => {
    setSelectedSlot(slot);
    setShowEditForm(true);
  };

  const handleSaveEdit = (updates: Partial<SlotUpdateRequest>) => {
    setEditedSlots((prev) => {
      const newMap = new Map(prev);
      // Only add to edited slots if there are actual changes
      const hasChanges = Object.keys(updates).length > 1; // More than just slotId
      if (hasChanges) {
        newMap.set(updates.slotId!, updates);
      }
      return newMap;
    });
  };

  const handleBulkSave = async () => {
    if (editedSlots.size === 0) return;
    setSaving(true);
    try {
      const updates = Array.from(editedSlots.values()) as SlotUpdateRequest[];
      const results = await onBulkUpdate(updates);

      setUpdateResults(results);
      setShowResults(true);

      // Clear successful updates from editedSlots
      if (results.successfulUpdates.length > 0) {
        setEditedSlots((prev) => {
          const newMap = new Map(prev);
          results.successfulUpdates.forEach((slot) => newMap.delete(slot.id));
          return newMap;
        });
      }
    } catch (error) {
      console.error("Bulk update failed:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdits = () => {
    if (confirm(`Discard ${editedSlots.size} pending changes?`)) {
      setEditedSlots(new Map());
    }
  };

  const isSlotEdited = (slotId: number) => editedSlots.has(slotId);

  const getSlotWithEdits = (slot: Slot): Slot => {
    const edits = editedSlots.get(slot.id);
    if (!edits) return slot;

    return {
      ...slot,
      startTime: edits.startTime ?? slot.startTime,
      endTime: edits.endTime ?? slot.endTime,
      maxCapacity: edits.maxCapacity ?? slot.maxCapacity,
      price: edits.price ?? slot.price,
      isActive: edits.isActive ?? slot.isActive,
    };
  };

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
      <div key={title} className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
          {title}
        </h3>
        <div
          key={title}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          {groupSlots.map((slot) => {
            const displaySlot = getSlotWithEdits(slot);
            const edited = isSlotEdited(slot.id);

            return (
              <div key={slot.id} className="relative">
                {edited && (
                  <div className="absolute -top-2 -right-2 z-10">
                    <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
                      <Edit2 className="w-3 h-3" />
                      Edited
                    </span>
                  </div>
                )}
                <div
                  onClick={() => handleSlotEdit(slot)}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    edited
                      ? "border-orange-400 bg-orange-50 shadow-md"
                      : "border-gray-200 hover:border-blue-300 hover:shadow-md"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-gray-900">
                      {displaySlot.startTime} - {displaySlot.endTime}
                    </span>
                    {!displaySlot.isActive && (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                        Inactive
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>
                      Capacity: {displaySlot.bookedCount}/
                      {displaySlot.maxCapacity}
                    </p>
                    <p className="font-medium">₹{displaySlot.price}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Floating Action Bar */}
      {editedSlots.size > 0 && (
        <div
          key="floating-action-bar"
          className="sticky top-0 z-40 bg-orange-600 text-white px-6 py-4 rounded-lg shadow-lg mb-6"
        >
          <div key="floating" className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Edit2 className="w-5 h-5" />
              <span className="font-semibold">
                {editedSlots.size} slot{editedSlots.size > 1 ? "s" : ""} edited
              </span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCancelEdits}
                disabled={saving}
                className="px-4 py-2 bg-white text-orange-600 rounded-lg hover:bg-gray-100 font-medium"
              >
                Discard Changes
              </button>
              <button
                onClick={handleBulkSave}
                disabled={saving}
                className="px-4 py-2 bg-orange-700 text-white rounded-lg hover:bg-orange-800 font-medium flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes ({editedSlots.size})
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Slot Groups */}
      <>
        {renderSlotGroup("Morning", groupedSlots.morning)}
        {renderSlotGroup("Afternoon", groupedSlots.afternoon)}
        {renderSlotGroup("Evening", groupedSlots.evening)}
      </>
      {/* Edit Form Modal */}
      {showEditForm && selectedSlot && (
        <SlotEditForm
          slot={selectedSlot}
          onClose={() => setShowEditForm(false)}
          onSave={handleSaveEdit}
        />
      )}

      {/* Results Modal */}
      {showResults && updateResults && (
        <BulkUpdateResultsModal
          results={updateResults}
          onClose={() => setShowResults(false)}
        />
      )}
    </div>
  );
};
