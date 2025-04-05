import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowDown, ArrowUp } from "lucide-react";
import { ReportCardProps } from "@/types";

export function ReportCard({
  title,
  value,
  description,
  change,
  isLoading = false,
}: ReportCardProps) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex flex-col space-y-3">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          
          {isLoading ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <h2 className="text-3xl font-semibold">{value}</h2>
          )}
          
          <div className="text-xs text-gray-500">
            {description}
          </div>
          
          {change && !isLoading && (
            <div className={`text-xs font-medium flex items-center ${
              change.isPositive ? "text-green-600" : "text-red-600"
            }`}>
              {change.isPositive ? (
                <ArrowUp className="mr-1 h-3 w-3" />
              ) : (
                <ArrowDown className="mr-1 h-3 w-3" />
              )}
              {`${change.value}% ${change.label}`}
            </div>
          )}
          
          {isLoading && change && (
            <Skeleton className="h-4 w-28" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
