import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  Loader2,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  createSchedule,
  updateSchedule,
  CreateScheduleRequest,
  CreateScheduleSchema,
  Schedule,
} from "@/api/schedule";
import { DAYS_OF_WEEK } from "@/enums/constants";

interface ScheduleFormProps {
  clubId: number;
  facilityId: number;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  schedule?: Schedule | null; // ← ADD THIS: existing schedule for update mode
}

export default function ScheduleCreationForm({
  clubId,
  facilityId,
  open,
  onClose,
  onSuccess,
  schedule, // ← ADD THIS
}: ScheduleFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Determine if we're in update mode
  const isUpdateMode = !!schedule;

  const form = useForm<CreateScheduleRequest>({
    resolver: zodResolver(CreateScheduleSchema),
    defaultValues: {
      clubId,
      facilityId,
      dayOfWeek: "MONDAY",
      startTime: "09:00",
      endTime: "17:00",
      slotDuration: 60,
      pricePerSlot: 50,
    },
  });

  // ← ADD THIS: Load existing schedule data when in update mode
  useEffect(() => {
    if (schedule) {
      form.reset({
        clubId: schedule.clubId,
        facilityId: schedule.facilityId,
        dayOfWeek: schedule.dayOfWeek,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        slotDuration: schedule.slotDuration,
        pricePerSlot: schedule.pricePerSlot,
        validFrom: schedule.validFrom || undefined,
        validUntil: schedule.validUntil || undefined,
      });
    } else {
      // Reset to default values for create mode
      form.reset({
        clubId,
        facilityId,
        dayOfWeek: "MONDAY",
        startTime: "09:00",
        endTime: "17:00",
        slotDuration: 60,
        pricePerSlot: 50,
      });
    }
  }, [schedule, clubId, facilityId, form]);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(false);

      // ← ADD THIS: Call update or create based on mode
      if (isUpdateMode && schedule) {
        await updateSchedule(schedule.id, data);
      } else {
        await createSchedule(data);
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
        form.reset();
        setSuccess(false);
      }, 2000);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        `Failed to ${isUpdateMode ? "update" : "create"} schedule`;
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  });

  const handleClose = () => {
    if (isLoading) return;
    onClose();
    form.reset();
    setError(null);
    setSuccess(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {isUpdateMode ? "Update Schedule" : "Create Schedule"}
          </DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>
              {isUpdateMode ? "Update" : "Creation"} Failed
            </AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 border-green-500 bg-green-50 text-green-900">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle>Success!</AlertTitle>
            <AlertDescription>
              Schedule {isUpdateMode ? "updated" : "created"} successfully!
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-6">
            {/* Day of Week */}
            <FormField
              control={form.control}
              name="dayOfWeek"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Day of Week *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {DAYS_OF_WEEK.map((day) => (
                        <SelectItem key={day.value} value={day.value}>
                          {day.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Time Range */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time *</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <Input
                          type="time"
                          placeholder="09:00"
                          {...field}
                          disabled={isLoading}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time *</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <Input
                          type="time"
                          placeholder="17:00"
                          {...field}
                          disabled={isLoading}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Slot Duration & Price */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="slotDuration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slot Duration (minutes) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={15}
                        max={480}
                        placeholder="60"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 60)
                        }
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      Minimum 15 minutes, maximum 8 hours
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pricePerSlot"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price Per Slot (₹) *</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          placeholder="50.00"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
                          disabled={isLoading}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Optional: Valid Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="validFrom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valid From (Optional)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="validUntil"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valid Until (Optional)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || success}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {success
                  ? isUpdateMode
                    ? "Updated!"
                    : "Created!"
                  : isUpdateMode
                  ? "Update Schedule"
                  : "Create Schedule"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
