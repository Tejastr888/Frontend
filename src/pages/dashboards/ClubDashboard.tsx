import { useState, useEffect } from "react";
import { useAuth } from "@/store/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Building2,
  Calendar,
  DollarSign,
  Plus,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Club, getMyClub } from "@/api/club";
import ClubRegistrationForm from "@/components/club/ClubRegistrationForm";
import { Icons } from "@/components/ui/icons";
import { Facility, getAllFacilities } from "@/api/facility";
import FacilityCreationForm from "@/components/facility/FacilityCreationForm"; // Assuming the form is in the same folder

export default function ClubDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [club, setClub] = useState<Club | null>(null);
  const [facilities, setFacilities] = useState<Facility[]>([]); // Renamed for clarity
  const [loading, setLoading] = useState(true);
  const [showRegistration, setShowRegistration] = useState(false);
  const [showFacilityForm, setShowFacilityForm] = useState(false); // <-- State for the form dialog

  useEffect(() => {
    loadClubData();
  }, []);

  const loadClubData = async () => {
    try {
      setLoading(true);
      const clubData = await getMyClub();
      setClub(clubData);

      if (clubData) {
        const facilitiesData = await getAllFacilities(clubData.id);
        setFacilities(facilitiesData);
      }
    } catch (error: any) {
      console.error("Failed to load club data:", error);
      if (error?.response?.status !== 404) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load club information.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegistrationSuccess = () => {
    setShowRegistration(false);
    loadClubData();
  };

  // <-- Handler to refresh data after creating a new facility
  const handleFacilityCreationSuccess = () => {
    setShowFacilityForm(false); // Close the dialog
    loadClubData(); // Reload the list of facilities
    toast({
      title: "Success!",
      description: "New facility has been added to your club.",
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Icons.spinner className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // No club registered yet
  if (!club) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold">Welcome to Club Management</h1>
          <p className="text-muted-foreground mb-6">
            You haven't registered your club yet. Let's get started!
          </p>
          <Button onClick={() => setShowRegistration(true)} size="lg">
            <Plus className="mr-2 h-5 w-5" />
            Register My Club
          </Button>
        </div>

        {showRegistration && (
          <ClubRegistrationForm onSuccess={handleRegistrationSuccess} />
        )}
      </div>
    );
  }

  // Club status pending approval
  if (club.status === "PENDING") {
    // ... (This section is unchanged)
    return <div>Pending Approval...</div>;
  }

  // Club rejected
  if (club.status === "REJECTED") {
    // ... (This section is unchanged)
    return <div>Rejected...</div>;
  }

  // Club approved - show full dashboard
  // NOTE: Assuming your Facility type has an 'isActive' property from the API
  const activeFacilities = facilities.filter((facility) => facility.isActive);
  const totalBookings = 125; // Mock data
  const totalRevenue = 54230; // Mock data

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Club Management</h1>
          <p className="text-muted-foreground">Welcome back, {club.name}</p>
        </div>
        {/* <-- This button now opens the form --> */}
        <Button onClick={() => setShowFacilityForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Facility
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Facilities
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeFacilities.length}</div>
            <p className="text-xs text-muted-foreground">
              {facilities.length - activeFacilities.length} inactive
            </p>
          </CardContent>
        </Card>
        {/* Other stat cards are unchanged */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBookings}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12.5%</div>
            <p className="text-xs text-muted-foreground">Since last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Facilities List */}
      <Card>
        <CardHeader>
          <CardTitle>My Sports Facilities</CardTitle>
          <CardDescription>
            Manage your sports venues and pricing
          </CardDescription>
        </CardHeader>
        <CardContent>
          {facilities.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                No sports facilities added yet
              </p>
              {/* <-- This button also opens the form --> */}
              <Button onClick={() => setShowFacilityForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Facility
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {facilities.map((facility) => (
                <div
                  key={facility.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0"
                >
                  <div>
                    <p className="font-medium">{facility.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {facility.facilityType} • Capacity: {facility.capacity}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        facility.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {facility.isActive ? "Active" : "Inactive"}
                    </span>
                    <Button size="sm" variant="outline">
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* <-- RENDER THE FORM DIALOG HERE --> */}
      {/* It will be invisible until `showFacilityForm` is true */}
      <FacilityCreationForm
        clubId={club.id}
        open={showFacilityForm}
        onClose={() => setShowFacilityForm(false)}
        onSuccess={handleFacilityCreationSuccess}
      />
    </div>
  );
}
