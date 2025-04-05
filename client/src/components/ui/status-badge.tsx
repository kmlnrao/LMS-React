import { Badge } from "@/components/ui/badge";
import { cva, type VariantProps } from "class-variance-authority";

const statusBadgeVariants = cva("", {
  variants: {
    status: {
      pending: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
      in_progress: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
      completed: "bg-green-100 text-green-800 hover:bg-green-100",
      delayed: "bg-red-100 text-red-800 hover:bg-red-100",
      active: "bg-green-100 text-green-800 hover:bg-green-100",
      maintenance: "bg-red-100 text-red-800 hover:bg-red-100",
      available: "bg-blue-100 text-blue-800 hover:bg-blue-100",
      in_queue: "bg-orange-100 text-orange-800 hover:bg-orange-100",
    },
  },
  defaultVariants: {
    status: "pending",
  },
});

export interface StatusBadgeProps extends VariantProps<typeof statusBadgeVariants> {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className, ...props }: StatusBadgeProps) {
  const displayText = status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  
  return (
    <Badge 
      className={statusBadgeVariants({ status: status as any, className })} 
      {...props}
    >
      {displayText}
    </Badge>
  );
}
