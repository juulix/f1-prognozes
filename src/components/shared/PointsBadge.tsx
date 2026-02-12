import { cn } from "@/lib/utils/cn";

interface PointsBadgeProps {
  points: number;
  type?: "total" | "exact" | "top3" | "bonus";
  size?: "sm" | "md";
}

export function PointsBadge({ points, type = "total", size = "md" }: PointsBadgeProps) {
  const colors = {
    total: "bg-primary/10 text-primary",
    exact: "bg-green-500/10 text-green-400",
    top3: "bg-yellow-500/10 text-yellow-400",
    bonus: "bg-purple-500/10 text-purple-400",
  };

  const sizes = {
    sm: "text-xs px-1.5 py-0.5",
    md: "text-sm px-2 py-0.5",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-bold",
        colors[type],
        sizes[size]
      )}
    >
      {points > 0 ? `+${points}` : points}
    </span>
  );
}
