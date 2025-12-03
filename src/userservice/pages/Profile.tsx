import { useState } from "react";
import { useQuery } from "@apollo/client/react";
import { GET_MY_PROFILE } from "@/userservice/graphql/profile";
import { UserProfile } from "@/userservice/types/profile";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Icons } from "@/components/ui/icons";
import { User, MapPin, Calendar, Edit, Trophy } from "lucide-react";
import { format } from "date-fns";
import CreateProfileDialog from "../components/profile/CreateProfileDialog";
import EditProfileDialog from "../components/profile/EditProfileDialog";

type MyProfileQueryData = {
  myProfile: UserProfile | null;
};

export default function Profile() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const { loading, error, data, refetch } =
    useQuery<MyProfileQueryData>(GET_MY_PROFILE);

  if (error && !error.message.includes("Profile not found")) {
    console.error("Error fetching profile:", error);
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Icons.spinner className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const profileNotFound =
    !data?.myProfile || error?.message.includes("Profile not found");

  // No profile exists - show create profile UI
  if (profileNotFound) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <CardTitle>Create Your Profile</CardTitle>
            <CardDescription>
              Set up your sports profile to get started
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => setShowCreateDialog(true)}>
              Create Profile
            </Button>
          </CardContent>
        </Card>

        <CreateProfileDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onSuccess={() => {
            setShowCreateDialog(false);
            refetch();
          }}
        />
      </div>
    );
  }

  // Error state (but not "Profile not found")
  if (error && !error.message.includes("Profile not found")) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-destructive mb-4">Error loading profile</p>
        <Button onClick={() => refetch()}>Try Again</Button>
      </div>
    );
  }

  // From here on, profile exists
  const profile = data!.myProfile!;

  const stats = profile.stats ?? null;
  const favoriteSports = profile.favoriteSports ?? [];
  const achievements = profile.achievements ?? [];
  const socialLinks = profile.socialLinks ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt="Profile"
                className="h-20 w-20 rounded-full object-cover border-2"
              />
            ) : (
              <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
                <User className="h-10 w-10 text-muted-foreground" />
              </div>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold">My Profile</h1>
            {profile.createdAt && (
              <p className="text-muted-foreground">
                Member since {format(new Date(profile.createdAt), "MMMM yyyy")}
              </p>
            )}
          </div>
        </div>
        <Button onClick={() => setShowEditDialog(true)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Profile
        </Button>
      </div>

      {/* Profile Info */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {profile.bio && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Bio</p>
                <p>{profile.bio}</p>
              </div>
            )}

            {profile.city && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>
                  {profile.city}
                  {profile.state && `, ${profile.state}`}
                  {profile.country && `, ${profile.country}`}
                </span>
              </div>
            )}

            {profile.dateOfBirth && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  Born on {format(new Date(profile.dateOfBirth), "PPP")}
                </span>
              </div>
            )}

            {profile.skillLevel && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Skill Level
                </p>
                <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
                  {profile.skillLevel}
                </span>
              </div>
            )}

            {profile.isProfessional && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Professional Player
                </p>
                <p className="text-sm">
                  {profile.yearsOfExperience ?? 0} years of experience
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Card */}
        {stats && profile.showStats && (
          <Card>
            <CardHeader>
              <CardTitle>Stats</CardTitle>
              <CardDescription>Your booking history</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-2xl font-bold">{stats.totalBookings}</p>
                  <p className="text-sm text-muted-foreground">
                    Total Bookings
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {stats.completedBookings}
                  </p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {stats.totalHoursPlayed}h
                  </p>
                  <p className="text-sm text-muted-foreground">Hours Played</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    ₹{stats.totalSpent.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                </div>
              </div>

              {stats.currentStreakDays > 0 && (
                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    <div>
                      <p className="font-medium">
                        {stats.currentStreakDays} day streak!
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Longest: {stats.longestStreakDays} days
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Favorite Sports */}
      {favoriteSports.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Favorite Sports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {favoriteSports.map((sport) => (
                <span
                  key={sport.id}
                  className="px-3 py-1 rounded-full bg-secondary text-sm"
                >
                  Sport #{sport.sportId}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Achievements */}
      {achievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {achievements.map((achievement, index) => (
                <li key={index} className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  <span>{achievement}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Social Links */}
      {socialLinks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Social Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {socialLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary hover:underline"
                >
                  <span className="font-medium">{link.platform}:</span>
                  <span>@{link.username}</span>
                  {link.isVerified && (
                    <span className="text-xs text-green-500">✓ Verified</span>
                  )}
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Profile Dialog */}
      <EditProfileDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        currentProfile={profile}
        onSuccess={() => {
          setShowEditDialog(false);
          refetch();
        }}
      />
    </div>
  );
}
