import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Filter, Calendar, Users, Award } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Icons } from "@/components/ui/icons";
import { getAllPublicFacilities, PublicFacility } from "@/api/public";

export default function BrowseVenuesPage() {
  const navigate = useNavigate();
  const [facilities, setFacilities] = useState<PublicFacility[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sportFilter, setSportFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");

  useEffect(() => {
    loadFacilities();
  }, []);

  const loadFacilities = async () => {
    try {
      setLoading(true);
      const data = await getAllPublicFacilities();
      setFacilities(data);
    } catch (error) {
      console.error("Failed to load facilities:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFacilities = facilities.filter((facility) => {
    const matchesSearch =
      facility.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      facility.clubName?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSport =
      sportFilter === "all" ||
      facility.primarySport === sportFilter ||
      facility.supportedSports?.some((s) => s.name === sportFilter);

    const matchesLocation =
      locationFilter === "all" ||
      facility.location?.toLowerCase().includes(locationFilter.toLowerCase());

    return matchesSearch && matchesSport && matchesLocation;
  });

  const allSports = Array.from(
    new Set(
      facilities.flatMap((f) => [
        f.primarySport,
        ...(f.supportedSports?.map((s) => s.name) || []),
      ])
    )
  ).filter(Boolean);

  const handleBookFacility = (facility: PublicFacility) => {
    navigate(`/book/${facility.id}`, { state: { facility } });
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">
          Browse Sports Venues
        </h1>
        <p className="text-lg text-muted-foreground">
          Find and book the perfect sports facility for your needs
        </p>
      </div>

      {/* Search & Filters */}
      <Card className="shadow-md">
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search venues or clubs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>
            </div>

            <Select value={sportFilter} onValueChange={setSportFilter}>
              <SelectTrigger className="h-11">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <SelectValue placeholder="All Sports" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sports</SelectItem>
                {allSports.map((sport) => (
                  <SelectItem key={sport} value={sport}>
                    {sport}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Filter by location..."
                value={locationFilter === "all" ? "" : locationFilter}
                onChange={(e) => setLocationFilter(e.target.value || "all")}
                className="pl-10 h-11"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">
          Showing {filteredFacilities.length} of {facilities.length} venues
        </p>
      </div>

      {/* Results Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Icons.spinner className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : filteredFacilities.length === 0 ? (
        <Card className="shadow-md">
          <CardContent className="py-16 text-center">
            <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No venues found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filters
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredFacilities.map((facility) => (
            <Card
              key={facility.id}
              className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
            >
              {/* Card Header */}
              <CardHeader className="space-y-3 pb-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 flex-1 min-w-0">
                    <CardTitle className="text-xl font-bold leading-tight line-clamp-1">
                      {facility.name}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                      <span className="truncate font-medium">
                        {facility.clubName}
                      </span>
                    </CardDescription>
                  </div>
                  <Badge className="flex-shrink-0 whitespace-nowrap">
                    {facility.facilityType}
                  </Badge>
                </div>
              </CardHeader>

              {/* Card Content */}
              <CardContent className="space-y-4 pb-6">
                {/* Quick Info Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1 p-3 bg-secondary/50 rounded-lg">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span className="text-xs font-medium">Capacity</span>
                    </div>
                    <p className="text-sm font-bold">
                      {facility.capacity} people
                    </p>
                  </div>

                  <div className="flex flex-col gap-1 p-3 bg-secondary/50 rounded-lg">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Award className="h-4 w-4" />
                      <span className="text-xs font-medium">Sport</span>
                    </div>
                    <p className="text-sm font-bold truncate">
                      {facility.primarySport}
                    </p>
                  </div>
                </div>

                {/* Supported Sports */}
                {facility.supportedSports &&
                  facility.supportedSports.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Also Available
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {facility.supportedSports.slice(0, 3).map((sport) => (
                          <Badge
                            key={sport.id}
                            variant="outline"
                            className="text-xs px-2 py-0.5"
                          >
                            {sport.name}
                          </Badge>
                        ))}
                        {facility.supportedSports.length > 3 && (
                          <Badge
                            variant="outline"
                            className="text-xs px-2 py-0.5"
                          >
                            +{facility.supportedSports.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                {/* Amenities */}
                {facility.amenities && facility.amenities.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Amenities
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {facility.amenities.slice(0, 4).map((amenity) => (
                        <Badge
                          key={amenity.id}
                          variant="secondary"
                          className="text-xs px-2 py-0.5"
                        >
                          {amenity.type.replace(/_/g, " ")}
                        </Badge>
                      ))}
                      {facility.amenities.length > 4 && (
                        <Badge
                          variant="secondary"
                          className="text-xs px-2 py-0.5"
                        >
                          +{facility.amenities.length - 4} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Book Button */}
                <Button
                  className="w-full h-11 mt-2 group-hover:bg-primary/90"
                  onClick={() => handleBookFacility(facility)}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  View Availability & Book
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
