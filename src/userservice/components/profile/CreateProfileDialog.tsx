import { useState, useEffect } from "react";
import { useMutation } from "@apollo/client/react";
import { CREATE_PROFILE } from "@/userservice/graphql/profile";
import { CreateProfileInput } from "@/userservice/types/profile";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Icons } from "@/components/ui/icons";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Check, Calendar, Trophy } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

interface CreateProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const TIME_SLOTS = [
  "00:00",
  "01:00",
  "02:00",
  "03:00",
  "04:00",
  "05:00",
  "06:00",
  "07:00",
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
  "22:00",
  "23:00",
];

const GENDER_OPTIONS = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "OTHER", label: "Other" },
  { value: "PREFER_NOT_TO_SAY", label: "Prefer not to say" },
];

export default function CreateProfileDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateProfileDialogProps) {
  const { toast } = useToast();
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationDetected, setLocationDetected] = useState(false);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [currentAchievement, setCurrentAchievement] = useState("");

  const [formData, setFormData] = useState({
    bio: "",
    avatarUrl: "",
    dateOfBirth: "",
    gender: "",
    city: "",
    state: "",
    country: "India",
    homeLat: null as number | null,
    homeLng: null as number | null,
    skillLevel: "BEGINNER",
    preferredTimeSlots: [] as string[],
    isProfessional: false,
    yearsOfExperience: 0,
    achievements: [] as string[],
    profileVisibility: "",
    showStats: true,
  });

  const [createProfile, { loading }] = useMutation(CREATE_PROFILE, {
    onCompleted: (data) => {
      console.log("Profile created:", data);
      toast({
        title: "Success!",
        description: "Your profile has been created.",
      });
      onSuccess();
    },
    onError: (error) => {
      console.error("Error creating profile:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Auto-detect location on mount
  useEffect(() => {
    if (open && !locationDetected) {
      getLocation();
    }
  }, [open]);

  const getLocation = () => {
    setLocationLoading(true);

    if (!navigator.geolocation) {
      toast({
        title: "Location not supported",
        description: "Please enter your location manually",
        variant: "destructive",
      });
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        setFormData((prev) => ({
          ...prev,
          homeLat: latitude,
          homeLng: longitude,
        }));

        // Reverse geocode to get address
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
            {
              headers: {
                "User-Agent": "SportsChaos/1.0",
              },
            }
          );
          const data = await response.json();

          if (data.address) {
            setFormData((prev) => ({
              ...prev,
              city:
                data.address.city ||
                data.address.town ||
                data.address.village ||
                prev.city,
              state: data.address.state || prev.state,
              country: data.address.country || prev.country,
            }));
          }

          setLocationDetected(true);
          toast({
            title: "Location detected!",
            description: "Your location has been automatically set",
          });
        } catch (err) {
          console.error("Reverse geocoding failed:", err);
          setLocationDetected(true);
        }

        setLocationLoading(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const toggleTimeSlot = (slot: string) => {
    const updated = selectedTimeSlots.includes(slot)
      ? selectedTimeSlots.filter((s) => s !== slot)
      : [...selectedTimeSlots, slot];

    setSelectedTimeSlots(updated);
    setFormData((prev) => ({ ...prev, preferredTimeSlots: updated }));
  };

  const addAchievement = () => {
    if (currentAchievement.trim()) {
      const updated = [...achievements, currentAchievement.trim()];
      setAchievements(updated);
      setFormData((prev) => ({ ...prev, achievements: updated }));
      setCurrentAchievement("");
    }
  };

  const removeAchievement = (index: number) => {
    const updated = achievements.filter((_, i) => i !== index);
    setAchievements(updated);
    setFormData((prev) => ({ ...prev, achievements: updated }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.city) {
      toast({
        title: "Missing information",
        description: "Please enter your city",
        variant: "destructive",
      });
      return;
    }

    try {
      await createProfile({
        variables: {
          input: {
            ...formData,
            yearsOfExperience: formData.yearsOfExperience || 0,
          },
        },
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Your Profile</DialogTitle>
          <DialogDescription>
            Complete your profile to get started with SportsChaos
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Personal Information
            </h3>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell us about yourself and your sports interests..."
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                rows={3}
                className="resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) =>
                      setFormData({ ...formData, dateOfBirth: e.target.value })
                    }
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) =>
                    setFormData({ ...formData, gender: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    {GENDER_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="avatarUrl">Avatar URL (Optional)</Label>
              <Input
                id="avatarUrl"
                type="url"
                placeholder="https://example.com/avatar.jpg"
                value={formData.avatarUrl}
                onChange={(e) =>
                  setFormData({ ...formData, avatarUrl: e.target.value })
                }
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Location
            </h3>

            <Button
              type="button"
              variant={locationDetected ? "outline" : "default"}
              className="w-full"
              onClick={getLocation}
              disabled={locationLoading}
            >
              {locationLoading ? (
                <>
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  Detecting location...
                </>
              ) : locationDetected ? (
                <>
                  <Check className="mr-2 h-4 w-4 text-green-600" />
                  Location detected
                </>
              ) : (
                <>
                  <MapPin className="mr-2 h-4 w-4" />
                  Auto-detect my location
                </>
              )}
            </Button>

            {locationDetected && (
              <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                Coordinates: {formData.homeLat?.toFixed(4)},{" "}
                {formData.homeLng?.toFixed(4)}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  placeholder="Bangalore"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  placeholder="Karnataka"
                  value={formData.state}
                  onChange={(e) =>
                    setFormData({ ...formData, state: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) =>
                  setFormData({ ...formData, country: e.target.value })
                }
              />
            </div>
          </div>

          {/* Sports Profile */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Sports Profile
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="skillLevel">Skill Level</Label>
                <Select
                  value={formData.skillLevel}
                  onValueChange={(value) =>
                    setFormData({ ...formData, skillLevel: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BEGINNER">🌱 Beginner</SelectItem>
                    <SelectItem value="INTERMEDIATE">
                      📈 Intermediate
                    </SelectItem>
                    <SelectItem value="ADVANCED">⭐ Advanced</SelectItem>
                    <SelectItem value="EXPERT">🏆 Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="yearsOfExperience">Years of Experience</Label>
                <Input
                  id="yearsOfExperience"
                  type="number"
                  min="0"
                  value={formData.yearsOfExperience}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      yearsOfExperience: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="isProfessional" className="text-base">
                  Professional Athlete
                </Label>
                <p className="text-sm text-muted-foreground">
                  Are you a professional sports player?
                </p>
              </div>
              <Switch
                id="isProfessional"
                checked={formData.isProfessional}
                onCheckedChange={(checked: any) =>
                  setFormData({ ...formData, isProfessional: checked })
                }
              />
            </div>
          </div>

          {/* Preferred Time Slots */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Preferred Playing Times
            </h3>
            <p className="text-sm text-muted-foreground">
              Select your preferred time slots for playing sports
            </p>

            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
              {TIME_SLOTS.map((slot) => (
                <Button
                  key={slot}
                  type="button"
                  size="sm"
                  variant={
                    selectedTimeSlots.includes(slot) ? "default" : "outline"
                  }
                  onClick={() => toggleTimeSlot(slot)}
                  className="h-9"
                >
                  {slot}
                </Button>
              ))}
            </div>
          </div>

          {/* Achievements */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Achievements
            </h3>

            <div className="flex gap-2">
              <Input
                placeholder="Add an achievement (e.g., Won City Championship 2023)"
                value={currentAchievement}
                onChange={(e) => setCurrentAchievement(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addAchievement())
                }
              />
              <Button type="button" onClick={addAchievement} size="sm">
                Add
              </Button>
            </div>

            {achievements.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {achievements.map((achievement, index) => (
                  <Badge key={index} variant="secondary" className="gap-1">
                    {achievement}
                    <button
                      type="button"
                      onClick={() => removeAchievement(index)}
                      className="ml-1 hover:text-destructive"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Privacy Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Privacy Settings
            </h3>

            <div className="space-y-3">
              {/* Profile Visibility - Changed from Switch to Select */}
              <div className="space-y-2">
                <Label htmlFor="profileVisibility">Profile Visibility</Label>
                <Select
                  value={formData.profileVisibility}
                  onValueChange={(value) =>
                    setFormData({ ...formData, profileVisibility: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PUBLIC">
                      <div className="flex items-center gap-2">
                        <span>🌍</span>
                        <div>
                          <div className="font-medium">Public</div>
                          <div className="text-xs text-muted-foreground">
                            Everyone can see your profile
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="FRIENDS_ONLY">
                      <div className="flex items-center gap-2">
                        <span>👥</span>
                        <div>
                          <div className="font-medium">Friends Only</div>
                          <div className="text-xs text-muted-foreground">
                            Only your friends can see your profile
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="PRIVATE">
                      <div className="flex items-center gap-2">
                        <span>🔒</span>
                        <div>
                          <div className="font-medium">Private</div>
                          <div className="text-xs text-muted-foreground">
                            Only you can see your profile
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Control who can view your profile information
                </p>
              </div>

              {/* Show Stats - Keep as Switch */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-0.5">
                  <Label htmlFor="showStats" className="text-base">
                    Show Statistics
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Display your booking stats on your profile
                  </p>
                </div>
                <Switch
                  id="showStats"
                  checked={formData.showStats}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, showStats: checked })
                  }
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {loading && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create Profile
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
