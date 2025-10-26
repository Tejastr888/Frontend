import { useState, useEffect } from "react";
import { useAuth } from "@/store/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import {
  Calendar,
  MapPin,
  Trophy,
  Star,
  Edit,
  Instagram,
  Twitter,
  Facebook,
  Linkedin,
} from "lucide-react";
import { getMyProfile, UserProfile } from "@/api/userProfile";
import { useToast } from "@/components/ui/use-toast";

export default function UserProfileView() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await getMyProfile();
      setProfile(data);
    } catch (error: any) {
      if (error.response?.status === 404) {
        // Profile doesn't exist yet
        setProfile(null);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load profile",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Icons.spinner className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground mb-4">No profile created yet</p>
          <Button>Create Profile</Button>
        </CardContent>
      </Card>
    );
  }

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case "INSTAGRAM":
        return <Instagram className="h-4 w-4" />;
      case "TWITTER":
        return <Twitter className="h-4 w-4" />;
      case "FACEBOOK":
        return <Facebook className="h-4 w-4" />;
      case "LINKEDIN":
        return <Linkedin className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile.avatarUrl || undefined} />
              <AvatarFallback className="text-2xl">
                {user?.name.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h2 className="text-2xl font-bold">{user?.name}</h2>
                  <p className="text-muted-foreground">{user?.email}</p>
                </div>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>

              {profile.bio && <p className="text-sm mt-2">{profile.bio}</p>}

              <div className="flex flex-wrap gap-2 mt-4">
                {profile.city && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    <MapPin className="h-3 w-3" />
                    {profile.city}
                  </Badge>
                )}
                {profile.skillLevel && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    <Star className="h-3 w-3" />
                    {profile.skillLevel}
                  </Badge>
                )}
                {profile.isProfessional && (
                  <Badge variant="default" className="flex items-center gap-1">
                    <Trophy className="h-3 w-3" />
                    Professional
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Favorite Sports */}
      {profile.favoriteSports && profile.favoriteSports.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Favorite Sports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {profile.favoriteSports.map((sport) => (
                <Badge key={sport} variant="outline">
                  {sport}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Social Links */}
      {profile.socialLinks && profile.socialLinks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Social Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {profile.socialLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-accent transition-colors"
                >
                  {getSocialIcon(link.platform)}
                  <span className="text-sm">@{link.username}</span>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      {profile.stats && (
        <Card>
          <CardHeader>
            <CardTitle>Booking Statistics</CardTitle>
            <CardDescription>Your activity on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Bookings</p>
                <p className="text-2xl font-bold">
                  {profile.stats.totalBookings}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {profile.stats.completedBookings}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Hours Played</p>
                <p className="text-2xl font-bold">
                  {profile.stats.totalHoursPlayed}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Streak</p>
                <p className="text-2xl font-bold text-orange-600">
                  {profile.stats.currentStreakDays} days
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
