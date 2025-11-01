import { BulkUpdateResponse } from "@/bookingservice/types/types";
import { AlertCircle, CheckCircle2, X, XCircle } from "lucide-react";

export const BulkUpdateResultsModal = ({
  results,
  onClose,
}: {
  results: BulkUpdateResponse;
  onClose: () => void;
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Update Results</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-semibold">Successful</span>
            </div>
            <p className="text-2xl font-bold text-green-900 mt-2">
              {results.successfulUpdates.length}
            </p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-700">
              <XCircle className="w-5 h-5" />
              <span className="font-semibold">Failed</span>
            </div>
            <p className="text-2xl font-bold text-red-900 mt-2">
              {results.failedUpdates.length}
            </p>
          </div>
        </div>

        {/* Successful Updates */}
        {results.successfulUpdates.length > 0 && (
          <div className="mb-6">
            <h4 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Successfully Updated ({results.successfulUpdates.length})
            </h4>
            <div className="space-y-2">
              {results.successfulUpdates.slice(0, 5).map((slot) => (
                <div
                  key={slot.id}
                  className="bg-green-50 border border-green-200 rounded p-3 text-sm"
                >
                  <span className="font-medium">Slot #{slot.slotId}</span>
                  <span className="text-gray-600 ml-2">
                    {slot.startTime} - {slot.endTime} | ₹{slot.price} |{" "}
                    {slot.maxCapacity} capacity
                  </span>
                </div>
              ))}
              {results.successfulUpdates.length > 5 && (
                <p className="text-xs text-gray-500 text-center">
                  ... and {results.successfulUpdates.length - 5} more
                </p>
              )}
            </div>
          </div>
        )}

        {/* Failed Updates */}
        {results.failedUpdates.length > 0 && (
          <div>
            <h4 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              Failed Updates ({results.failedUpdates.length})
            </h4>
            <div className="space-y-2">
              {results.failedUpdates.map((failure) => (
                <div
                  key={failure.slotId}
                  className="bg-red-50 border border-red-200 rounded p-3"
                >
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-red-900">
                        Slot #{failure.slotId}
                      </p>
                      <p className="text-sm text-red-700 mt-1">
                        {failure.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full mt-6 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900"
        >
          Close
        </button>
      </div>
    </div>
  );
};
