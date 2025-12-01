import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import OAuth2RedirectHandler from "./pages/OAuth2RedirectHandler";
import DashboardLayout from "./components/DashboardLayout";
import ProtectedRoute from "./components/auth/protected-route";
import UserDashboard from "./pages/dashboards/UserDashboard";
import ClubDashboard from "./pages/dashboards/ClubDashboard";
import AdminDashboard from "./pages/dashboards/AdminDashboard";
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "./store/auth";
import BrowseVenuesPage from "./pages/BrowseVenuesPage";
import FacilityBookingPage from "./pages/FacilityBookingPage";
import UserProfilePage from "./pages/UserProfilePage";
import FacilityScheduleManagementPage from "./pages/FacilityScheduleManagementPage";
import ScheduleSlotManagementPage from "./pages/ScheduleSlotManagementPage";
import BookingDetailsPage from "./pages/BookingDetailsPage";
import Profile from "./userservice/pages/Profile";

function DashboardRedirect() {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" />;

  switch (user.role) {
    case "USER":
      return <Navigate to="/dashboard/user" replace />;
    case "CLUB":
      return <Navigate to="/dashboard/club" replace />;
    case "ADMIN":
      return <Navigate to="/dashboard/admin" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
}

export default function App() {
  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
        <Route path="/browse-venues" element={<BrowseVenuesPage />} />
        <Route path="/book/:facilityId" element={<FacilityBookingPage />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route
            path="/dashboard/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardRedirect />} />
            <Route
              path="/dashboard/user"
              element={
                <ProtectedRoute allowedRoles={["USER"]}>
                  <UserDashboard />
                </ProtectedRoute>
              }
            />
            {/* ✅ BOOKING DETAILS ROUTE - Add here */}
            <Route
              path="/bookings/:bookingId"
              element={
                <ProtectedRoute allowedRoles={["USER"]}>
                  <BookingDetailsPage />
                </ProtectedRoute>
              }
            />
            {/* Club Routes with role protection */}
            <Route element={<ProtectedRoute allowedRoles={["CLUB"]} />}>
              <Route path="/dashboard/club" element={<ClubDashboard />} />
              {/* ✅ NEW ROUTE for Facility Schedule Management */}
              <Route
                path="/dashboard/club/:clubId/facility/:facilityId"
                element={<FacilityScheduleManagementPage />}
              />
              <Route
                path="/dashboard/club/:clubId/schedule/:scheduleId/slots"
                element={<ScheduleSlotManagementPage />}
              />
            </Route>
            <Route
              path="/dashboard/admin"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
          </Route>
        </Route>

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
      <Toaster />
    </>
  );
}
