import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Building2, Calendar, Loader2, Plus, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { bookingApi } from "@/bookingservice/api/api";
import { Schedule } from "@/bookingservice/types/componentTypes";
import { ScheduleCard } from "@/bookingservice/components/schedule/ScheduleCard";
import { CreateScheduleForm } from "@/bookingservice/components/schedule/CreateScheduleForm";
import { Facility, getFacilityById } from "@/api/facility"; // ✅ Assuming you have this function

export default function FacilityScheduleManagementPage() {
  // ✅ Extract clubId and facilityId from route parameters
  const { clubId, facilityId } = useParams<{
    clubId: string;
    facilityId: string;
  }>();

  const navigate = useNavigate();
  const { toast } = useToast();

  // Convert to numbers
  const currentClubId = parseInt(clubId || "0");
  const currentFacilityId = parseInt(facilityId || "0");

  const [facility, setFacility] = useState<Facility | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(
    null
  );

  const loadSchedules = async () => {
    try {
      setLoading(true);
      const data = await bookingApi.getFacilitySchedules(currentFacilityId);
      setSchedules(data);
    } catch (error) {
      console.error("Failed to load schedules:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load schedules for facility",
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ Load both facility details and schedules
  useEffect(() => {
    if (currentFacilityId && currentClubId) {
      loadData();
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Invalid facility or club ID",
      });
      navigate("/dashboard/club");
    }
  }, [currentFacilityId, currentClubId]);

  const loadData = async () => {
    try {
      setLoading(true);
      // Fetch facility details
      const facilityData = await getFacilityById(
        currentClubId,
        currentFacilityId
      );
      setFacility(facilityData);

      // Fetch schedules for the facility
      const schedulesData = await bookingApi.getFacilitySchedules(
        currentFacilityId
      );
      setSchedules(schedulesData);
    } catch (error) {
      console.error("Failed to load data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load facility details or schedules",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSchedule = () => {
    setSelectedSchedule(null);
    setShowScheduleForm(true);
  };

  const handleEditSchedule = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setShowScheduleForm(true);
  };

  const handleScheduleSuccess = () => {
    setShowScheduleForm(false);
    setSelectedSchedule(null);
    loadData();
    toast({
      title: "Success!",
      description: selectedSchedule
        ? "Schedule updated successfully"
        : "Schedule created successfully",
    });
  };

  const handleScheduleFormClose = () => {
    setShowScheduleForm(false);
    setSelectedSchedule(null);
  };

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
      loadData();
    } catch (error) {
      console.error("Error updating schedule:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update schedule status.",
      });
    }
  };

  const handleDeleteSchedule = async (scheduleId: number) => {
    if (
      !confirm(
        "Are you sure you want to deactivate and 'delete' this schedule?"
      )
    )
      return;

    try {
      await bookingApi.deactivateSchedule(scheduleId);
      loadData();
      toast({
        title: "Success!",
        description: "Schedule deactivated successfully",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to deactivate schedule",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!facility) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">Facility not found</p>
          <Button onClick={() => navigate("/dashboard/club")}>
            Back to Club Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/dashboard/club"
            className="text-gray-500 hover:text-gray-800"
          >
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <Building2 className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Schedules for {facility.name}
            </h1>
            <p className="text-gray-600">
              Manage pricing and time slots for this facility.
            </p>
          </div>
        </div>
        <Button onClick={handleCreateSchedule}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Schedule
        </Button>
      </div>

      {/* Schedule List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold border-b pb-2">
          Active Schedules ({schedules.length})
        </h2>

        {schedules.length === 0 ? (
          <Card className="shadow-none border-dashed">
            <CardContent className="py-12 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                No schedules created yet for {facility.name}.
              </p>
              <Button onClick={handleCreateSchedule}>
                <Plus className="mr-2 h-4 w-4" />
                Create First Schedule
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {schedules.map((schedule) => (
              <ScheduleCard
                key={schedule.id}
                schedule={schedule}
                facilityName={facility.name}
                onToggleStatus={toggleScheduleStatus}
                onEdit={handleEditSchedule}
                onDelete={handleDeleteSchedule}
              />
            ))}
          </div>
        )}
      </div>

      {/* Schedule Creation/Update Form Modal */}
      {showScheduleForm && (
        <CreateScheduleForm
          onClose={handleScheduleFormClose}
          onSuccess={handleScheduleSuccess}
          clubId={currentClubId}
          facility={facility}
        />
      )}
    </div>
  );
}
