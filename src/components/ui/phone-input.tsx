import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Country {
  name: string;
  code: string;
  flag: string;
  dialCode: string;
}

const COUNTRIES: Country[] = [
  { name: "United States", code: "US", flag: "🇺🇸", dialCode: "+1" },
  { name: "United Kingdom", code: "GB", flag: "🇬🇧", dialCode: "+44" },
  { name: "Canada", code: "CA", flag: "🇨🇦", dialCode: "+1" },
  { name: "Australia", code: "AU", flag: "🇦🇺", dialCode: "+61" },
  { name: "India", code: "IN", flag: "🇮🇳", dialCode: "+91" },
  { name: "Germany", code: "DE", flag: "🇩🇪", dialCode: "+49" },
  { name: "France", code: "FR", flag: "🇫🇷", dialCode: "+33" },
  { name: "Spain", code: "ES", flag: "🇪🇸", dialCode: "+34" },
  { name: "Italy", code: "IT", flag: "🇮🇹", dialCode: "+39" },
  { name: "Netherlands", code: "NL", flag: "🇳🇱", dialCode: "+31" },
  { name: "Belgium", code: "BE", flag: "🇧🇪", dialCode: "+32" },
  { name: "Switzerland", code: "CH", flag: "🇨🇭", dialCode: "+41" },
  { name: "Sweden", code: "SE", flag: "🇸🇪", dialCode: "+46" },
  { name: "Norway", code: "NO", flag: "🇳🇴", dialCode: "+47" },
  { name: "Denmark", code: "DK", flag: "🇩🇰", dialCode: "+45" },
  { name: "Finland", code: "FI", flag: "🇫🇮", dialCode: "+358" },
  { name: "Poland", code: "PL", flag: "🇵🇱", dialCode: "+48" },
  { name: "Japan", code: "JP", flag: "🇯🇵", dialCode: "+81" },
  { name: "China", code: "CN", flag: "🇨🇳", dialCode: "+86" },
  { name: "South Korea", code: "KR", flag: "🇰🇷", dialCode: "+82" },
  { name: "Singapore", code: "SG", flag: "🇸🇬", dialCode: "+65" },
  { name: "Malaysia", code: "MY", flag: "🇲🇾", dialCode: "+60" },
  { name: "Thailand", code: "TH", flag: "🇹🇭", dialCode: "+66" },
  { name: "Philippines", code: "PH", flag: "🇵🇭", dialCode: "+63" },
  { name: "Indonesia", code: "ID", flag: "🇮🇩", dialCode: "+62" },
  { name: "Vietnam", code: "VN", flag: "🇻🇳", dialCode: "+84" },
  { name: "Brazil", code: "BR", flag: "🇧🇷", dialCode: "+55" },
  { name: "Mexico", code: "MX", flag: "🇲🇽", dialCode: "+52" },
  { name: "Argentina", code: "AR", flag: "🇦🇷", dialCode: "+54" },
  { name: "South Africa", code: "ZA", flag: "🇿🇦", dialCode: "+27" },
];

interface PhoneInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onCountryChange?: (country: Country) => void;
}

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ className, onCountryChange, value, onChange, ...props }, ref) => {
    const [selectedCountry, setSelectedCountry] = React.useState<Country>(
      COUNTRIES[0]
    );
    const [phoneNumber, setPhoneNumber] = React.useState(
      typeof value === "string" ? value : ""
    );

    const handleCountryChange = (countryCode: string) => {
      const country = COUNTRIES.find((c) => c.code === countryCode);
      if (country) {
        setSelectedCountry(country);
        onCountryChange?.(country);

        // Update the full phone value with dial code
        const updatedValue =
          country.dialCode + " " + phoneNumber.replace(/^\+\d+\s?/, "");
        setPhoneNumber(updatedValue);
        onChange?.({
          target: { value: updatedValue },
        } as React.ChangeEvent<HTMLInputElement>);
      }
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let inputValue = e.target.value;

      // Remove dial code if user started typing
      inputValue = inputValue.replace(/^\+\d+\s?/, "");

      // Format: allow only digits and spaces
      inputValue = inputValue.replace(/[^\d\s-()]/g, "");

      // Construct full value
      const fullValue = selectedCountry.dialCode + " " + inputValue;
      setPhoneNumber(fullValue);

      // Trigger parent change
      onChange?.({
        target: { value: fullValue },
      } as React.ChangeEvent<HTMLInputElement>);
    };

    return (
      <div className="flex gap-2">
        <Select
          value={selectedCountry.code}
          onValueChange={handleCountryChange}
        >
          <SelectTrigger
            className={cn("w-fit min-w-[140px] px-3", className)}
            aria-label="Select country"
          >
            <span className="mr-2">{selectedCountry.flag}</span>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {COUNTRIES.map((country) => (
              <SelectItem key={country.code} value={country.code}>
                <span className="mr-2">{country.flag}</span>
                {country.name} ({country.dialCode})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <input
          type="tel"
          className={cn(
            "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          placeholder="(555) 000-0000"
          value={phoneNumber}
          onChange={handlePhoneChange}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);

PhoneInput.displayName = "PhoneInput";

export { PhoneInput };
