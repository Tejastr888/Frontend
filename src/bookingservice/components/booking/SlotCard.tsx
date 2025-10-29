import React, { useState } from "react";
import {
  Calendar,
  Clock,
  Users,
  DollarSign,
  Check,
  X,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { SlotCardProps } from "../../types/componentTypes";

export const SlotCard: React.FC<SlotCardProps> = ({
  slot,
  mode,
  onBook,
  onEdit,
  selected = false,
}) => {
  const getStatusBadge = () => {
    if (!slot.isBookable) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
          <X className="w-3 h-3" />
          {slot.unavailableReason || "Not Available"}
        </span>
      );
    }

    if (slot.isFull) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
          <AlertCircle className="w-3 h-3" />
          Full
        </span>
      );
    }

    const percentage =
      ((slot.maxCapacity - slot.availableSpots) / slot.maxCapacity) * 100;

    if (percentage >= 80) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
          <AlertCircle className="w-3 h-3" />
          {slot.availableSpots} spots left
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
        <Check className="w-3 h-3" />
        Available
      </span>
    );
  };

  const getCardStyles = () => {
    const base = "border rounded-lg p-4 transition-all cursor-pointer";

    if (selected) {
      return `${base} border-blue-500 bg-blue-50 shadow-lg`;
    }

    if (!slot.isBookable) {
      return `${base} border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed`;
    }

    return `${base} border-gray-200 hover:border-blue-300 hover:shadow-md`;
  };

  const handleClick = () => {
    if (!slot.isBookable) return;

    if (mode === "book" && onBook) {
      onBook(slot);
    } else if (mode === "edit" && onEdit) {
      onEdit(slot);
    }
  };

  return (
    <div className={getCardStyles()} onClick={handleClick}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-500" />
          <span className="font-semibold text-gray-900">
            {slot.startTime} - {slot.endTime}
          </span>
        </div>
        {getStatusBadge()}
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        {/* Duration */}
        <div className="flex items-center gap-2 text-gray-600">
          <Clock className="w-3.5 h-3.5" />
          <span>{slot.duration}</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 text-gray-600">
          <DollarSign className="w-3.5 h-3.5" />
          <span className="font-medium">₹{slot.price}</span>
        </div>

        {/* Capacity */}
        <div className="col-span-2 flex items-center gap-2 text-gray-600">
          <Users className="w-3.5 h-3.5" />
          <span>
            {slot.bookedCount} / {slot.maxCapacity} booked
          </span>
        </div>
      </div>

      {/* Capacity Bar */}
      <div className="mt-3">
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full transition-all ${
              slot.isFull
                ? "bg-red-500"
                : slot.availableSpots <= 5
                ? "bg-orange-500"
                : "bg-green-500"
            }`}
            style={{
              width: `${
                ((slot.maxCapacity - slot.availableSpots) / slot.maxCapacity) *
                100
              }%`,
            }}
          />
        </div>
      </div>

      {/* Action Button for Edit Mode */}
      {mode === "edit" && (
        <button
          className="w-full mt-3 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onEdit?.(slot);
          }}
        >
          Edit Slot
        </button>
      )}
    </div>
  );
};
