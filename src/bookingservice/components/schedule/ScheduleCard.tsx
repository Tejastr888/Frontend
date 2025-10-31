// src/bookingservice/components/schedule/ScheduleCard.tsx

import React from "react";
import { Schedule } from "@/bookingservice/types/componentTypes"; // Assuming you update componentTypes
import { Clock, DollarSign, Users, Calendar, Edit, Trash2 } from "lucide-react";

interface ScheduleCardProps {
  schedule: Schedule;
  facilityName: string;
  onToggleStatus: (scheduleId: number, isActive: boolean) => void;
  onEdit: (schedule: Schedule) => void;
  onDelete: (scheduleId: number) => void;
}

export const ScheduleCard: React.FC<ScheduleCardProps> = ({
  schedule,
  facilityName,
  onToggleStatus,
  onEdit,
  onDelete,
}) => {
  return (
    <div
      key={schedule.id}
      className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-gray-900">
              {facilityName}
            </h3>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                schedule.isActive
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {schedule.isActive ? "Active" : "Inactive"}
            </span>
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
              {schedule.generationMode}
            </span>
          </div>
          {schedule.description && (
            <p className="text-sm text-gray-600 mt-1">{schedule.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Edit Button */}
          <button
            onClick={() => onEdit(schedule)}
            className="p-1.5 rounded-lg text-sm font-medium transition-colors text-blue-600 hover:bg-blue-50"
            title="Edit Schedule"
          >
            <Edit className="w-5 h-5" />
          </button>
          {/* Delete Button (using deactivate for simplicity) */}
          <button
            onClick={() => onDelete(schedule.id)}
            className="p-1.5 rounded-lg text-sm font-medium transition-colors text-red-600 hover:bg-red-50"
            title="Delete Schedule"
          >
            <Trash2 className="w-5 h-5" />
          </button>
          {/* Activate/Deactivate Toggle */}
          <button
            onClick={() => onToggleStatus(schedule.id, schedule.isActive)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              schedule.isActive
                ? "bg-red-50 text-red-700 hover:bg-red-100"
                : "bg-green-50 text-green-700 hover:bg-green-100"
            }`}
          >
            {schedule.isActive ? "Deactivate" : "Activate"}
          </button>
        </div>
      </div>

      {/* Schedule Details */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          <span>
            {schedule.operatingStartTime} - {schedule.operatingEndTime}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Users className="w-4 h-4" />
          <span>{schedule.maxParticipantsPerSlot} people/slot</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <DollarSign className="w-4 h-4" />
          <span>₹{schedule.pricePerSlot}/slot</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>
            {schedule.validFrom} to {schedule.validUntil}
          </span>
        </div>
      </div>

      {schedule.totalSlotsGenerated && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Total slots generated:{" "}
            <span className="font-semibold">
              {schedule.totalSlotsGenerated}
            </span>
          </p>
        </div>
      )}
    </div>
  );
};
