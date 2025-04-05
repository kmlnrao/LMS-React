import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: {
    value: number;
    isIncrease: boolean;
    label: string;
  };
  iconBgClass?: string;
  iconTextClass?: string;
  className?: string;
}

export function StatsCard({
  title,
  value,
  icon,
  change,
  iconBgClass = "bg-primary-50",
  iconTextClass = "text-primary-500",
  className,
}: StatsCardProps) {
  return (
    <Card className={cn("w-full", className)}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">{title}</p>
            <h2 className="text-3xl font-semibold">{value}</h2>
          </div>
          <div className={cn("p-3 rounded-full", iconBgClass, iconTextClass)}>
            {icon}
          </div>
        </div>
        {change && (
          <div className="mt-2">
            <span 
              className={cn(
                "text-sm font-medium flex items-center",
                change.isIncrease ? "text-status-success" : "text-status-error"
              )}
            >
              {change.isIncrease ? (
                <ArrowUp className="inline-block mr-1 h-4 w-4" />
              ) : (
                <ArrowDown className="inline-block mr-1 h-4 w-4" />
              )}
              {`${Math.abs(change.value)}% ${change.label}`}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
