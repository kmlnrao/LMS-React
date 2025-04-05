import { db } from "./db";
import { eq, and, gte, lte, count, sum, sql } from "drizzle-orm";
import { 
  users, departments, tasks, inventoryItems, equipment, laundryProcesses, costAllocations 
} from "@shared/schema";
import { storage } from "./storage";
import { startOfDay, endOfDay, startOfMonth, endOfMonth, startOfWeek, endOfWeek, format, subMonths } from "date-fns";

/**
 * Calculates dashboard statistics
 */
export async function getDashboardStats() {
  try {
    // Get pending tasks count
    const pendingTasksResult = await db
      .select()
      .from(tasks)
      .where(eq(tasks.status, "pending"));
    const pendingTasks = pendingTasksResult.length;
    
    // Get tasks completed today
    const today = new Date();
    const startOfToday = startOfDay(today);
    const endOfToday = endOfDay(today);
    
    const completedTodayResult = await db
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.status, "completed"),
          gte(tasks.completedAt, startOfToday),
          lte(tasks.completedAt, endOfToday)
        )
      );
    const completedToday = completedTodayResult.length;
    
    // Get inventory status (items below minimum level)
    const lowInventoryItems = await db
      .select()
      .from(inventoryItems);
    
    // Filter manually
    const lowInventoryResult = lowInventoryItems.filter(item => 
      item.quantity < item.minimumLevel
    );
    const inventoryStatus = lowInventoryResult.length;
    
    // Get monthly costs from cost allocations for current month
    const currentMonth = format(today, "yyyy-MM");
    
    const costAllocationsForMonth = await db
      .select()
      .from(costAllocations)
      .where(eq(costAllocations.month, currentMonth));
    
    // Calculate total cost manually
    let monthlyCosts = costAllocationsForMonth.reduce((sum, allocation) => 
      sum + allocation.totalCost, 0
    );
    
    // If no expenses for current month, check previous month
    if (monthlyCosts === 0) {
      const prevMonth = format(subMonths(today, 1), "yyyy-MM");
      
      const prevMonthAllocations = await db
        .select()
        .from(costAllocations)
        .where(eq(costAllocations.month, prevMonth));
      
      monthlyCosts = prevMonthAllocations.reduce((sum, allocation) => 
        sum + allocation.totalCost, 0
      );
    }
    
    return {
      pendingTasks,
      completedToday,
      inventoryStatus,
      monthlyCosts
    };
  } catch (error) {
    console.error("Error in getDashboardStats:", error);
    throw error;
  }
}

/**
 * Get department usage statistics for a given period
 */
export async function getDepartmentUsage(period: "weekly" | "monthly" | "quarterly") {
  try {
    // Get all departments first
    const departmentsList = await db.select().from(departments);
    
    // Get date range based on period
    const today = new Date();
    let startDate: Date;
    let endDate = today;
    let targetMonths: string[] = [];
    
    if (period === "weekly") {
      startDate = startOfWeek(today);
      endDate = endOfWeek(today);
    } else if (period === "monthly") {
      startDate = startOfMonth(today);
      endDate = endOfMonth(today);
      targetMonths = [format(today, "yyyy-MM")];
    } else {
      // Quarterly - get last 3 months
      startDate = startOfMonth(subMonths(today, 2));
      targetMonths = [
        format(today, "yyyy-MM"),
        format(subMonths(today, 1), "yyyy-MM"),
        format(subMonths(today, 2), "yyyy-MM")
      ];
    }
    
    // Get all tasks and cost allocations
    const allTasks = await db.select().from(tasks);
    const allCostAllocations = await db.select().from(costAllocations);
    
    // Build data structure for each department
    const departmentUsage = [];
    
    for (const dept of departmentsList) {
      // Count tasks for this department manually
      let taskCount = 0;
      
      if (period === "weekly" || period === "monthly") {
        // For weekly/monthly, filter by createdAt date
        taskCount = allTasks.filter(task => 
          task.departmentId === dept.id && 
          new Date(task.createdAt) >= startDate && 
          new Date(task.createdAt) <= endDate
        ).length;
      } else {
        // For quarterly, filter based on tasks from the last 3 months
        taskCount = allTasks.filter(task => 
          task.departmentId === dept.id && 
          new Date(task.createdAt) >= startDate
        ).length;
      }
      
      // Get cost sum for this department
      let totalCost = 0;
      
      if (targetMonths.length > 0) {
        // For monthly/quarterly, filter by month string
        totalCost = allCostAllocations
          .filter(cost => 
            cost.departmentId === dept.id && 
            targetMonths.includes(cost.month)
          )
          .reduce((sum, cost) => sum + cost.totalCost, 0);
      } else {
        // For weekly, we need to filter by createdAt
        totalCost = allCostAllocations
          .filter(cost => 
            cost.departmentId === dept.id && 
            new Date(cost.createdAt) >= startDate && 
            new Date(cost.createdAt) <= endDate
          )
          .reduce((sum, cost) => sum + cost.totalCost, 0);
      }
      
      // Calculate usage metric (based on both tasks and costs)
      const usage = taskCount * 10 + (totalCost / 1000);
      
      departmentUsage.push({
        departmentName: dept.name,
        usage: Math.round(usage) // Round to nearest integer
      });
    }
    
    // Sort by usage (descending)
    return departmentUsage.sort((a, b) => b.usage - a.usage);
  } catch (error) {
    console.error("Error in getDepartmentUsage:", error);
    throw error;
  }
}

/**
 * Get task completion statistics over time
 */
export async function getTaskCompletionStats(period: "daily" | "weekly" | "monthly") {
  try {
    const today = new Date();
    let startDate: Date;
    
    if (period === "daily") {
      // Get last 14 days
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 14);
    } else if (period === "weekly") {
      // Get last 12 weeks
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 84); // 12 weeks * 7 days
    } else {
      // Get last 12 months
      startDate = new Date(today);
      startDate.setMonth(today.getMonth() - 12);
    }
    
    // Get all completed tasks
    const allTasks = await db.select().from(tasks);
    
    // Filter completed tasks in date range manually
    const completedTasks = allTasks.filter(task => 
      task.status === "completed" && 
      task.completedAt && 
      new Date(task.completedAt) >= startDate && 
      new Date(task.completedAt) <= today
    );
    
    // Process into time series based on period
    const timeSeriesData: { [key: string]: number } = {};
    
    for (const task of completedTasks) {
      if (!task.completedAt) continue;
      
      let dateKey: string;
      const completedDate = new Date(task.completedAt);
      
      if (period === "daily") {
        dateKey = format(completedDate, "yyyy-MM-dd");
      } else if (period === "weekly") {
        // Use the week number as the key
        const weekStart = startOfWeek(completedDate);
        dateKey = format(weekStart, "yyyy-'W'ww");
      } else {
        // Monthly - use year-month as key
        dateKey = format(completedDate, "yyyy-MM");
      }
      
      if (!timeSeriesData[dateKey]) {
        timeSeriesData[dateKey] = 0;
      }
      
      timeSeriesData[dateKey]++;
    }
    
    // Convert to array format for charting
    const result = Object.entries(timeSeriesData).map(([date, count]) => ({
      date,
      count
    }));
    
    // Sort by date
    return result.sort((a, b) => a.date.localeCompare(b.date));
  } catch (error) {
    console.error("Error in getTaskCompletionStats:", error);
    throw error;
  }
}