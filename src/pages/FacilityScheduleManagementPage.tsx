import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Building2, Loader2, ArrowLeft, Plus } from "lucide-react"; // ✅ Added Plus icon
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Facility, getFacilityById } from "@/api/facility";
import { ClubScheduleList } from "@/bookingservice/components/schedule/ClubScheduleList";
import { CreateScheduleForm } from "@/bookingservice/components/schedule/CreateScheduleForm";

export default function FacilityScheduleManagementPage() {
  const { clubId, facilityId } = useParams<{
    clubId: string;
    facilityId: string;
  }>();

  const navigate = useNavigate();
  const { toast } = useToast();

  const currentClubId = parseInt(clubId || "0");
  const currentFacilityId = parseInt(facilityId || "0");

  const [facility, setFacility] = useState<Facility | null>(null);
  const [loading, setLoading] = useState(true);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (currentFacilityId && currentClubId) {
      loadFacility();
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Invalid facility or club ID",
      });
      navigate("/dashboard/club");
    }
  }, [currentFacilityId, currentClubId]);

  const loadFacility = async () => {
    try {
      setLoading(true);
      const facilityData = await getFacilityById(
        currentClubId,
        currentFacilityId
      );
      setFacility(facilityData);
    } catch (error) {
      console.error("Failed to load facility:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load facility details",
      });
      navigate("/dashboard/club");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSchedule = () => {
    setShowScheduleForm(true);
  };

  const handleScheduleSuccess = () => {
    setShowScheduleForm(false);
    setRefreshKey((prev) => prev + 1);
    toast({
      title: "Success!",
      description: "Schedule created successfully",
    });
  };

  const handleScheduleFormClose = () => {
    setShowScheduleForm(false);
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
      {/* ✅ Updated Page Header with Create Button on Right */}
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
              {facility.name} - Schedule Management
            </h1>
            <p className="text-gray-600">
              Manage pricing and time slots for this facility
            </p>
          </div>
        </div>

        {/* ✅ Create Schedule Button on Right */}
        <button
          onClick={handleCreateSchedule}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Create Schedule
        </button>
      </div>

      {/* ✅ ClubScheduleList now handles ALL schedule listing logic */}
      <ClubScheduleList
        key={refreshKey}
        clubId={currentClubId}
        facilityId={currentFacilityId}
        facility={facility}
        showCreateButton={false} // ✅ Hide built-in create button
        onCreateClick={handleCreateSchedule}
        title={`Schedules for ${facility.name}`}
        description="Manage pricing and time slots for this facility"
      />

      {/* Schedule Creation Form Modal */}
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
