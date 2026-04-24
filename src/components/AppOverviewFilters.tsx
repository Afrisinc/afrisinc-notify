import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar, X, ChevronDown, ChevronUp } from "lucide-react";

interface AppOverviewFiltersProps {
  onFilterChange: (filters: {
    startDate?: string;
    endDate?: string;
    channels?: string[];
  }) => void;
}

const CHANNELS = [
  { value: "EMAIL", label: "Email", color: "bg-primary/20 text-primary" },
  { value: "SMS", label: "SMS", color: "bg-success/20 text-success" },
  { value: "PUSH", label: "Push", color: "bg-warning/20 text-warning" },
  { value: "IN_APP", label: "In-App", color: "bg-accent/20 text-accent" },
];

export default function AppOverviewFilters({
  onFilterChange,
}: AppOverviewFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);

  const handleChannelToggle = (channel: string) => {
    setSelectedChannels((prev) =>
      prev.includes(channel)
        ? prev.filter((c) => c !== channel)
        : [...prev, channel],
    );
  };

  const handleApplyFilters = () => {
    onFilterChange({
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      channels: selectedChannels.length > 0 ? selectedChannels : undefined,
    });
  };

  const handleResetFilters = () => {
    setStartDate("");
    setEndDate("");
    setSelectedChannels([]);
    onFilterChange({});
  };

  const hasActiveFilters = startDate || endDate || selectedChannels.length > 0;

  return (
    <div className="space-y-3">
      {/* Filter Toggle Button */}
      <Button
        variant="outline"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full justify-between"
      >
        <span className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-2">
              {(startDate ? 1 : 0) +
                (endDate ? 1 : 0) +
                (selectedChannels.length > 0 ? 1 : 0)}{" "}
              active
            </Badge>
          )}
        </span>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </Button>

      {/* Collapsible Filter Panel */}
      {isExpanded && (
        <Card className="border-border/60 animate-in fade-in-50 duration-200">
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Date Range Section */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Date Range
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label
                      htmlFor="start-date"
                      className="text-xs text-content-secondary"
                    >
                      Start Date
                    </Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="end-date"
                      className="text-xs text-content-secondary"
                    >
                      End Date
                    </Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Channel Selection Section */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Channels</Label>
                <div className="flex flex-wrap gap-2">
                  {CHANNELS.map((channel) => (
                    <Badge
                      key={channel.value}
                      variant={
                        selectedChannels.includes(channel.value)
                          ? "default"
                          : "outline"
                      }
                      className={`cursor-pointer px-3 py-2 ${
                        selectedChannels.includes(channel.value)
                          ? channel.color
                          : ""
                      }`}
                      onClick={() => handleChannelToggle(channel.value)}
                    >
                      {channel.label}
                    </Badge>
                  ))}
                </div>
                {selectedChannels.length > 0 && (
                  <p className="text-xs text-content-secondary">
                    {selectedChannels.length} channel
                    {selectedChannels.length !== 1 ? "s" : ""} selected
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button onClick={handleApplyFilters} className="flex-1">
                  Apply Filters
                </Button>
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    onClick={handleResetFilters}
                    size="sm"
                    className="px-3"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
