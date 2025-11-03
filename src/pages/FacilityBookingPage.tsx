import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Users,
  Award,
  CheckCircle2,
  Calendar as CalendarIcon,
} from "lucide-react";
import { format, startOfDay, addDays } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { PublicFacility, getFacilityById } from "@/api/public";
import { Icons } from "@/components/ui/icons";
import { SlotGrid } from "@/bookingservice/components/booking/SlotGrid";
import { BookingModal } from "@/bookingservice/components/booking/BookingModal";
import { bookingApi } from "@/bookingservice/api/api";
import { Slot } from "@/bookingservice/types/types";
import { useToast } from "@/components/ui/use-toast";

export default function FacilityBookingPage() {
  const { facilityId } = useParams<{ facilityId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Facility State
  const [facility, setFacility] = useState<PublicFacility | null>(
    location.state?.facility || null
  );
  const [loadingFacility, setLoadingFacility] = useState(!facility);

  // Booking State
  const [selectedDate, setSelectedDate] = useState<Date>(
    startOfDay(new Date())
  );
  const [slots, setSlots] = useState<any[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  // Load facility details
  useEffect(() => {
    if (!facility && facilityId) {
      loadFacility();
    }
  }, [facilityId]);

  // Load slots when date changes
  useEffect(() => {
    if (facility) {
      loadSlots(selectedDate);
    }
  }, [selectedDate, facility]);

  const loadFacility = async () => {
    if (!facilityId) return;

    try {
      setLoadingFacility(true);
      const data = await getFacilityById(parseInt(facilityId));
      setFacility(data);
    } catch (error) {
      console.error("Failed to load facility:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load facility details",
      });
      navigate("/browse-venues");
    } finally {
      setLoadingFacility(false);
    }
  };

  const loadSlots = async (date: Date) => {
    if (!facility) return;

    try {
      setLoadingSlots(true);
      const dateString = format(date, "yyyy-MM-dd");

      // Fetch available slots for the selected date
      const data = await bookingApi.getAvailableSlots(facility.id, dateString);

      setSlots(data);
    } catch (error) {
      console.error("Failed to load slots:", error);
      setSlots([]);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load available slots",
      });
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSlotSelect = (slot: Slot) => {
    setSelectedSlot(slot);
    setShowBookingModal(true);
  };

  const handleConfirmBooking = async (
    slotId: number,
    numberOfPeople: number
  ) => {
    try {
      // Step 1: Reserve the slot
      const reservation = await bookingApi.reserveSlot({
        slotId,
        numberOfPeople,
      });

      toast({
        title: "Slot Reserved!",
        description: `You have ${reservation.minutesUntilExpiry} minutes to complete payment`,
      });

      // Step 2: In a real app, you'd integrate payment gateway here
      // For now, we'll simulate payment and confirm immediately

      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Step 3: Confirm the booking after "payment"
      const confirmedBooking = await bookingApi.confirmBooking(reservation.id, {
        paymentTransactionId: `mock_pay_${Date.now()}`,
        paymentMethod: "CARD",
      });

      toast({
        title: "Booking Confirmed!",
        description: "Your slot has been successfully booked",
      });

      // Refresh slots to show updated availability
      await loadSlots(selectedDate);

      // Navigate to user dashboard
      setTimeout(() => {
        navigate("/dashboard/user");
      }, 1500);

      return confirmedBooking;
    } catch (error) {
      console.error("Booking failed:", error);
      throw error;
    }
  };

  if (loadingFacility) {
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

      {/* Booking Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Date Picker */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              Select Date
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                if (date) setSelectedDate(startOfDay(date));
              }}
              disabled={(date) => date < startOfDay(new Date())}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        {/* Slots Grid */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                Available Slots - {format(selectedDate, "EEEE, MMMM do, yyyy")}
              </CardTitle>
              <CardDescription>
                Select a time slot to book your session
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SlotGrid
                slots={slots}
                mode="book"
                loading={loadingSlots}
                onSlotSelect={handleSlotSelect}
                selectedSlotId={selectedSlot?.slotId}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal
        slot={selectedSlot}
        isOpen={showBookingModal}
        onClose={() => {
          setShowBookingModal(false);
          setSelectedSlot(null);
        }}
        onConfirm={handleConfirmBooking}
      />
    </div>
  );
}
