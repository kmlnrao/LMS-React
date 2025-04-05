import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  barClassName?: string;
  height?: string;
  showLabel?: boolean;
  label?: string;
  labelPosition?: "right" | "top";
  status?: "error" | "warning" | "success" | "info" | "default";
}

export function ProgressBar({
  value,
  max = 100,
  className,
  barClassName,
  height = "h-3",
  showLabel = false,
  label,
  labelPosition = "right",
  status = "default",
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  const statusColorMap = {
    error: "bg-status-error",
    warning: "bg-status-warning",
    success: "bg-status-success",
    info: "bg-status-info",
    default: "bg-primary-500",
  };
  
  const statusTextColorMap = {
    error: "text-status-error",
    warning: "text-status-warning",
    success: "text-status-success",
    info: "text-status-info",
    default: "text-primary-500",
  };
  
  const barColor = statusColorMap[status];
  const textColor = statusTextColorMap[status];
  
  return (
    <div className={className}>
      {showLabel && labelPosition === "top" && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-gray-600">{label || `${percentage.toFixed(0)}%`}</span>
          {label && <span className={cn("text-sm font-medium", textColor)}>{`${percentage.toFixed(0)}%`}</span>}
        </div>
      )}
      
      <div className={cn("w-full bg-gray-200 rounded-full overflow-hidden", height)}>
        <div
          className={cn("h-full rounded-full", barColor, barClassName)}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      {showLabel && labelPosition === "right" && (
        <div className="flex items-center mt-1">
          <span className="text-sm text-gray-600 mr-2">{label}</span>
          <span className={cn("text-sm font-medium", textColor)}>{`${percentage.toFixed(0)}%`}</span>
        </div>
      )}
    </div>
  );
}
