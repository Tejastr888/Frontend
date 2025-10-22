// import { useAuth } from "@/store/auth";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Building2, Calendar, DollarSign, Plus, TrendingUp } from "lucide-react";

// export default function ClubDashboard() {
//   const { user } = useAuth();

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold">Club Management</h1>
//           <p className="text-muted-foreground">
//             Manage your sports venues and bookings
//           </p>
//         </div>
//         <Button>
//           <Plus className="mr-2 h-4 w-4" />
//           Add New Venue
//         </Button>
//       </div>

//       {/* Stats */}
//       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Total Venues</CardTitle>
//             <Building2 className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">5</div>
//             <p className="text-xs text-muted-foreground">+2 from last month</p>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Bookings</CardTitle>
//             <Calendar className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">45</div>
//             <p className="text-xs text-muted-foreground">+12% from last week</p>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Revenue</CardTitle>
//             <DollarSign className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">₹45,231</div>
//             <p className="text-xs text-muted-foreground">+19% from last month</p>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Growth</CardTitle>
//             <TrendingUp className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">+23%</div>
//             <p className="text-xs text-muted-foreground">Since last month</p>
//           </CardContent>
//         </Card>
//       </div>

//       {/* My Venues */}
//       <Card>
//         <CardHeader>
//           <CardTitle>My Venues</CardTitle>
//           <CardDescription>Manage your sports facilities</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="space-y-4">
//             {[
//               { name: "Swimming Pool A", bookings: 23, status: "Active" },
//               { name: "Badminton Court 1", bookings: 15, status: "Active" },
//               { name: "Tennis Court", bookings: 7, status: "Maintenance" },
//             ].map((venue, idx) => (
//               <div
//                 key={idx}
//                 className="flex items-center justify-between border-b pb-4 last:border-0"
//               >
//                 <div>
//                   <p className="font-medium">{venue.name}</p>
//                   <p className="text-sm text-muted-foreground">
//                     {venue.bookings} bookings this week
//                   </p>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <span
//                     className={`text-xs px-2 py-1 rounded ${
//                       venue.status === "Active"
//                         ? "bg-green-100 text-green-800"
//                         : "bg-yellow-100 text-yellow-800"
//                     }`}
//                   >
//                     {venue.status}
//                   </span>
//                   <Button size="sm" variant="outline">
//                     Manage
//                   </Button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }


import { useState, useEffect } from "react";
import { useAuth } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Calendar, DollarSign, Plus, TrendingUp, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Club, Sport, getMyClub, getMyClubSports } from "@/api/club";
import ClubRegistrationForm from "@/components/club/ClubRegistrationForm";
import { Icons } from "@/components/ui/icons";

export default function ClubDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [club, setClub] = useState<Club | null>(null);
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRegistration, setShowRegistration] = useState(false);

  useEffect(() => {
    loadClubData();
  }, []);

  const loadClubData = async () => {
    try {
      setLoading(true);
      const clubData = await getMyClub();
      setClub(clubData);
      
      if (clubData) {
        const sportsData = await getMyClubSports();
        setSports(sportsData);
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
    return (
      <div className="space-y-6">
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <CardTitle className="text-yellow-800 dark:text-yellow-200">
                Club Pending Approval
              </CardTitle>
            </div>
            <CardDescription className="text-yellow-700 dark:text-yellow-300">
              Your club "{club.name}" has been submitted and is awaiting admin approval.
              You'll receive an email notification once it's reviewed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>Club Name:</strong> {club.name}</p>
              <p><strong>Location:</strong> {club.location}</p>
              <p><strong>Contact:</strong> {club.contact}</p>
              <p><strong>Submitted:</strong> {new Date(club.createdAt).toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Club rejected
  if (club.status === "REJECTED") {
    return (
      <div className="space-y-6">
        <Card className="border-red-200 bg-red-50 dark:bg-red-900/10">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <CardTitle className="text-red-800 dark:text-red-200">
                Club Application Rejected
              </CardTitle>
            </div>
            <CardDescription className="text-red-700 dark:text-red-300">
              Unfortunately, your club application was not approved. 
              Please contact support for more information or submit a new application.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => setShowRegistration(true)}
              className="bg-red-600 hover:bg-red-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Submit New Application
            </Button>
          </CardContent>
        </Card>

        {showRegistration && (
          <ClubRegistrationForm onSuccess={handleRegistrationSuccess} />
        )}
      </div>
    );
  }

  // Club approved - show full dashboard
  const activeSports = sports.filter(sport => sport.isActive);
  const totalBookings = sports.reduce((sum, sport) => sum + (Math.floor(Math.random() * 20) + 5), 0); // Mock data
  const totalRevenue = sports.reduce((sum, sport) => sum + (sport.pricePerHour * (Math.floor(Math.random() * 100) + 10)), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Club Management</h1>
          <p className="text-muted-foreground">
            Welcome back, {club.name}
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add New Sport
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sports</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSports.length}</div>
            <p className="text-xs text-muted-foreground">
              {sports.length - activeSports.length} inactive
            </p>
          </CardContent>
        </Card>

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
            <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{Math.floor(Math.random() * 30) + 10}%</div>
            <p className="text-xs text-muted-foreground">Since last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Sports List */}
      <Card>
        <CardHeader>
          <CardTitle>My Sports Facilities</CardTitle>
          <CardDescription>Manage your sports venues and pricing</CardDescription>
        </CardHeader>
        <CardContent>
          {sports.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No sports facilities added yet</p>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Sport
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {sports.map((sport) => (
                <div
                  key={sport.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0"
                >
                  <div>
                    <p className="font-medium">{sport.name}</p>
                    <p className="text-sm text-muted-foreground">
                      ₹{sport.pricePerHour}/hour • Capacity: {sport.capacity}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {sport.availability}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        sport.isActive
                          ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
                      }`}
                    >
                      {sport.isActive ? "Active" : "Inactive"}
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
    </div>
  );
}

