import { useState } from "react";
import * as z from "zod"; // Import zod for schema mocking
import { useFieldArray, useForm } from "react-hook-form";
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
  Building2,
  CheckCircle2,
  Plus,
  Trash2,
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  createFacility,
  CreateFacilityReq,
  CreateFacilitySchema,
} from "@/api/facility";
import { AMENITY_TYPES, FACILITY_TYPES } from "@/enums/constants";
import SportsSelector from "../club/SportsSelector";

interface FacilityFormProps {
  clubId: number;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function FacilityCreationForm({
  clubId,
  open,
  onClose,
  onSuccess,
}: FacilityFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const form = useForm<CreateFacilityReq>({
    resolver: zodResolver(CreateFacilitySchema),
    defaultValues: {
      name: "",
      primarySport: "",
      facilityType: "COURT",
      capacity: 10,
      description: "",
      amenities: [],
      supportedSports: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "amenities",
  });

  const addAmenity = () => {
    append({
      type: "CHANGING_ROOM",
      name: "",
      description: "",
      isAvailable: true,
      additionalCost: 0,
    });
  };

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(false);
      const response = await createFacility(clubId, data);
      setSuccess(true);
      setTimeout(() => {
        onSuccess(); // Prop to refetch data on parent
        onClose(); // Close the modal
        form.reset(); // Reset form for next time
        setSuccess(false); // Reset success state
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to create facility");
    } finally {
      setIsLoading(false);
    }
  });

  // Custom reset + close handler
  const handleClose = () => {
    if (isLoading) return; // Don't close while submitting
    onClose();
    form.reset();
    setError(null);
    setSuccess(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Create New Facility
          </DialogTitle>
        </DialogHeader>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Creation Failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Success Alert */}
        {success && (
          <Alert className="mb-4 border-green-500 bg-green-50 text-green-900">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle>Success!</AlertTitle>
            <AlertDescription>Facility created successfully!</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Facility Name *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Main Football Field, Court 1"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="facilityType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Facility Type *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select facility type"></SelectValue>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {FACILITY_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="primarySport"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Sport</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Football, Basketball"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Main sport this facility is used for
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capacity *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          placeholder="10"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 1)
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        Maximum number of people
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the facility, its features, and specifications..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="supportedSports"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sports Offered *</FormLabel>
                    <FormControl>
                      <SportsSelector
                        value={field.value}
                        onChange={field.onChange}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Amenities Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Amenities</h3>
                  <p className="text-sm text-muted-foreground">
                    Add facilities and services available
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={addAmenity}
                  variant="outline"
                  size="sm"
                  disabled={isLoading}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Amenity
                </Button>
              </div>
              {fields.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed rounded-lg">
                  <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No amenities added yet
                  </p>
                  <Button
                    type="button"
                    onClick={addAmenity}
                    variant="link"
                    size="sm"
                    className="mt-2"
                    disabled={isLoading}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add your first amenity
                  </Button>
                </div>
              )}

              {/* --- THIS IS THE MISSING PART --- */}
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <Card key={field.id} className="relative">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8"
                      onClick={() => remove(index)} // <-- HERE IS THE REMOVE FUNCTION!
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                    <CardContent className="pt-6 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`amenities.${index}.type`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Type *</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                disabled={isLoading}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {AMENITY_TYPES.map((type) => (
                                    <SelectItem key={type} value={type}>
                                      {type.replace(/_/g, " ")}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`amenities.${index}.name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Name *</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g., Male Changing Room"
                                  {...field}
                                  disabled={isLoading}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name={`amenities.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Brief description..."
                                {...field}
                                disabled={isLoading}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`amenities.${index}.additionalCost`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Additional Cost (₹)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min={0}
                                  step="0.01"
                                  placeholder="0.00"
                                  {...field}
                                  disabled={isLoading}
                                  onChange={(e) =>
                                    field.onChange(
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`amenities.${index}.isAvailable`}
                          render={({ field }) => (
                            <FormItem className="flex items-center gap-2 pt-8">
                              <FormControl>
                                <input
                                  type="checkbox"
                                  checked={field.value}
                                  onChange={field.onChange}
                                  disabled={isLoading}
                                  className="h-4 w-4"
                                />
                              </FormControl>
                              <FormLabel className="!mt-0">
                                Currently Available
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {/* --- END OF MISSING PART --- */}
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
                {success ? "Created!" : "Create Facility"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
