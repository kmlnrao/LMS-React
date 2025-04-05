import { DashboardSummary } from "@/components/dashboard/dashboard-summary";
import { TasksOverview } from "@/components/dashboard/tasks-overview";
import { InventoryResources } from "@/components/dashboard/inventory-resources";
import { ChartAnalytics } from "@/components/dashboard/chart-analytics";
import { Helmet } from "react-helmet";

export default function Dashboard() {
  return (
    <>
      <Helmet>
        <title>Dashboard | LMS-React</title>
      </Helmet>
      
      <DashboardSummary />
      <TasksOverview />
      <InventoryResources />
      <ChartAnalytics />
    </>
  );
}
