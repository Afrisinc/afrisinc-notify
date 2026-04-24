import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface SelectFilterOption {
  value: string;
  label: string;
}

interface SelectFilterProps extends React.ComponentPropsWithoutRef<
  typeof SelectTrigger
> {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  options: SelectFilterOption[];
  containerClassName?: string;
}

const SelectFilter = React.forwardRef<
  React.ElementRef<typeof SelectTrigger>,
  SelectFilterProps
>(
  (
    {
      value,
      onValueChange,
      placeholder = "Select an option",
      options,
      className,
      containerClassName,
      ...props
    },
    ref,
  ) => {
    return (
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger
          ref={ref}
          className={cn("w-[140px]", className)}
          {...props}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className={containerClassName}>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  },
);

SelectFilter.displayName = "SelectFilter";

export { SelectFilter };
export type { SelectFilterProps, SelectFilterOption };
