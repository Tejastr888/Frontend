import { useEffect, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { getAllSportsOptions, SportOption } from "@/api/club";
import { Icons } from "../ui/icons";

interface SportsSelectorProps {
  value: number[];
  onChange: (sportIds: number[]) => void;
  disabled?: boolean;
}

export default function SportsSelector({ value, onChange, disabled }: SportsSelectorProps) {
  const [open, setOpen] = useState(false);
  const [sports, setSports] = useState<SportOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSports();
  }, []);

  const loadSports = async () => {
    try {
      setLoading(true);
      const sportsData = await getAllSportsOptions();
      setSports(sportsData);
    } catch (error) {
      console.error("Failed to load sports:", error);
    } finally {
      setLoading(false);
    }
  };

  const selectedSports = sports.filter((sport) => value.includes(sport.id));

  const handleSelect = (sportId: number) => {
    const newValue = value.includes(sportId)
      ? value.filter((id) => id !== sportId)
      : [...value, sportId];
    onChange(newValue);
  };

  // Group sports by category
  const groupedSports = sports.reduce((acc, sport) => {
    if (!acc[sport.category]) {
      acc[sport.category] = [];
    }
    acc[sport.category].push(sport);
    return acc;
  }, {} as Record<string, SportOption[]>);

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled || loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Icons.spinner className="h-4 w-4 animate-spin" />
                Loading sports...
              </span>
            ) : selectedSports.length === 0 ? (
              "Select sports offered..."
            ) : (
              <span className="truncate">
                {selectedSports.length} sport{selectedSports.length > 1 ? "s" : ""} selected
              </span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search sports..." />
            <CommandEmpty>No sport found.</CommandEmpty>
            <div className="max-h-[300px] overflow-y-auto">
              {Object.entries(groupedSports).map(([category, categorySports]) => (
                <CommandGroup key={category} heading={category}>
                  {categorySports.map((sport) => (
                    <CommandItem
                      key={sport.id}
                      value={sport.name}
                      onSelect={() => handleSelect(sport.id)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value.includes(sport.id) ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {sport.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
            </div>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected Sports Tags */}
      {selectedSports.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedSports.map((sport) => (
            <Badge
              key={sport.id}
              variant="secondary"
              className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
              onClick={() => !disabled && handleSelect(sport.id)}
            >
              {sport.name}
              {!disabled && <span className="ml-1">×</span>}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
