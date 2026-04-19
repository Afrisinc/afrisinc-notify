import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  size?: "sm" | "lg";
  className?: string;
  inputClassName?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  size = "sm",
  className = "",
  inputClassName = "",
}: SearchInputProps) {
  const isLarge = size === "lg";

  return (
    <div
      className={`relative ${isLarge ? "group" : ""} ${className}`}
    >
      <Search
        className={`absolute top-1/2 -translate-y-1/2 flex-shrink-0 ${
          isLarge
            ? "left-4 h-5 w-5 text-content-secondary transition-colors group-focus-within:text-primary"
            : "left-3 h-4 w-4 icon-muted"
        }`}
      />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${
          isLarge
            ? "pl-12 rounded-xl border-border/60 focus:ring-primary/40 focus:border-primary/50 transition-all group-focus-within:shadow-sm group-focus-within:shadow-primary/10 dark:bg-slate-900/50"
            : "pl-9"
        } ${inputClassName}`}
      />
    </div>
  );
}
