import { Schedule } from "@/bookingservice/types/componentTypes";
import { CalendarIcon, Loader2, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { CreateScheduleForm } from "./CreateScheduleForm";
import { bookingApi } from "@/bookingservice/api/api";
import { ScheduleCard } from "./ScheduleCard";
import { useToast } from "@/components/ui/use-toast";
import { Facility } from "@/api/facility";
import { useNavigate } from "react-router-dom";

interface ClubScheduleListProps {
  clubId: number;
  facilityId?: number; // ✅ NEW: Optional - if provided, shows only this facility's schedules
  facility: Facility; // ✅ NEW: Optional - facility details for single-facility view
  facilities?: Facility[]; // ✅ Optional - for club-wide view with multiple facilities
  showCreateButton?: boolean; // ✅ NEW: Control whether to show create button
  onCreateClick?: () => void; // ✅ NEW: Custom create handler from parent
  title?: string; // ✅ NEW: Custom title
  description?: string; // ✅ NEW: Custom description
}

export const ClubScheduleList: React.FC<ClubScheduleListProps> = ({
  clubId,
  facilityId,
  facility,
  facilities = [],
  showCreateButton = true,
  onCreateClick,
  title,
  description,
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("active");
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(
    null
  );

  const handleViewSlots = (schedule: Schedule) => {
    // Navigate to the Slot Management Page
    navigate(`/dashboard/club/${clubId}/schedule/${schedule.id}/slots`, {
      state: { schedule: schedule }, // Pass the full schedule object via state
    });
  };

  // ✅ Fetch schedules based on whether it's facility-specific or club-wide
  const fetchSchedules = async () => {
    try {
      setLoading(true);
      let data: Schedule[];

      if (facilityId) {
        // ✅ Fetch schedules for specific facility
        data = await bookingApi.getFacilitySchedules(facilityId);
      } else {
        // ✅ Fetch all schedules for the club
        data = await bookingApi.getClubSchedules(clubId);
      }

      setSchedules(data);
    } catch (error) {
      console.error("Error fetching schedules:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch schedules",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, [clubId, facilityId]);

  const toggleScheduleStatus = async (
    scheduleId: number,
    isActive: boolean
  ) => {
    try {
      if (isActive) {
        await bookingApi.deactivateSchedule(scheduleId);
      } else {
        await bookingApi.activateSchedule(scheduleId);
      }
      fetchSchedules();
      toast({
        title: "Success",
        description: `Schedule ${
          isActive ? "deactivated" : "activated"
        } successfully`,
      });
    } catch (error) {
      console.error("Error updating schedule:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update schedule status",
      });
    }
  };

  const handleEditSchedule = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setShowCreateForm(true);
  };

  const handleCreateSchedule = () => {
    if (onCreateClick) {
      // ✅ Use parent's create handler if provided
      onCreateClick();
    } else {
      // ✅ Use internal form
      setSelectedSchedule(null);
      setShowCreateForm(true);
    }
  };

  const handleFormClose = () => {
    setShowCreateForm(false);
    setSelectedSchedule(null);
  };

  const handleFormSuccess = () => {
    fetchSchedules();
    handleFormClose();
    toast({
      title: "Success",
      description: selectedSchedule
        ? "Schedule updated successfully"
        : "Schedule created successfully",
    });
  };

  const handleDeleteSchedule = async (scheduleId: number) => {
    if (!confirm("Are you sure you want to delete this schedule?")) return;

    try {
      await bookingApi.deactivateSchedule(scheduleId);
      fetchSchedules();
      toast({
        title: "Success",
        description: "Schedule deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting schedule:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete schedule",
      });
    }
  };

  // ✅ Filter schedules based on selected filter
  const filteredSchedules = schedules.filter((schedule) => {
    if (filter === "active") return schedule.isActive;
    if (filter === "inactive") return !schedule.isActive;
    return true;
  });

  // ✅ Helper to get facility name for a schedule
  const getFacilityName = (schedule: Schedule): string => {
    if (facility) {
      // Single facility view
      return facility.name;
    }
    // Club-wide view - look up in facilities array
    return (
      facilities.find((f) => f.id === schedule.facilityId)?.name ||
      "Unknown Facility"
    );
  };

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
          <h2 className="text-2xl font-bold text-gray-900">
            {title ||
              (facilityId
                ? `Schedules for ${facility?.name || "Facility"}`
                : "All Schedules")}
          </h2>
          <p className="text-gray-600 mt-1">
            {description ||
              (facilityId
                ? "Manage schedules for this facility"
                : "Manage all facility schedules across the club")}
          </p>
        </div>
        {showCreateButton && (
          <button
            onClick={handleCreateSchedule}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Schedule
          </button>
        )}
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
            {filter === "all"
              ? "Create your first schedule to start managing slots"
              : `No ${filter} schedules found`}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredSchedules.map((schedule) => {
            const facilityName = getFacilityName(schedule);
            return (
              <div
                key={schedule.id}
                className="cursor-pointer"
                onClick={() => handleViewSlots(schedule)}
              >
                <ScheduleCard
                  schedule={schedule}
                  facilityName={facilityName}
                  onToggleStatus={toggleScheduleStatus}
                  onEdit={(e, schedule) => {
                    // ✅ Receive event
                    e.stopPropagation(); // Redundant but safe
                    handleEditSchedule(schedule);
                  }}
                  onDelete={(e, scheduleId) => {
                    // ✅ Receive event
                    e.stopPropagation(); // Redundant but safe
                    handleDeleteSchedule(scheduleId);
                  }}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Schedule Modal */}
      {showCreateForm && !onCreateClick && (
        <CreateScheduleForm
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
          clubId={clubId}
          facility={facility}
        />
      )}
    </div>
  );
};
