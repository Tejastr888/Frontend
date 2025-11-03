import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  Navigation,
  Phone,
  Mail,
  Building2,
  Award,
  ExternalLink,
  Download,
  Share2,
  MessageSquare,
  Star,
  Loader2,
} from "lucide-react";
import { bookingApi } from "@/bookingservice/api/api";
// ✅ Use club API
import { BookingResponse } from "@/bookingservice/types/types";
import { Facility, getFacilityById } from "@/api/facility";
import { getClubById } from "@/api/club";
// ✅ Import Facility type

const BookingDetailsPage = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();

  const [booking, setBooking] = useState<BookingResponse | null>(null);
  const [facility, setFacility] = useState<Facility | null>(null);
  const [clubDetails, setClubDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (bookingId) {
      loadBookingDetails(parseInt(bookingId));
    }
  }, [bookingId]);

  const loadBookingDetails = async (id: number) => {
    try {
      setLoading(true);
      setError(null);

      // ✅ Fetch booking details
      const bookingData = await bookingApi.getBookingById(id);
      setBooking(bookingData);

      // ✅ Fetch facility details using facility API
      try {
        const facilityData = await getFacilityById(
          bookingData.clubId,
          bookingData.facilityId
        );
        setFacility(facilityData);
      } catch (err) {
        console.error("Failed to fetch facility details:", err);
      }

      // ✅ Fetch club details
      try {
        const clubData = await getClubById(bookingData.clubId);
        setClubDetails(clubData);
      } catch (err) {
        console.error("Failed to fetch club details:", err);
      }
    } catch (error: any) {
      console.error("Failed to load booking:", error);
      setError("Failed to load booking details");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    if (!bookingId) return;

    setCancelling(true);
    try {
      await bookingApi.cancelBooking(parseInt(bookingId), {
        reason: "User cancellation",
      });

      await loadBookingDetails(parseInt(bookingId));
      alert("Booking cancelled successfully");
    } catch (error: any) {
      console.error("Failed to cancel booking:", error);
      alert("Failed to cancel booking");
    } finally {
      setCancelling(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      CONFIRMED: "bg-green-100 text-green-800 border-green-200",
      RESERVED: "bg-yellow-100 text-yellow-800 border-yellow-200",
      CANCELLED: "bg-red-100 text-red-800 border-red-200",
      COMPLETED: "bg-blue-100 text-blue-800 border-blue-200",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return <CheckCircle className="w-5 h-5" />;
      case "CANCELLED":
        return <XCircle className="w-5 h-5" />;
      case "RESERVED":
        return <Clock className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {error || "Booking not found"}
          </h3>
          <button
            onClick={() => navigate("/dashboard/user")}
            className="text-blue-600 hover:text-blue-700 font-medium mt-4"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const bookingDate = new Date(`${booking.slotDate}T${booking.startTime}`);
  const canCancel = booking.status === "CONFIRMED" && booking.canBeCancelled;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate("/dashboard/user")}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </button>
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <Share2 className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <Download className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  {getStatusIcon(booking.status)}
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      Booking #{booking.id}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                      Booked on{" "}
                      {new Date(booking.createdAt).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(
                    booking.status
                  )}`}
                >
                  {booking.status}
                </span>
              </div>

              {/* Booking Timeline */}
              <div className="relative border-l-2 border-gray-200 ml-3 pl-8 space-y-6">
                <div>
                  <div className="absolute left-0 -ml-[9px] w-4 h-4 bg-green-500 rounded-full border-4 border-white" />
                  <div className="text-sm font-semibold text-gray-900">
                    Booking Confirmed
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(booking.createdAt).toLocaleString()}
                  </div>
                </div>

                <div>
                  <div className="absolute left-0 -ml-[9px] w-4 h-4 bg-blue-500 rounded-full border-4 border-white" />
                  <div className="text-sm font-semibold text-gray-900">
                    Scheduled Session
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {bookingDate.toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}{" "}
                    at {booking.startTime}
                  </div>
                </div>
              </div>
            </div>

            {/* Facility Details */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Building2 className="w-6 h-6" />
                  {facility?.name || `Facility #${booking.facilityId}`}
                </h2>
                <p className="text-blue-100 text-sm mt-1">
                  {clubDetails?.name || `Club #${booking.clubId}`}
                </p>
              </div>

              <div className="p-6 space-y-6">
                {/* Quick Info Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <Award className="w-8 h-8 text-blue-600" />
                    <div>
                      <div className="text-xs text-gray-500 font-medium">
                        Sport
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        {facility?.primarySport || "N/A"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <Users className="w-8 h-8 text-blue-600" />
                    <div>
                      <div className="text-xs text-gray-500 font-medium">
                        Capacity
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        {facility?.capacity || "N/A"} people
                      </div>
                    </div>
                  </div>
                </div>

                {/* Facility Type */}
                {facility?.facilityType && (
                  <div className="flex items-center gap-3 p-4 bg-purple-50 border border-purple-100 rounded-xl">
                    <Building2 className="w-5 h-5 text-purple-600" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        Facility Type
                      </div>
                      <div className="text-sm text-purple-700 capitalize">
                        {facility.facilityType}
                      </div>
                    </div>
                  </div>
                )}

                {/* Amenities */}
                {facility?.amenities && facility.amenities.length > 0 && (
                  <div className="pt-4 border-t">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">
                      Available Amenities
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {facility.amenities.map((amenity) => (
                        <div
                          key={amenity.id}
                          className="flex items-center gap-2 p-2 bg-green-50 border border-green-100 rounded-lg"
                        >
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-xs text-green-700 capitalize">
                            {amenity.name || amenity.type}
                            {amenity.additionalCost > 0 &&
                              ` (+₹${amenity.additionalCost})`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Session Details */}
                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                    <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        Date & Time
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {bookingDate.toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                      <div className="text-sm font-semibold text-blue-900 mt-1">
                        {booking.startTime} - {booking.endTime}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <Users className="w-5 h-5 text-gray-600" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        Attendees
                      </div>
                      <div className="text-sm text-gray-600">
                        {booking.numberOfPeople} people
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {facility?.description && (
                  <div className="pt-4 border-t">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">
                      Description
                    </h4>
                    <p className="text-sm text-gray-600">
                      {facility.description}
                    </p>
                  </div>
                )}

                {/* Location */}
                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-red-500 mt-1" />
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-900">
                        Location
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {clubDetails?.location || "N/A"}
                      </div>
                    </div>
                  </div>

                  {clubDetails?.address?.googleMapsLink && (
                    <a
                      href={clubDetails.address.googleMapsLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
                    >
                      <Navigation className="w-4 h-4" />
                      Get Directions
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>

                {/* Contact Info */}
                <div className="space-y-3 pt-4 border-t">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Contact Information
                  </h3>
                  <div className="space-y-2">
                    {clubDetails?.contact && (
                      <a
                        href={`tel:${clubDetails.contact}`}
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">
                          {clubDetails.contact}
                        </span>
                      </a>
                    )}
                    {clubDetails?.email && (
                      <a
                        href={`mailto:${clubDetails.email}`}
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">
                          {clubDetails.email}
                        </span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Need Help?
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-200 hover:border-blue-600 hover:text-blue-600 rounded-xl font-medium transition-all">
                  <MessageSquare className="w-4 h-4" />
                  Contact Support
                </button>
                <button className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-200 hover:border-blue-600 hover:text-blue-600 rounded-xl font-medium transition-all">
                  <Star className="w-4 h-4" />
                  Rate Experience
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Payment Summary */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Payment Summary
              </h3>

              <div className="space-y-3 mb-4 pb-4 border-b">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Slot Price</span>
                  <span className="font-medium text-gray-900">
                    ₹{booking.totalPrice.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Platform Fee</span>
                  <span className="font-medium text-gray-900">
                    ₹{booking.platformFee.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-6">
                <span className="text-lg font-semibold text-gray-900">
                  Total Paid
                </span>
                <span className="text-2xl font-bold text-blue-600">
                  ₹
                  {(
                    booking.amountPaid ||
                    booking.totalPrice + booking.platformFee
                  ).toFixed(2)}
                </span>
              </div>

              <div className="space-y-2 mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    Payment {booking.paymentStatus}
                  </span>
                </div>
                <div className="text-xs text-green-700">
                  Receipt sent to your email
                </div>
              </div>

              {canCancel && (
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
                >
                  {cancelling ? "Cancelling..." : "Cancel Booking"}
                </button>
              )}

              {!canCancel && booking.status === "CONFIRMED" && (
                <div className="text-xs text-center text-gray-500 p-4 bg-gray-50 rounded-xl">
                  Cancellation available up to 1 hour before the session
                </div>
              )}

              {booking.status === "CANCELLED" && (
                <div className="text-xs text-center text-red-500 p-4 bg-red-50 rounded-xl">
                  This booking has been cancelled
                </div>
              )}
            </div>

            {/* Tips */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
              <h4 className="text-sm font-semibold text-blue-900 mb-3">
                📍 Pro Tips
              </h4>
              <ul className="space-y-2 text-xs text-blue-800">
                <li>• Arrive 10 minutes early</li>
                <li>• Bring your booking ID</li>
                <li>• Check weather conditions</li>
                <li>• Bring appropriate gear</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsPage;
