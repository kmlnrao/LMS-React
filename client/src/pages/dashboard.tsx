import { DashboardSummary } from "@/components/dashboard/dashboard-summary";
import { TasksOverview } from "@/components/dashboard/tasks-overview";
import { InventoryResources } from "@/components/dashboard/inventory-resources";
import { ChartAnalytics } from "@/components/dashboard/chart-analytics";
import { Helmet } from "react-helmet";
import suvarnaLogo from "../assets/suvarna_blue_logo.png";

export default function Dashboard() {
  return (
    <>
      <Helmet>
        <title>Dashboard | LMS-React</title>
      </Helmet>
      
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <div className="h-16">
          <img 
            src={suvarnaLogo} 
            alt="Suvarna Technosoft" 
            className="h-full object-contain"
          />
        </div>
      </div>
      
      <DashboardSummary />
      <TasksOverview />
      <InventoryResources />
      <ChartAnalytics />
    </>
  );
}
