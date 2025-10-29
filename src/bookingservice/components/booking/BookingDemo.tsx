import { useState } from "react";
import { Slot } from "../../types/componentTypes";
import { SlotGrid } from "./SlotGrid";
import { BookingModal } from "./BookingModal";

export default function BookingDemo() {
  const [selectedDate, setSelectedDate] = useState("2025-11-01");
  const [mode, setMode] = useState<"view" | "book" | "edit">("book");
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Sample data
  const sampleSlots: Slot[] = [
    {
      slotId: 1,
      facilityId: 1,
      facilityName: "Swimming Pool A",
      date: "2025-11-01",
      startTime: "06:00",
      endTime: "07:00",
      duration: "60 minutes",
      maxCapacity: 20,
      availableSpots: 15,
      bookedCount: 5,
      isFull: false,
      price: 500,
      isBookable: true,
    },
    {
      slotId: 2,
      facilityId: 1,
      date: "2025-11-01",
      startTime: "07:00",
      endTime: "08:00",
      duration: "60 minutes",
      maxCapacity: 20,
      availableSpots: 2,
      bookedCount: 18,
      isFull: false,
      price: 500,
      isBookable: true,
    },
    {
      slotId: 3,
      facilityId: 1,
      date: "2025-11-01",
      startTime: "08:00",
      endTime: "09:00",
      duration: "60 minutes",
      maxCapacity: 20,
      availableSpots: 0,
      bookedCount: 20,
      isFull: true,
      price: 500,
      isBookable: false,
      unavailableReason: "Fully booked",
    },
    {
      slotId: 4,
      facilityId: 1,
      date: "2025-11-01",
      startTime: "14:00",
      endTime: "15:00",
      duration: "60 minutes",
      maxCapacity: 20,
      availableSpots: 20,
      bookedCount: 0,
      isFull: false,
      price: 500,
      isBookable: true,
    },
    {
      slotId: 5,
      facilityId: 1,
      date: "2025-11-01",
      startTime: "18:00",
      endTime: "19:00",
      duration: "60 minutes",
      maxCapacity: 20,
      availableSpots: 12,
      bookedCount: 8,
      isFull: false,
      price: 600,
      isBookable: true,
    },
  ];

  const handleSlotSelect = (slot: Slot) => {
    setSelectedSlot(slot);
    if (mode === "book") {
      setShowModal(true);
    }
  };

  const handleBookingConfirm = async (
    slotId: number,
    numberOfPeople: number
  ) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.log(`Booking confirmed: Slot ${slotId}, ${numberOfPeople} people`);
    alert(`Booking successful!\nSlot ID: ${slotId}\nPeople: ${numberOfPeople}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Facility Booking
          </h1>
          <p className="text-gray-600">Select a slot to book your session</p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex items-center gap-4 flex-wrap">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mode
            </label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="view">View Only</option>
              <option value="book">User Booking</option>
              <option value="edit">Admin Edit</option>
            </select>
          </div>
        </div>

        {/* Slot Grid */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <SlotGrid
            slots={sampleSlots}
            mode={mode}
            onSlotSelect={handleSlotSelect}
            selectedSlotId={selectedSlot?.slotId}
            loading={false}
          />
        </div>

        {/* Booking Modal */}
        <BookingModal
          slot={selectedSlot}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onConfirm={handleBookingConfirm}
        />
      </div>
    </div>
  );
}
