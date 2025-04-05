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
      .select({ count: sql`count(*)` })
      .from(tasks)
      .where(eq(tasks.status, "pending"));
    const pendingTasks = pendingTasksResult[0].count;
    
    // Get tasks completed today
    const today = new Date();
    const startOfToday = startOfDay(today);
    const endOfToday = endOfDay(today);
    
    const completedTodayResult = await db
      .select({ count: sql`count(*)` })
      .from(tasks)
      .where(
        and(
          eq(tasks.status, "completed"),
          gte(tasks.completedAt, startOfToday),
          lte(tasks.completedAt, endOfToday)
        )
      );
    const completedToday = completedTodayResult[0].count;
    
    // Get inventory status (items below minimum level)
    const lowInventoryResult = await db
      .select({ count: sql`count(*)` })
      .from(inventoryItems)
      .where(
        sql`${inventoryItems.quantity} < ${inventoryItems.minimumLevel}`
      );
    const inventoryStatus = lowInventoryResult[0].count;
    
    // Get monthly costs (sum of all cost allocations for current month)
    const firstDayOfMonth = startOfMonth(today);
    const lastDayOfMonth = endOfMonth(today);
    
    const monthlyExpensesResult = await db
      .select({
        total: sql`SUM(${costAllocations.totalCost})`
      })
      .from(costAllocations)
      .where(
        and(
          gte(costAllocations.createdAt, firstDayOfMonth),
          lte(costAllocations.createdAt, lastDayOfMonth)
        )
      );
    // If no expenses for current month, check previous month
    let monthlyCosts = Number(monthlyExpensesResult[0].total || 0);
    
    if (monthlyCosts === 0) {
      const prevMonth = subMonths(today, 1);
      const firstDayOfPrevMonth = startOfMonth(prevMonth);
      const lastDayOfPrevMonth = endOfMonth(prevMonth);
      
      const prevMonthExpensesResult = await db
        .select({
          total: sql`SUM(${costAllocations.totalCost})`
        })
        .from(costAllocations)
        .where(
          and(
            gte(costAllocations.createdAt, firstDayOfPrevMonth),
            lte(costAllocations.createdAt, lastDayOfPrevMonth)
          )
        );
      
      monthlyCosts = Number(prevMonthExpensesResult[0].total || 0);
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
    
    if (period === "weekly") {
      startDate = startOfWeek(today);
      endDate = endOfWeek(today);
    } else if (period === "monthly") {
      startDate = startOfMonth(today);
      endDate = endOfMonth(today);
    } else {
      // Quarterly - get last 3 months
      startDate = startOfMonth(subMonths(today, 2));
    }
    
    // Build data structure for each department
    const departmentUsage = [];
    
    for (const dept of departmentsList) {
      // Count tasks for this department in the period
      const tasksCount = await db
        .select({ count: sql`count(*)` })
        .from(tasks)
        .where(
          and(
            eq(tasks.departmentId, dept.id),
            gte(tasks.createdAt, startDate),
            lte(tasks.createdAt, endDate)
          )
        );
      
      // Get cost sum for this department in the period
      const costSum = await db
        .select({
          total: sql`SUM(${costAllocations.totalCost})`
        })
        .from(costAllocations)
        .where(
          and(
            eq(costAllocations.departmentId, dept.id),
            gte(costAllocations.createdAt, startDate),
            lte(costAllocations.createdAt, endDate)
          )
        );
      
      // Calculate usage metric (could be based on both tasks and costs)
      const usage = tasksCount[0].count * 10 + (Number(costSum[0].total || 0) / 1000);
      
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
    
    // Get completed tasks in date range
    const completedTasks = await db
      .select({
        completedAt: tasks.completedAt,
      })
      .from(tasks)
      .where(
        and(
          eq(tasks.status, "completed"),
          gte(tasks.completedAt, startDate),
          lte(tasks.completedAt, today)
        )
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