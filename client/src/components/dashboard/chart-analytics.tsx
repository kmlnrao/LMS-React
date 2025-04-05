import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUp, ArrowDown } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface DepartmentUsage {
  departmentName: string;
  usage: number;
}

export function ChartAnalytics() {
  const [period, setPeriod] = useState<"weekly" | "monthly" | "quarterly">("weekly");
  
  const { data, isLoading, error } = useQuery<DepartmentUsage[]>({
    queryKey: ["/api/analytics/department-usage", period],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Format data for the chart
  const chartData = data?.map(item => ({
    name: item.departmentName,
    value: item.usage
  })) || [];
  
  return (
    <Card className="mb-8">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Department Usage Analytics</CardTitle>
        <div className="flex space-x-2">
          <Button
            variant={period === "weekly" ? "default" : "outline"}
            size="sm"
            onClick={() => setPeriod("weekly")}
          >
            Weekly
          </Button>
          <Button
            variant={period === "monthly" ? "default" : "outline"}
            size="sm"
            onClick={() => setPeriod("monthly")}
          >
            Monthly
          </Button>
          <Button
            variant={period === "quarterly" ? "default" : "outline"}
            size="sm"
            onClick={() => setPeriod("quarterly")}
          >
            Quarterly
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="w-full h-64 bg-gray-50 rounded-lg overflow-hidden">
          {isLoading && (
            <div className="w-full h-full flex items-center justify-center">
              <Skeleton className="h-full w-full" />
            </div>
          )}
          
          {error && (
            <div className="w-full h-full flex items-center justify-center text-red-500">
              Error loading analytics data
            </div>
          )}
          
          {!isLoading && !error && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 10,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  fontSize={12}
                  tickFormatter={(value) => value.length > 8 ? `${value.substring(0, 8)}...` : value}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`${value} kg`, "Usage"]}
                  labelFormatter={(label) => `Department: ${label}`}
                />
                <Legend />
                <Bar dataKey="value" name="Usage (kg)" fill="#0070D1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
      <CardFooter className="border-t p-0">
        <div className="grid grid-cols-1 md:grid-cols-3 w-full">
          <div className="p-3 text-center">
            <p className="text-gray-500 text-sm">Total Volume (kg)</p>
            <p className="text-2xl font-semibold mt-1">
              {isLoading ? (
                <Skeleton className="h-8 w-20 mx-auto" />
              ) : (
                chartData.reduce((sum, item) => sum + item.value, 0).toLocaleString()
              )}
            </p>
            <p className="text-xs text-status-success mt-1 flex items-center justify-center">
              <ArrowUp className="h-3 w-3 mr-1" />
              12% vs last week
            </p>
          </div>
          <div className="p-3 text-center border-l border-gray-200">
            <p className="text-gray-500 text-sm">Cost per kg</p>
            <p className="text-2xl font-semibold mt-1">
              {isLoading ? (
                <Skeleton className="h-8 w-20 mx-auto" />
              ) : (
                "$1.85"
              )}
            </p>
            <p className="text-xs text-status-error mt-1 flex items-center justify-center">
              <ArrowUp className="h-3 w-3 mr-1" />
              3% vs last week
            </p>
          </div>
          <div className="p-3 text-center border-l border-gray-200">
            <p className="text-gray-500 text-sm">Processing Time (avg)</p>
            <p className="text-2xl font-semibold mt-1">
              {isLoading ? (
                <Skeleton className="h-8 w-20 mx-auto" />
              ) : (
                "4.2 hrs"
              )}
            </p>
            <p className="text-xs text-status-success mt-1 flex items-center justify-center">
              <ArrowDown className="h-3 w-3 mr-1" />
              8% vs last week
            </p>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
