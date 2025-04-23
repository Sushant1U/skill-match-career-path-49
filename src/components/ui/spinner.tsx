
import { cn } from "@/lib/utils";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const Spinner = ({ size = "md", className }: SpinnerProps) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-4 border-t-transparent",
        sizeClasses[size],
        className
      )}
      style={{
        borderTopColor: "transparent",
        borderLeftColor: "currentColor",
        borderRightColor: "currentColor",
        borderBottomColor: "currentColor",
      }}
      aria-label="loading"
    />
  );
};
