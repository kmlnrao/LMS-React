import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IntegrationCardProps } from "@/types";

export function IntegrationCard({
  title,
  description,
  icon,
  status,
}: IntegrationCardProps) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardContent className="p-0">
        <div className="flex flex-col">
          <div className="bg-primary-50 p-4 flex items-center justify-center">
            <div className="text-primary-600">
              {icon}
            </div>
          </div>
          
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">{title}</h3>
              <Badge
                variant={status === "active" ? "default" : status === "inactive" ? "secondary" : "outline"}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Badge>
            </div>
            
            <p className="text-sm text-gray-500 mb-4">
              {description}
            </p>
            
            <Button
              variant={status === "active" ? "outline" : "default"}
              size="sm"
              className="w-full"
            >
              {status === "active" ? "Configure" : "Activate"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
