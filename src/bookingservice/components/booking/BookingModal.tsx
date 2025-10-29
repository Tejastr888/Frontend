import { useState } from "react";
import { BookingModalProps } from "../../types/componentTypes";
import { AlertCircle, Calendar, Clock, Loader2, Users, X } from "lucide-react";

export const BookingModal: React.FC<BookingModalProps> = ({
  slot,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [numberOfPeople, setNumberOfPeople] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !slot) return null;

  const totalPrice = slot.price * numberOfPeople;
  const platformFee = totalPrice * 0.05;
  const finalPrice = totalPrice + platformFee;

  const handleConfirm = async () => {
    if (numberOfPeople > slot.availableSpots) {
      setError(`Only ${slot.availableSpots} spots available`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onConfirm(slot.slotId, numberOfPeople);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Booking failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Confirm Booking</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Slot Details */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 text-gray-700 mb-2">
            <Calendar className="w-4 h-4" />
            <span className="font-medium">{slot.date}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700 mb-2">
            <Clock className="w-4 h-4" />
            <span>
              {slot.startTime} - {slot.endTime} ({slot.duration})
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <Users className="w-4 h-4" />
            <span>{slot.availableSpots} spots available</span>
          </div>
        </div>

        {/* Number of People Selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number of People
          </label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setNumberOfPeople(Math.max(1, numberOfPeople - 1))}
              disabled={numberOfPeople <= 1}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              -
            </button>
            <input
              type="number"
              value={numberOfPeople}
              onChange={(e) =>
                setNumberOfPeople(Math.max(1, parseInt(e.target.value) || 1))
              }
              min={1}
              max={slot.availableSpots}
              className="w-20 text-center px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={() =>
                setNumberOfPeople(
                  Math.min(slot.availableSpots, numberOfPeople + 1)
                )
              }
              disabled={numberOfPeople >= slot.availableSpots}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              +
            </button>
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="border-t border-gray-200 pt-4 mb-4 space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Slot price (× {numberOfPeople})</span>
            <span>₹{totalPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Platform fee (5%)</span>
            <span>₹{platformFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
            <span>Total</span>
            <span>₹{finalPrice.toFixed(2)}</span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Confirm Booking"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
