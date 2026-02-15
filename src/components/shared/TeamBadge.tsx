import Image from "next/image";
import { getTeamById } from "@/data/teams";
import { cn } from "@/lib/utils/cn";

interface TeamBadgeProps {
  teamId: string;
  size?: "sm" | "md" | "lg";
  showName?: boolean;
  className?: string;
}

export function TeamBadge({ teamId, size = "md", showName = true, className }: TeamBadgeProps) {
  const team = getTeamById(teamId);
  if (!team) return null;

  const sizes = {
    sm: "text-xs px-1.5 py-0.5 gap-1",
    md: "text-sm px-2 py-1 gap-1.5",
    lg: "text-base px-3 py-1.5 gap-2",
  };

  const imgSizes = { sm: 16, md: 20, lg: 28 };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md font-medium",
        sizes[size],
        className
      )}
      style={{ backgroundColor: team.color + "20", color: team.color }}
    >
      <span
        className="team-stripe shrink-0"
        style={{ backgroundColor: team.color, height: size === "sm" ? 12 : size === "md" ? 16 : 20 }}
      />
      <Image
        src={team.logoUrl}
        alt={team.name}
        width={imgSizes[size]}
        height={imgSizes[size]}
        className="object-contain"
        unoptimized
      />
      {showName && <span>{team.short}</span>}
    </span>
  );
}
