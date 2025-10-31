import { Schedule } from "@/bookingservice/types/componentTypes";
import {
  Calendar,
  CalendarIcon,
  Clock,
  DollarSign,
  Loader2,
  Plus,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { CreateScheduleForm } from "./CreateScheduleForm";
import { bookingApi } from "@/bookingservice/api/api";
import { Facility } from "@/api/facility";

export const ScheduleList: React.FC<{
  clubId: number;
  facility: Facility;
}> = ({ clubId, facility }) => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("active");

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      // ** Use the new API method **
      const data = await bookingApi.getClubSchedules(clubId);
      setSchedules(data);
    } catch (error) {
      console.error("Error fetching schedules:", error);
      // Consider adding a user-facing error message here
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, [clubId]);

  const toggleScheduleStatus = async (
    scheduleId: number,
    isActive: boolean
  ) => {
    try {
      // ** Use the new API methods for activation/deactivation **
      if (isActive) {
        await bookingApi.deactivateSchedule(scheduleId);
      } else {
        await bookingApi.activateSchedule(scheduleId);
      }

      fetchSchedules(); // Re-fetch to update the list
    } catch (error) {
      console.error("Error updating schedule:", error);
      // Consider adding a user-facing error message here
    }
  };

  const filteredSchedules = schedules.filter((schedule) => {
    if (filter === "active") return schedule.isActive;
    if (filter === "inactive") return !schedule.isActive;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Schedules</h2>
          <p className="text-gray-600 mt-1">
            Manage your facility schedules and slots
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Schedule
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {(["all", "active", "inactive"] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === status
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Schedule Cards */}
      {filteredSchedules.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">No schedules found</p>
          <p className="text-sm text-gray-500 mt-1">
            Create your first schedule to start managing slots
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredSchedules.map((schedule) => (
            <div
              key={schedule.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {facility.name || "Facility"}
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
                    <p className="text-sm text-gray-600 mt-1">
                      {schedule.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={() =>
                    toggleScheduleStatus(schedule.id, schedule.isActive)
                  }
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    schedule.isActive
                      ? "bg-red-50 text-red-700 hover:bg-red-100"
                      : "bg-green-50 text-green-700 hover:bg-green-100"
                  }`}
                >
                  {schedule.isActive ? "Deactivate" : "Activate"}
                </button>
              </div>

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
          ))}
        </div>
      )}

      {/* Create Schedule Modal */}
      {showCreateForm && (
        <CreateScheduleForm
          onClose={() => setShowCreateForm(false)}
          onSuccess={fetchSchedules}
          clubId={clubId}
          facility={facility}
        />
      )}
    </div>
  );
};
