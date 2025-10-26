import { useState } from "react";
import { useAuth } from "@/store/auth";
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import AvailabilityCalendar from "./AvailabilityCalendar";
import { TimeSlot } from "@/api/schedule";
import { reserveSlot, confirmBooking, Booking } from "@/api/booking";
import { format } from "date-fns";

interface BookingFlowProps {
  clubId: number;
  facilityId: number;
  facilityName: string;
  onComplete?: () => void;
}

type BookingStep = "select-slot" | "reserved" | "payment" | "confirmed";

export default function BookingFlow({
  clubId,
  facilityId,
  facilityName,
  onComplete,
}: BookingFlowProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const [step, setStep] = useState<BookingStep>("select-slot");
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSlotSelect = async (slot: TimeSlot) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please log in to make a booking",
      });
      return;
    }

    setSelectedSlot(slot);
    setError(null);
  };

  const handleReserveSlot = async () => {
    if (!selectedSlot || !user) return;

    try {
      setLoading(true);
      setError(null);

      const reservation = await reserveSlot({
        userId: user.userId,
        clubId,
        facilityId,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        totalPrice: selectedSlot.price,
      });

      setBooking(reservation);
      setStep("reserved");

      toast({
        title: "Slot Reserved!",
        description: "You have 10 minutes to complete payment",
      });
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to reserve slot");
      toast({
        variant: "destructive",
        title: "Reservation Failed",
        description: err.response?.data?.message || "Failed to reserve slot",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!booking) return;

    try {
      setLoading(true);
      setError(null);
      setStep("payment");

      // Simulate payment process
      // In production, integrate with Razorpay/Stripe
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const transactionId = `TXN${Date.now()}`;

      const confirmedBooking = await confirmBooking(booking.id, {
        transactionId,
        amount: booking.totalPrice,
        paymentMethod: "card",
      });

      setBooking(confirmedBooking);
      setStep("confirmed");

      toast({
        title: "Booking Confirmed!",
        description: "Your slot has been booked successfully",
      });

      setTimeout(() => {
        if (onComplete) onComplete();
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Payment failed");
      setStep("reserved");
      toast({
        variant: "destructive",
        title: "Payment Failed",
        description: err.response?.data?.message || "Please try again",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle>Book {facilityName}</CardTitle>
          <CardDescription>
            {step === "select-slot" && "Select your preferred time slot"}
            {step === "reserved" && "Complete payment within 10 minutes"}
            {step === "payment" && "Processing your payment..."}
            {step === "confirmed" && "Booking confirmed!"}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Step 1: Select Slot */}
      {step === "select-slot" && (
        <>
          <AvailabilityCalendar
            facilityId={facilityId}
            onSelectSlot={handleSlotSelect}
          />

          {selectedSlot && (
            <Card>
              <CardHeader>
                <CardTitle>Selected Slot</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Time</p>
                    <p className="font-medium">
                      {format(new Date(selectedSlot.startTime), "hh:mm a")} -{" "}
                      {format(new Date(selectedSlot.endTime), "hh:mm a")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="font-medium">
                      {selectedSlot.duration} minutes
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Price</p>
                    <p className="font-medium text-2xl">
                      ₹{selectedSlot.price}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Platform Fee
                    </p>
                    <p className="font-medium">
                      ₹{(selectedSlot.price * 0.05).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-2xl font-bold">
                      ₹{(selectedSlot.price * 1.05).toFixed(2)}
                    </span>
                  </div>

                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleReserveSlot}
                    disabled={loading}
                  >
                    {loading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Reserve Slot
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Step 2: Reserved - Waiting for Payment */}
      {step === "reserved" && booking && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              Slot Reserved
            </CardTitle>
            <CardDescription>
              Complete payment within{" "}
              {booking.reservedUntil
                ? format(new Date(booking.reservedUntil), "hh:mm a")
                : "10 minutes"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Time:</span>
                <span className="font-medium">
                  {format(new Date(booking.startTime), "PPP hh:mm a")}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Amount:</span>
                <span className="font-medium">₹{booking.totalPrice}</span>
              </div>
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={handlePayment}
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Proceed to Payment
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Processing Payment */}
      {step === "payment" && (
        <Card>
          <CardContent className="py-12 text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-lg font-medium">Processing your payment...</p>
            <p className="text-sm text-muted-foreground">Please wait</p>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Confirmed */}
      {step === "confirmed" && booking && (
        <Card>
          <CardContent className="py-12 text-center space-y-4">
            <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto" />
            <div>
              <h2 className="text-2xl font-bold mb-2">Booking Confirmed!</h2>
              <p className="text-muted-foreground">
                Your booking ID:{" "}
                <span className="font-mono">#{booking.id}</span>
              </p>
            </div>
            <div className="pt-4 space-y-2">
              <p>
                <strong>Date:</strong>{" "}
                {format(new Date(booking.startTime), "PPP")}
              </p>
              <p>
                <strong>Time:</strong>{" "}
                {format(new Date(booking.startTime), "hh:mm a")} -{" "}
                {format(new Date(booking.endTime), "hh:mm a")}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
