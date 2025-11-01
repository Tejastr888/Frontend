import { Slot, SlotUpdateRequest } from "@/bookingservice/types/types";
import { X } from "lucide-react";
import { useState } from "react";

export const SlotEditForm = ({
  slot,
  onClose,
  onSave,
}: {
  slot: Slot;
  onClose: () => void;
  onSave: (updates: Partial<SlotUpdateRequest>) => void;
}) => {
  const [formData, setFormData] = useState({
    startTime: slot.startTime,
    endTime: slot.endTime,
    maxCapacity: slot.maxCapacity,
    price: slot.price,
    isActive: slot.isActive ?? true,
  });

  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSubmit = () => {
    const updates: Partial<SlotUpdateRequest> = { slotId: slot.id };
    // Only include fields that actually changed
    if (formData.startTime !== slot.startTime)
      updates.startTime = formData.startTime;
    if (formData.endTime !== slot.endTime) updates.endTime = formData.endTime;
    if (formData.maxCapacity !== slot.maxCapacity)
      updates.maxCapacity = formData.maxCapacity;
    if (formData.price !== slot.price) updates.price = formData.price;
    if (formData.isActive !== slot.isActive)
      updates.isActive = formData.isActive;
    // Only save if there are actual changes (more than just slotId)
    if (Object.keys(updates).length > 1) {
      onSave(updates);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Edit Slot</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Time Range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => handleChange("startTime", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Time
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => handleChange("endTime", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Capacity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Capacity
            </label>
            <input
              type="number"
              value={formData.maxCapacity}
              onChange={(e) =>
                handleChange("maxCapacity", parseInt(e.target.value))
              }
              min={slot.bookedCount}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Currently {slot.bookedCount} booked (cannot reduce below this)
            </p>
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price (₹)
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) =>
                handleChange("price", parseFloat(e.target.value))
              }
              step="0.01"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Active Status */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => handleChange("isActive", e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label
              htmlFor="isActive"
              className="text-sm font-medium text-gray-700"
            >
              Active (available for booking)
            </label>
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-700">
              <strong>Note:</strong> Changes will be queued. Click "Save
              Changes" at the top to apply all edits.
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!hasChanges}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  );
};
