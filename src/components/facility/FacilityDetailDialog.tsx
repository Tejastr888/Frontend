import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Calendar,
  Clock,
  DollarSign,
  Plus,
  Edit,
  Trash2,
  Loader2,
} from "lucide-react";
import { Facility } from "@/api/facility";
import { getFacilitySchedules, Schedule, deleteSchedule } from "@/api/schedule";
import ScheduleCreationForm from "@/components/schedule/ScheduleCreationForm";
import { useToast } from "@/components/ui/use-toast";
import { DAYS_OF_WEEK } from "@/enums/constants";

interface FacilityDetailDialogProps {
  facility: Facility;
  clubId: number;
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export default function FacilityDetailDialog({
  facility,
  clubId,
  open,
  onClose,
  onUpdate,
}: FacilityDetailDialogProps) {
  const { toast } = useToast();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(
    null
  ); // ✅ UPDATED

  useEffect(() => {
    if (open && facility) {
      loadSchedules();
    }
  }, [open, facility]);

  const loadSchedules = async () => {
    try {
      setLoading(true);
      const data = await getFacilitySchedules(facility.id);
      setSchedules(data);
    } catch (error) {
      console.error("Failed to load schedules:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load schedules",
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ NEW: Handle create schedule
  const handleCreateSchedule = () => {
    setSelectedSchedule(null); // Clear any selected schedule
    setShowScheduleForm(true);
  };

  // ✅ NEW: Handle edit schedule
  const handleEditSchedule = (schedule: Schedule) => {
    setSelectedSchedule(schedule); // Set the schedule to edit
    setShowScheduleForm(true);
  };

  // ✅ UPDATED: Handle form success
  const handleScheduleSuccess = () => {
    setShowScheduleForm(false);
    setSelectedSchedule(null); // Clear selection
    loadSchedules();
    toast({
      title: "Success!",
      description: selectedSchedule
        ? "Schedule updated successfully"
        : "Schedule created successfully",
    });
  };

  // ✅ UPDATED: Handle form close
  const handleScheduleFormClose = () => {
    setShowScheduleForm(false);
    setSelectedSchedule(null); // Clear selection when closing
  };

  const handleDeleteSchedule = async (scheduleId: number) => {
    if (!confirm("Are you sure you want to delete this schedule?")) return;

    try {
      await deleteSchedule(scheduleId);
      loadSchedules();
      toast({
        title: "Success!",
        description: "Schedule deleted successfully",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete schedule",
      });
    }
  };

  // Group schedules by day
  const schedulesByDay = schedules.reduce((acc, schedule) => {
    if (!acc[schedule.dayOfWeek]) {
      acc[schedule.dayOfWeek] = [];
    }
    acc[schedule.dayOfWeek].push(schedule);
    return acc;
  }, {} as Record<string, Schedule[]>);

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {facility.name}
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="schedules">
                Schedules ({schedules.length})
              </TabsTrigger>
              <TabsTrigger value="bookings">Bookings</TabsTrigger>
            </TabsList>

            {/* Tab 1: Facility Details */}
            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Facility Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Type</p>
                      <p className="font-medium">{facility.facilityType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Capacity</p>
                      <p className="font-medium">{facility.capacity} people</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Primary Sport
                      </p>
                      <p className="font-medium">{facility.primarySport}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge
                        variant={facility.isActive ? "default" : "secondary"}
                      >
                        {facility.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>

                  {facility.description && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Description
                      </p>
                      <p className="text-sm">{facility.description}</p>
                    </div>
                  )}

                  {facility.supportedSports &&
                    facility.supportedSports.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Supported Sports
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {facility.supportedSports.map((sport) => (
                            <Badge key={sport.id} variant="outline">
                              {sport.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                  {facility.amenities && facility.amenities.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Amenities
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {facility.amenities.map((amenity) => (
                          <div
                            key={amenity.id}
                            className="flex items-center justify-between p-2 border rounded"
                          >
                            <span className="text-sm">
                              {amenity.name || amenity.type}
                            </span>
                            {amenity.additionalCost > 0 && (
                              <span className="text-xs text-muted-foreground">
                                +₹{amenity.additionalCost}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 2: Schedules */}
            <TabsContent value="schedules" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Facility Schedules</h3>
                  <p className="text-sm text-muted-foreground">
                    Set pricing and time slots for each day
                  </p>
                </div>
                {/* ✅ UPDATED: Use handleCreateSchedule */}
                <Button onClick={handleCreateSchedule}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Schedule
                </Button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : schedules.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">
                      No schedules created yet
                    </p>
                    {/* ✅ UPDATED: Use handleCreateSchedule */}
                    <Button onClick={handleCreateSchedule}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create First Schedule
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {DAYS_OF_WEEK.map((day) => {
                    const daySchedules = schedulesByDay[day.value] || [];

                    if (daySchedules.length === 0) return null;

                    return (
                      <Card key={day.value}>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">
                            {day.label}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {daySchedules.map((schedule) => (
                            <div
                              key={schedule.id}
                              className="flex items-center justify-between p-3 border rounded"
                            >
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1 text-sm">
                                  <Clock className="h-4 w-4 text-muted-foreground" />
                                  {schedule.startTime} - {schedule.endTime}
                                </div>
                                <div className="flex items-center gap-1 text-sm">
                                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                                  ₹{schedule.pricePerSlot}
                                </div>
                                <Badge variant="outline">
                                  {schedule.slotDuration} min slots
                                </Badge>
                                <Badge
                                  variant={
                                    schedule.isActive ? "default" : "secondary"
                                  }
                                >
                                  {schedule.isActive ? "Active" : "Inactive"}
                                </Badge>
                              </div>
                              <div className="flex gap-2">
                                {/* ✅ UPDATED: Use handleEditSchedule */}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleEditSchedule(schedule)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() =>
                                    handleDeleteSchedule(schedule.id)
                                  }
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* Tab 3: Bookings (Future) */}
            <TabsContent value="bookings">
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">
                    Booking history will appear here
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* ✅ UPDATED: Schedule Creation/Update Form */}
      <ScheduleCreationForm
        clubId={clubId}
        facilityId={facility.id}
        open={showScheduleForm}
        onClose={handleScheduleFormClose}
        onSuccess={handleScheduleSuccess}
        schedule={selectedSchedule} // ✅ Pass selected schedule for edit mode
      />
    </>
  );
}
