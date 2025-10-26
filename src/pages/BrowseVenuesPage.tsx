// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { Search, MapPin, Filter, Calendar } from "lucide-react";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Icons } from "@/components/ui/icons";
// import { getAllPublicFacilities, PublicFacility } from "@/api/public";

// export default function BrowseVenuesPage() {
//   const navigate = useNavigate();
//   const [facilities, setFacilities] = useState<PublicFacility[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [sportFilter, setSportFilter] = useState<string>("all");
//   const [locationFilter, setLocationFilter] = useState<string>("all");

//   useEffect(() => {
//     loadFacilities();
//   }, []);

//   const loadFacilities = async () => {
//     try {
//       setLoading(true);
//       const data = await getAllPublicFacilities();
//       setFacilities(data);
//     } catch (error) {
//       console.error("Failed to load facilities:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Filter facilities based on search and filters
//   const filteredFacilities = facilities.filter((facility) => {
//     const matchesSearch =
//       facility.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       facility.clubName?.toLowerCase().includes(searchQuery.toLowerCase());

//     const matchesSport =
//       sportFilter === "all" ||
//       facility.primarySport === sportFilter ||
//       facility.supportedSports?.some((s) => s.name === sportFilter);

//     const matchesLocation =
//       locationFilter === "all" ||
//       facility.location?.toLowerCase().includes(locationFilter.toLowerCase());

//     return matchesSearch && matchesSport && matchesLocation;
//   });

//   // Get unique sports for filter
//   const allSports = Array.from(
//     new Set(
//       facilities.flatMap((f) => [
//         f.primarySport,
//         ...(f.supportedSports?.map((s) => s.name) || []),
//       ])
//     )
//   ).filter(Boolean);

//   const handleBookFacility = (facility: PublicFacility) => {
//     navigate(`/book/${facility.id}`, { state: { facility } });
//   };

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div>
//         <h1 className="text-3xl font-bold">Browse Sports Venues</h1>
//         <p className="text-muted-foreground">
//           Find and book the perfect sports facility
//         </p>
//       </div>

//       {/* Search & Filters */}
//       <Card>
//         <CardContent className="pt-6">
//           <div className="grid gap-4 md:grid-cols-4">
//             {/* Search */}
//             <div className="md:col-span-2">
//               <div className="relative">
//                 <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//                 <Input
//                   placeholder="Search by venue or club name..."
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                   className="pl-9"
//                 />
//               </div>
//             </div>

//             {/* Sport Filter */}
//             <Select value={sportFilter} onValueChange={setSportFilter}>
//               <SelectTrigger>
//                 <Filter className="mr-2 h-4 w-4" />
//                 <SelectValue placeholder="All Sports" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">All Sports</SelectItem>
//                 {allSports.map((sport) => (
//                   <SelectItem key={sport} value={sport}>
//                     {sport}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>

//             {/* Location Filter */}
//             <div className="relative">
//               <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//               <Input
//                 placeholder="Location..."
//                 value={locationFilter === "all" ? "" : locationFilter}
//                 onChange={(e) => setLocationFilter(e.target.value || "all")}
//                 className="pl-9"
//               />
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Results */}
//       <div>
//         <p className="text-sm text-muted-foreground mb-4">
//           {filteredFacilities.length} venue(s) found
//         </p>

//         {loading ? (
//           <div className="flex items-center justify-center py-12">
//             <Icons.spinner className="h-8 w-8 animate-spin" />
//           </div>
//         ) : filteredFacilities.length === 0 ? (
//           <Card>
//             <CardContent className="py-12 text-center">
//               <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
//               <p className="text-muted-foreground">
//                 No venues found matching your criteria
//               </p>
//             </CardContent>
//           </Card>
//         ) : (
//           <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
//             {filteredFacilities.map((facility) => (
//               <Card
//                 key={facility.id}
//                 className="cursor-pointer hover:shadow-lg transition-shadow"
//               >
//                 <CardHeader>
//                   <div className="flex items-start justify-between">
//                     <div className="flex-1">
//                       <CardTitle className="text-lg">{facility.name}</CardTitle>
//                       <CardDescription className="flex items-center gap-1 mt-1">
//                         <MapPin className="h-3 w-3" />
//                         {facility.clubName}
//                       </CardDescription>
//                     </div>
//                     <Badge variant="secondary">{facility.facilityType}</Badge>
//                   </div>
//                 </CardHeader>
//                 <CardContent className="space-y-4">
//                   {/* Facility Info */}
//                   <div className="space-y-2">
//                     <div className="flex justify-between text-sm">
//                       <span className="text-muted-foreground">Capacity</span>
//                       <span className="font-medium">
//                         {facility.capacity} people
//                       </span>
//                     </div>
//                     <div className="flex justify-between text-sm">
//                       <span className="text-muted-foreground">
//                         Primary Sport
//                       </span>
//                       <span className="font-medium">
//                         {facility.primarySport}
//                       </span>
//                     </div>
//                   </div>

//                   {/* Supported Sports */}
//                   {facility.supportedSports &&
//                     facility.supportedSports.length > 0 && (
//                       <div>
//                         <p className="text-xs text-muted-foreground mb-2">
//                           Also supports:
//                         </p>
//                         <div className="flex flex-wrap gap-1">
//                           {facility.supportedSports.slice(0, 3).map((sport) => (
//                             <Badge
//                               key={sport.id}
//                               variant="outline"
//                               className="text-xs"
//                             >
//                               {sport.name}
//                             </Badge>
//                           ))}
//                           {facility.supportedSports.length > 3 && (
//                             <Badge variant="outline" className="text-xs">
//                               +{facility.supportedSports.length - 3} more
//                             </Badge>
//                           )}
//                         </div>
//                       </div>
//                     )}

//                   {/* Amenities */}
//                   {facility.amenities && facility.amenities.length > 0 && (
//                     <div>
//                       <p className="text-xs text-muted-foreground mb-2">
//                         Amenities:
//                       </p>
//                       <div className="flex flex-wrap gap-1">
//                         {facility.amenities.slice(0, 3).map((amenity) => (
//                           <Badge
//                             key={amenity.id}
//                             variant="secondary"
//                             className="text-xs"
//                           >
//                             {amenity.type.replace(/_/g, " ")}
//                           </Badge>
//                         ))}
//                         {facility.amenities.length > 3 && (
//                           <Badge variant="secondary" className="text-xs">
//                             +{facility.amenities.length - 3} more
//                           </Badge>
//                         )}
//                       </div>
//                     </div>
//                   )}

//                   {/* Book Button */}
//                   <Button
//                     className="w-full"
//                     onClick={() => handleBookFacility(facility)}
//                   >
//                     <Calendar className="mr-2 h-4 w-4" />
//                     View Availability & Book
//                   </Button>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
