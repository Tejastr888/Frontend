import { bookingApi } from "@/bookingservice/api/api";
import { SlotGenerationMode } from "@/bookingservice/enums/enums";
import {
  CreateScheduleFormData,
  ManualSlot,
} from "@/bookingservice/types/componentTypes";
import {
  AlertCircle,
  Loader2,
  Plus,
  Trash2,
  X,
  CheckCircle,
} from "lucide-react";
import { useState } from "react";
import { SlotGrid } from "../booking/SlotGrid";
import { Facility } from "@/api/facility";
import { Slot } from "@/bookingservice/types/types";

export const CreateScheduleForm: React.FC<{
  onClose: () => void;
  onSuccess: () => void;
  clubId: number;
  facility: Facility;
}> = ({ onClose, onSuccess, clubId, facility }) => {
  const [formData, setFormData] = useState<CreateScheduleFormData>({
    clubId,
    facilityId: facility.id,
    maxParticipantsPerSlot: 20,
    operatingStartTime: "06:00",
    operatingEndTime: "22:00",
    slotDurationMinutes: 60,
    breakBetweenSlotsMinutes: 0,
    generationMode: SlotGenerationMode.AUTO,
    slotsPerDay: 12,
    pricePerSlot: 500,
    validFrom: new Date().toISOString().split("T")[0],
    validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    description: "",
    slots: [],
  });

  const [manualSlots, setManualSlots] = useState<ManualSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ SUCCESS SCREEN STATES
  const [step, setStep] = useState<"form" | "success">("form");
  const [generatedSlots, setGeneratedSlots] = useState<Slot[]>([]);
  const [totalSlotsGenerated, setTotalSlotsGenerated] = useState(0);
  const [createdFacilityName, setCreatedFacilityName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // ✅ USE YOUR EXACT TYPE
      const payload: CreateScheduleFormData = {
        ...formData,
        slots:
          formData.generationMode === SlotGenerationMode.MANUAL
            ? manualSlots
            : undefined,
      };

      // ✅ CALL API SERVICE
      const response = await bookingApi.createSchedule(payload);

      console.log("Schedule created successfully:", response);
      console.log(`Total slots generated: ${response.totalSlotsGenerated}`);

      // ✅ CONVERT RESPONSE SLOTS TO YOUR Slot TYPE
      const convertedSlots: Slot[] = response.slots.map((slot: any) => ({
        slotId: slot.slotId,
        facilityId: slot.facilityId,
        facilityName: slot.facilityName,
        date: slot.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        duration: slot.duration,
        maxCapacity: slot.maxCapacity,
        availableSpots: slot.availableSpots,
        bookedCount: slot.bookedCount,
        isFull: slot.isFull,
        price: slot.price,
        isBookable: slot.isBookable,
        unavailableReason: slot.unavailableReason,
      }));

      setGeneratedSlots(convertedSlots);
      if (response.totalSlotsGenerated != undefined) {
        setTotalSlotsGenerated(response.totalSlotsGenerated);
      }
      setCreatedFacilityName(facility.name || "Facility");
      setStep("success");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create schedule"
      );
    } finally {
      setLoading(false);
    }
  };

  // ✅ HANDLE SUCCESS COMPLETION
  const handleSuccessClose = () => {
    onSuccess();
    onClose();
  };

  const addManualSlot = () => {
    setManualSlots([
      ...manualSlots,
      {
        slotDate: formData.validFrom,
        startTime: "10:00",
        endTime: "11:00",
      },
    ]);
  };

  const removeManualSlot = (index: number) => {
    setManualSlots(manualSlots.filter((_, i) => i !== index));
  };

  const updateManualSlot = (
    index: number,
    field: keyof ManualSlot,
    value: any
  ) => {
    const updated = [...manualSlots];
    updated[index] = { ...updated[index], [field]: value };
    setManualSlots(updated);
  };

  // ✅ SUCCESS SCREEN
  if (step === "success") {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white rounded-lg max-w-5xl w-full p-6 my-8 max-h-[90vh] overflow-y-auto">
          {/* Success Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Schedule Created Successfully!
                </h2>
                <p className="text-gray-600 mt-1">
                  {totalSlotsGenerated} slots generated for{" "}
                  {createdFacilityName}
                </p>
              </div>
            </div>
            <button
              onClick={handleSuccessClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Info Box */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>✓ Preview of Generated Slots:</strong> All slots are
              organized by time of day below.
            </p>
          </div>

          {/* ✅ REUSE SlotGrid - Your exact type */}
          <div className="mb-6">
            <SlotGrid
              slots={generatedSlots}
              mode="view"
              onSlotSelect={() => {}}
              selectedSlotId={undefined}
              loading={false}
            />
          </div>

          {/* Action Button */}
          <div className="flex gap-3 pt-6 border-t">
            <button
              onClick={handleSuccessClose}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Close & Refresh
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ✅ FORM SCREEN
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-4xl w-full p-6 my-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Create New Schedule
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Facility Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Facility
            </label>
            <input
              type="text"
              value={facility.name}
              readOnly
              className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700"
            />
          </div>

          {/* Generation Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Generation Mode *
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    generationMode: SlotGenerationMode.AUTO,
                  })
                }
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  formData.generationMode === SlotGenerationMode.AUTO
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-blue-300"
                }`}
              >
                <div className="font-semibold mb-1">Auto Generate</div>
                <div className="text-sm text-gray-600">
                  Automatically create slots based on operating hours
                </div>
              </button>
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    generationMode: SlotGenerationMode.MANUAL,
                  })
                }
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  formData.generationMode === SlotGenerationMode.MANUAL
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-blue-300"
                }`}
              >
                <div className="font-semibold mb-1">Manual</div>
                <div className="text-sm text-gray-600">
                  Manually specify each slot (for special events)
                </div>
              </button>
            </div>
          </div>

          {/* Operating Hours */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Operating Start Time *
              </label>
              <input
                type="time"
                value={formData.operatingStartTime}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    operatingStartTime: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Operating End Time *
              </label>
              <input
                type="time"
                value={formData.operatingEndTime}
                onChange={(e) =>
                  setFormData({ ...formData, operatingEndTime: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Slot Configuration */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slot Duration (minutes) *
              </label>
              <input
                type="number"
                value={formData.slotDurationMinutes}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    slotDurationMinutes: parseInt(e.target.value),
                  })
                }
                min={15}
                max={480}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Break Between Slots (minutes)
              </label>
              <input
                type="number"
                value={formData.breakBetweenSlotsMinutes}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    breakBetweenSlotsMinutes: parseInt(e.target.value),
                  })
                }
                min={0}
                max={120}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            {formData.generationMode === SlotGenerationMode.AUTO && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slots Per Day *
                </label>
                <input
                  type="number"
                  value={formData.slotsPerDay || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      slotsPerDay: parseInt(e.target.value),
                    })
                  }
                  min={1}
                  max={100}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            )}
          </div>

          {/* Capacity & Pricing */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Participants Per Slot *
              </label>
              <input
                type="number"
                value={formData.maxParticipantsPerSlot}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maxParticipantsPerSlot: parseInt(e.target.value),
                  })
                }
                min={1}
                max={1000}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Per Slot (₹) *
              </label>
              <input
                type="number"
                value={formData.pricePerSlot}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    pricePerSlot: parseFloat(e.target.value),
                  })
                }
                min={0}
                step={0.01}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Validity Period */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valid From *
              </label>
              <input
                type="date"
                value={formData.validFrom}
                onChange={(e) =>
                  setFormData({ ...formData, validFrom: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valid Until *
              </label>
              <input
                type="date"
                value={formData.validUntil}
                onChange={(e) =>
                  setFormData({ ...formData, validUntil: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Winter swimming schedule"
            />
          </div>

          {/* Manual Slots Section */}
          {formData.generationMode === SlotGenerationMode.MANUAL && (
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Manual Slots</h3>
                <button
                  type="button"
                  onClick={addManualSlot}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Slot
                </button>
              </div>

              {manualSlots.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No slots added yet. Click "Add Slot" to create manual slots.
                </div>
              ) : (
                <div className="space-y-3">
                  {manualSlots.map((slot, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <input
                        type="date"
                        value={slot.slotDate}
                        onChange={(e) =>
                          updateManualSlot(index, "slotDate", e.target.value)
                        }
                        min={formData.validFrom}
                        max={formData.validUntil}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                        required
                      />
                      <input
                        type="time"
                        value={slot.startTime}
                        onChange={(e) =>
                          updateManualSlot(index, "startTime", e.target.value)
                        }
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                        required
                      />
                      <span className="text-gray-500">to</span>
                      <input
                        type="time"
                        value={slot.endTime}
                        onChange={(e) =>
                          updateManualSlot(index, "endTime", e.target.value)
                        }
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => removeManualSlot(index)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                loading ||
                (formData.generationMode === SlotGenerationMode.MANUAL &&
                  manualSlots.length === 0)
              }
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Schedule"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
