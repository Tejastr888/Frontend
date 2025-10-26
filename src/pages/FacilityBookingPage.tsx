import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Users,
  Award,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import BookingFlow from "@/components/booking/BookingFlow";
import { PublicFacility, getFacilityById } from "@/api/public";
import { Icons } from "@/components/ui/icons";

export default function FacilityBookingPage() {
  const { facilityId } = useParams<{ facilityId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const [facility, setFacility] = useState<PublicFacility | null>(
    location.state?.facility || null
  );
  const [loading, setLoading] = useState(!facility);

  useEffect(() => {
    if (!facility && facilityId) {
      loadFacility();
    }
  }, [facilityId]);

  const loadFacility = async () => {
    if (!facilityId) return;

    try {
      setLoading(true);
      const data = await getFacilityById(parseInt(facilityId));
      setFacility(data);
    } catch (error) {
      console.error("Failed to load facility:", error);
      navigate("/browse-venues");
    } finally {
      setLoading(false);
    }
  };

  const handleBookingComplete = () => {
    navigate("/dashboard/user");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Icons.spinner className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!facility) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card>
          <CardContent className="py-16 text-center">
            <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">Facility not found</h3>
            <p className="text-muted-foreground mb-6">
              The facility you're looking for doesn't exist or has been removed
            </p>
            <Button onClick={() => navigate("/browse-venues")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Browse Venues
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => navigate("/browse-venues")}
        className="hover:bg-secondary"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Browse
      </Button>

      {/* Facility Details Card */}
      <Card className="shadow-lg">
        <CardHeader className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1 space-y-2">
              <CardTitle className="text-3xl font-bold">
                {facility.name}
              </CardTitle>
              <CardDescription className="flex flex-col sm:flex-row sm:items-center gap-3 text-base">
                <span className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 flex-shrink-0" />
                  <span className="font-medium">{facility.clubName}</span>
                </span>
                {facility.location && (
                  <>
                    <span className="hidden sm:inline text-muted-foreground">
                      •
                    </span>
                    <span className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      <span>{facility.location}</span>
                    </span>
                  </>
                )}
              </CardDescription>
            </div>
            <Badge className="text-sm px-4 py-2 whitespace-nowrap">
              {facility.facilityType}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Key Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex flex-col gap-2 p-4 bg-secondary/50 rounded-lg">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-5 w-5" />
                <span className="text-sm font-medium">Capacity</span>
              </div>
              <p className="text-2xl font-bold">{facility.capacity}</p>
              <p className="text-xs text-muted-foreground">people max</p>
            </div>

            <div className="flex flex-col gap-2 p-4 bg-secondary/50 rounded-lg">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Award className="h-5 w-5" />
                <span className="text-sm font-medium">Primary Sport</span>
              </div>
              <p className="text-xl font-bold truncate">
                {facility.primarySport}
              </p>
            </div>

            <div className="sm:col-span-2 flex flex-col gap-2 p-4 bg-secondary/50 rounded-lg">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle2 className="h-5 w-5" />
                <span className="text-sm font-medium">Available Sports</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-1">
                {facility.supportedSports &&
                facility.supportedSports.length > 0 ? (
                  facility.supportedSports.map((sport) => (
                    <Badge key={sport.id} variant="outline" className="text-sm">
                      {sport.name}
                    </Badge>
                  ))
                ) : (
                  <Badge variant="outline" className="text-sm">
                    {facility.primarySport}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          {facility.description && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                About This Facility
              </h3>
              <p className="text-sm leading-relaxed">{facility.description}</p>
            </div>
          )}

          {/* Amenities */}
          {facility.amenities && facility.amenities.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Available Amenities
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {facility.amenities.map((amenity) => (
                  <div
                    key={amenity.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-secondary/50 transition-colors"
                  >
                    <span className="text-sm font-medium">
                      {amenity.type || amenity.type.replace(/_/g, " ")}
                    </span>
                    {amenity.additionalCost > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        +₹{amenity.additionalCost}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Booking Flow */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Select Date & Time</h2>
        <BookingFlow
          clubId={facility.clubId}
          facilityId={facility.id}
          facilityName={facility.name}
          onComplete={handleBookingComplete}
        />
      </div>
    </div>
  );
}
