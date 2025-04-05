import { StatsCard } from "@/components/ui/stats-card";
import { Clock, CheckSquare, Archive, DollarSign } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardStats {
  pendingTasks: number;
  completedToday: number;
  inventoryStatus: number;
  monthlyCosts: number;
}

export function DashboardSummary() {
  const { data, isLoading, error } = useQuery<DashboardStats>({
    queryKey: ["/api/analytics/dashboard-stats"],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-5">
            <Skeleton className="h-5 w-24 mb-2" />
            <Skeleton className="h-10 w-16 mb-2" />
            <Skeleton className="h-4 w-36" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 mb-8">Error loading dashboard stats</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <StatsCard
        title="Pending Tasks"
        value={data?.pendingTasks || 0}
        icon={<Clock className="h-5 w-5" />}
        change={{
          value: 8,
          isIncrease: true,
          label: "from yesterday"
        }}
        iconBgClass="bg-primary-50"
        iconTextClass="text-primary-500"
      />
      
      <StatsCard
        title="Completed Today"
        value={data?.completedToday || 0}
        icon={<CheckSquare className="h-5 w-5" />}
        change={{
          value: 12,
          isIncrease: true,
          label: "from yesterday"
        }}
        iconBgClass="bg-green-100"
        iconTextClass="text-green-600"
      />
      
      <StatsCard
        title="Inventory Status"
        value={`${data?.inventoryStatus || 0}%`}
        icon={<Archive className="h-5 w-5" />}
        change={{
          value: 3,
          isIncrease: false,
          label: "from last week"
        }}
        iconBgClass="bg-blue-100"
        iconTextClass="text-blue-600"
      />
      
      <StatsCard
        title="Monthly Costs"
        value={`$${(data?.monthlyCosts || 0).toLocaleString()}`}
        icon={<DollarSign className="h-5 w-5" />}
        change={{
          value: 7,
          isIncrease: false,
          label: "from last month"
        }}
        iconBgClass="bg-gray-100"
        iconTextClass="text-gray-600"
      />
    </div>
  );
}
