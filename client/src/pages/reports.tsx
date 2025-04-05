import { useState } from "react";
import { Helmet } from "react-helmet";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReportCard } from "@/components/reports/report-card";
import { Download, Filter, RefreshCw } from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Chart color palette
const COLORS = ["#0070D1", "#00A67E", "#F59E0B", "#DC2626", "#8B5CF6"];

interface DepartmentUsage {
  departmentName: string;
  usage: number;
}

interface TaskCompletion {
  date: string;
  count: number;
}

interface TaskStatusCount {
  status: string;
  count: number;
}

export default function Reports() {
  const [usagePeriod, setUsagePeriod] = useState<"weekly" | "monthly" | "quarterly">("weekly");
  const [completionPeriod, setCompletionPeriod] = useState<"daily" | "weekly" | "monthly">("daily");

  // Department usage analytics
  const { data: departmentUsage, isLoading: usageLoading } = useQuery<DepartmentUsage[]>({
    queryKey: ["/api/analytics/department-usage", usagePeriod],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Task completion statistics
  const { data: taskCompletion, isLoading: completionLoading } = useQuery<TaskCompletion[]>({
    queryKey: ["/api/analytics/task-completion", completionPeriod],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Task status counts
  const { data: taskStatusCounts, isLoading: statusLoading } = useQuery<TaskStatusCount[]>({
    queryKey: ["/api/tasks/count-by-status"],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Dashboard stats for summary
  const { data: dashboardStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/analytics/dashboard-stats"],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Process data for pie chart
  const pieData = taskStatusCounts?.map(item => ({
    name: item.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value: item.count
  })) || [];

  // Format task completion data to ensure all dates are included
  const processCompletionData = () => {
    if (!taskCompletion || taskCompletion.length === 0) return [];
    
    return taskCompletion.map(item => ({
      date: item.date,
      count: item.count
    }));
  };

  const completionData = processCompletionData();

  return (
    <>
      <Helmet>
        <title>Reports & Analytics | LMS-React</title>
      </Helmet>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Analyze laundry operations and generate performance reports
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-1">
            <RefreshCw className="h-4 w-4" />
            Refresh Data
          </Button>
          <Button variant="outline" className="gap-1">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Button className="gap-1">
            <Download className="h-4 w-4" />
            Export Reports
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <ReportCard
          title="Tasks Processed"
          value={dashboardStats?.completedToday || 0}
          description="Daily task completion rate"
          change={{
            value: 12,
            isPositive: true,
            label: "vs. last week"
          }}
          isLoading={statsLoading}
        />
        
        <ReportCard
          title="Pending Tasks"
          value={dashboardStats?.pendingTasks || 0}
          description="Awaiting processing"
          change={{
            value: 8,
            isPositive: false,
            label: "vs. last week"
          }}
          isLoading={statsLoading}
        />
        
        <ReportCard
          title="Inventory Status"
          value={`${dashboardStats?.inventoryStatus || 0}%`}
          description="Average stock levels"
          change={{
            value: 3,
            isPositive: false,
            label: "vs. last month"
          }}
          isLoading={statsLoading}
        />
        
        <ReportCard
          title="Monthly Costs"
          value={`$${(dashboardStats?.monthlyCosts || 0).toLocaleString()}`}
          description="Total operational expenses"
          change={{
            value: 7,
            isPositive: true,
            label: "vs. last month"
          }}
          isLoading={statsLoading}
        />
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Operations Overview</TabsTrigger>
          <TabsTrigger value="departments">Department Analysis</TabsTrigger>
          <TabsTrigger value="tasks">Task Performance</TabsTrigger>
          <TabsTrigger value="costs">Cost Analysis</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle>Task Status Distribution</CardTitle>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {statusLoading ? (
                    <div className="h-full flex items-center justify-center text-gray-400">
                      Loading data...
                    </div>
                  ) : pieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [value, "Tasks"]} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400">
                      No task status data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle>Task Completion Trends</CardTitle>
                <div className="flex items-center space-x-2">
                  <Select
                    value={completionPeriod}
                    onValueChange={(value) => setCompletionPeriod(value as any)}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {completionLoading ? (
                    <div className="h-full flex items-center justify-center text-gray-400">
                      Loading data...
                    </div>
                  ) : completionData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={completionData}
                        margin={{
                          top: 10,
                          right: 30,
                          left: 0,
                          bottom: 30,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="date"
                          angle={-45}
                          textAnchor="end"
                          height={60}
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis />
                        <Tooltip formatter={(value) => [value, "Tasks Completed"]} />
                        <Area
                          type="monotone"
                          dataKey="count"
                          name="Tasks Completed"
                          stroke="#0070D1"
                          fill="#0070D1"
                          fillOpacity={0.2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400">
                      No completion data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="departments">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>Department Usage Analytics</CardTitle>
              <div className="flex items-center space-x-2">
                <Select
                  value={usagePeriod}
                  onValueChange={(value) => setUsagePeriod(value as any)}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                {usageLoading ? (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    Loading data...
                  </div>
                ) : departmentUsage && departmentUsage.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={departmentUsage.map(item => ({
                        name: item.departmentName,
                        usage: item.usage
                      }))}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 60,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="name"
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value} kg`, "Laundry Processed"]} />
                      <Legend />
                      <Bar
                        dataKey="usage"
                        name="Laundry Processed (kg)"
                        fill="#0070D1"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    No department usage data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <CardTitle>Task Performance Metrics</CardTitle>
              <CardDescription>
                Detailed analysis of laundry task execution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                {completionLoading ? (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    Loading data...
                  </div>
                ) : completionData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={completionData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 60,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis />
                      <Tooltip formatter={(value) => [value, "Tasks Completed"]} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="count"
                        name="Tasks Completed"
                        stroke="#0070D1"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    No task performance data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="costs">
          <Card>
            <CardHeader>
              <CardTitle>Cost Analysis</CardTitle>
              <CardDescription>
                Financial breakdown of laundry operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 flex items-center justify-center text-gray-400">
                Cost analysis reports coming soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
