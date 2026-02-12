import { getDriverById, type Driver } from "@/data/drivers";
import { getTeamById } from "@/data/teams";
import { cn } from "@/lib/utils/cn";

interface DriverChipProps {
  driverId: string;
  showNumber?: boolean;
  showTeamColor?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function DriverChip({
  driverId,
  showNumber = true,
  showTeamColor = true,
  size = "md",
  className,
}: DriverChipProps) {
  const driver = getDriverById(driverId);
  if (!driver) return <span className="text-muted-foreground">???</span>;

  const team = getTeamById(driver.teamId);

  const sizes = {
    sm: "text-xs px-2 py-0.5 gap-1",
    md: "text-sm px-2.5 py-1 gap-1.5",
    lg: "text-base px-3 py-1.5 gap-2",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg font-medium bg-muted border border-border",
        sizes[size],
        className
      )}
    >
      {showTeamColor && team && (
        <span
          className="team-stripe shrink-0"
          style={{ backgroundColor: team.color, height: size === "sm" ? 12 : size === "md" ? 16 : 20 }}
        />
      )}
      <span>{driver.emoji}</span>
      {showNumber && (
        <span className="text-muted-foreground font-mono">#{driver.number}</span>
      )}
      <span>{driver.short}</span>
    </span>
  );
}
