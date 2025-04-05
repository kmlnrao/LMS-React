import { 
  users, departments, tasks, inventoryItems, equipment, laundryProcesses, costAllocations,
  type User, type InsertUser,
  type Department, type InsertDepartment,
  type Task, type InsertTask,
  type InventoryItem, type InsertInventoryItem,
  type Equipment, type InsertEquipment,
  type LaundryProcess, type InsertLaundryProcess,
  type CostAllocation, type InsertCostAllocation
} from "@shared/schema";
import { db } from "./db";
import { eq, like, desc, asc, and, gte, lte, count, sql as sqlBuilder } from "drizzle-orm";
import { format } from "date-fns";
import { v4 as uuidv4 } from "uuid";

// Define the storage interface
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  listUsers(offset?: number, limit?: number): Promise<User[]>;
  
  // Department methods
  getDepartment(id: number): Promise<Department | undefined>;
  createDepartment(department: InsertDepartment): Promise<Department>;
  updateDepartment(id: number, department: Partial<Department>): Promise<Department | undefined>;
  deleteDepartment(id: number): Promise<boolean>;
  listDepartments(offset?: number, limit?: number): Promise<Department[]>;
  
  // Task methods
  getTask(id: number): Promise<Task | undefined>;
  getTaskByTaskId(taskId: string): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<Task>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  listTasks(offset?: number, limit?: number, status?: string): Promise<Task[]>;
  listTasksByDepartment(departmentId: number, offset?: number, limit?: number): Promise<Task[]>;
  listTasksByAssignee(userId: number, offset?: number, limit?: number): Promise<Task[]>;
  generateTaskId(): Promise<string>;
  getTasksCountByStatus(): Promise<{ status: string; count: number }[]>;
  
  // Inventory methods
  getInventoryItem(id: number): Promise<InventoryItem | undefined>;
  createInventoryItem(item: InsertInventoryItem): Promise<InventoryItem>;
  updateInventoryItem(id: number, item: Partial<InventoryItem>): Promise<InventoryItem | undefined>;
  deleteInventoryItem(id: number): Promise<boolean>;
  listInventoryItems(offset?: number, limit?: number, category?: string): Promise<InventoryItem[]>;
  
  // Equipment methods
  getEquipment(id: number): Promise<Equipment | undefined>;
  createEquipment(equipment: InsertEquipment): Promise<Equipment>;
  updateEquipment(id: number, equipmentData: Partial<Equipment>): Promise<Equipment | undefined>;
  deleteEquipment(id: number): Promise<boolean>;
  listEquipment(offset?: number, limit?: number, status?: string): Promise<Equipment[]>;
  
  // Laundry Process methods
  getLaundryProcess(id: number): Promise<LaundryProcess | undefined>;
  createLaundryProcess(process: InsertLaundryProcess): Promise<LaundryProcess>;
  updateLaundryProcess(id: number, process: Partial<LaundryProcess>): Promise<LaundryProcess | undefined>;
  deleteLaundryProcess(id: number): Promise<boolean>;
  listLaundryProcesses(offset?: number, limit?: number, isActive?: boolean): Promise<LaundryProcess[]>;
  
  // Cost Allocation methods
  getCostAllocation(id: number): Promise<CostAllocation | undefined>;
  createCostAllocation(costAllocation: InsertCostAllocation): Promise<CostAllocation>;
  updateCostAllocation(id: number, costAllocation: Partial<CostAllocation>): Promise<CostAllocation | undefined>;
  deleteCostAllocation(id: number): Promise<boolean>;
  listCostAllocations(offset?: number, limit?: number, departmentId?: number): Promise<CostAllocation[]>;
  
  // Analytics
  getDepartmentUsage(period: "weekly" | "monthly" | "quarterly"): Promise<{departmentName: string; usage: number}[]>;
  getTaskCompletionStats(period: "daily" | "weekly" | "monthly"): Promise<{date: string; count: number}[]>;
  getDashboardStats(): Promise<{
    pendingTasks: number;
    completedToday: number;
    inventoryStatus: number;
    monthlyCosts: number;
  }>;
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }
  
  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id)).returning({ id: users.id });
    return result.length > 0;
  }
  
  async listUsers(offset = 0, limit = 20): Promise<User[]> {
    return db.select().from(users).offset(offset).limit(limit);
  }
  
  // Department methods
  async getDepartment(id: number): Promise<Department | undefined> {
    const [department] = await db.select().from(departments).where(eq(departments.id, id));
    return department;
  }
  
  async createDepartment(departmentData: InsertDepartment): Promise<Department> {
    const [department] = await db.insert(departments).values(departmentData).returning();
    return department;
  }
  
  async updateDepartment(id: number, departmentData: Partial<Department>): Promise<Department | undefined> {
    const [updatedDepartment] = await db
      .update(departments)
      .set(departmentData)
      .where(eq(departments.id, id))
      .returning();
    return updatedDepartment;
  }
  
  async deleteDepartment(id: number): Promise<boolean> {
    const result = await db.delete(departments).where(eq(departments.id, id)).returning({ id: departments.id });
    return result.length > 0;
  }
  
  async listDepartments(offset = 0, limit = 20): Promise<Department[]> {
    return db.select().from(departments).offset(offset).limit(limit);
  }
  
  // Task methods
  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task;
  }
  
  async getTaskByTaskId(taskId: string): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.taskId, taskId));
    return task;
  }
  
  async createTask(taskData: InsertTask): Promise<Task> {
    // If taskId is not provided, generate one
    if (!taskData.taskId) {
      taskData.taskId = await this.generateTaskId();
    }
    
    const [task] = await db.insert(tasks).values(taskData).returning();
    return task;
  }
  
  async updateTask(id: number, taskData: Partial<Task>): Promise<Task | undefined> {
    const [updatedTask] = await db
      .update(tasks)
      .set(taskData)
      .where(eq(tasks.id, id))
      .returning();
    return updatedTask;
  }
  
  async deleteTask(id: number): Promise<boolean> {
    const result = await db.delete(tasks).where(eq(tasks.id, id)).returning({ id: tasks.id });
    return result.length > 0;
  }
  
  async listTasks(offset = 0, limit = 20, status?: string): Promise<Task[]> {
    let query = db.select().from(tasks).orderBy(desc(tasks.createdAt));
    
    if (status) {
      query = query.where(eq(tasks.status, status as any));
    }
    
    return query.offset(offset).limit(limit);
  }
  
  async listTasksByDepartment(departmentId: number, offset = 0, limit = 20): Promise<Task[]> {
    return db
      .select()
      .from(tasks)
      .where(eq(tasks.departmentId, departmentId))
      .orderBy(desc(tasks.createdAt))
      .offset(offset)
      .limit(limit);
  }
  
  async listTasksByAssignee(userId: number, offset = 0, limit = 20): Promise<Task[]> {
    return db
      .select()
      .from(tasks)
      .where(eq(tasks.assignedToId, userId))
      .orderBy(desc(tasks.createdAt))
      .offset(offset)
      .limit(limit);
  }
  
  async generateTaskId(): Promise<string> {
    // Get the latest task to increment the task ID
    const [latestTask] = await db
      .select({ taskId: tasks.taskId })
      .from(tasks)
      .orderBy(desc(tasks.id))
      .limit(1);
    
    // Format: LT-XXXX where XXXX is a sequential number
    let newId = 1;
    if (latestTask) {
      const idParts = latestTask.taskId.split('-');
      if (idParts.length === 2) {
        newId = parseInt(idParts[1], 10) + 1;
      }
    }
    
    return `LT-${newId.toString().padStart(4, '0')}`;
  }
  
  async getTasksCountByStatus(): Promise<{ status: string; count: number }[]> {
    const result = await db
      .select({
        status: tasks.status,
        count: sqlBuilder<number>`count(*)::int`
      })
      .from(tasks)
      .groupBy(tasks.status);
    
    return result;
  }
  
  // Inventory methods
  async getInventoryItem(id: number): Promise<InventoryItem | undefined> {
    const [item] = await db.select().from(inventoryItems).where(eq(inventoryItems.id, id));
    return item;
  }
  
  async createInventoryItem(itemData: InsertInventoryItem): Promise<InventoryItem> {
    const [item] = await db.insert(inventoryItems).values(itemData).returning();
    return item;
  }
  
  async updateInventoryItem(id: number, itemData: Partial<InventoryItem>): Promise<InventoryItem | undefined> {
    const [updatedItem] = await db
      .update(inventoryItems)
      .set(itemData)
      .where(eq(inventoryItems.id, id))
      .returning();
    return updatedItem;
  }
  
  async deleteInventoryItem(id: number): Promise<boolean> {
    const result = await db.delete(inventoryItems).where(eq(inventoryItems.id, id)).returning({ id: inventoryItems.id });
    return result.length > 0;
  }
  
  async listInventoryItems(offset = 0, limit = 20, category?: string): Promise<InventoryItem[]> {
    let query = db.select().from(inventoryItems);
    
    if (category) {
      query = query.where(eq(inventoryItems.category, category));
    }
    
    return query.offset(offset).limit(limit);
  }
  
  // Equipment methods
  async getEquipment(id: number): Promise<Equipment | undefined> {
    const [equipmentItem] = await db.select().from(equipment).where(eq(equipment.id, id));
    return equipmentItem;
  }
  
  async createEquipment(equipmentData: InsertEquipment): Promise<Equipment> {
    const [equipmentItem] = await db.insert(equipment).values(equipmentData).returning();
    return equipmentItem;
  }
  
  async updateEquipment(id: number, equipmentData: Partial<Equipment>): Promise<Equipment | undefined> {
    const [updatedEquipment] = await db
      .update(equipment)
      .set(equipmentData)
      .where(eq(equipment.id, id))
      .returning();
    return updatedEquipment;
  }
  
  async deleteEquipment(id: number): Promise<boolean> {
    const result = await db.delete(equipment).where(eq(equipment.id, id)).returning({ id: equipment.id });
    return result.length > 0;
  }
  
  async listEquipment(offset = 0, limit = 20, status?: string): Promise<Equipment[]> {
    let query = db.select().from(equipment);
    
    if (status) {
      query = query.where(eq(equipment.status, status as any));
    }
    
    return query.offset(offset).limit(limit);
  }
  
  // Laundry Process methods
  async getLaundryProcess(id: number): Promise<LaundryProcess | undefined> {
    const [process] = await db.select().from(laundryProcesses).where(eq(laundryProcesses.id, id));
    return process;
  }
  
  async createLaundryProcess(processData: InsertLaundryProcess): Promise<LaundryProcess> {
    const [process] = await db.insert(laundryProcesses).values(processData).returning();
    return process;
  }
  
  async updateLaundryProcess(id: number, processData: Partial<LaundryProcess>): Promise<LaundryProcess | undefined> {
    const [updatedProcess] = await db
      .update(laundryProcesses)
      .set(processData)
      .where(eq(laundryProcesses.id, id))
      .returning();
    return updatedProcess;
  }
  
  async deleteLaundryProcess(id: number): Promise<boolean> {
    const result = await db.delete(laundryProcesses).where(eq(laundryProcesses.id, id)).returning({ id: laundryProcesses.id });
    return result.length > 0;
  }
  
  async listLaundryProcesses(offset = 0, limit = 20, isActive?: boolean): Promise<LaundryProcess[]> {
    let query = db.select().from(laundryProcesses);
    
    if (isActive !== undefined) {
      query = query.where(eq(laundryProcesses.isActive, isActive));
    }
    
    return query.offset(offset).limit(limit);
  }
  
  // Cost Allocation methods
  async getCostAllocation(id: number): Promise<CostAllocation | undefined> {
    const [costAllocation] = await db.select().from(costAllocations).where(eq(costAllocations.id, id));
    return costAllocation;
  }
  
  async createCostAllocation(costAllocationData: InsertCostAllocation): Promise<CostAllocation> {
    const [costAllocation] = await db.insert(costAllocations).values(costAllocationData).returning();
    return costAllocation;
  }
  
  async updateCostAllocation(id: number, costAllocationData: Partial<CostAllocation>): Promise<CostAllocation | undefined> {
    const [updatedCostAllocation] = await db
      .update(costAllocations)
      .set(costAllocationData)
      .where(eq(costAllocations.id, id))
      .returning();
    return updatedCostAllocation;
  }
  
  async deleteCostAllocation(id: number): Promise<boolean> {
    const result = await db.delete(costAllocations).where(eq(costAllocations.id, id)).returning({ id: costAllocations.id });
    return result.length > 0;
  }
  
  async listCostAllocations(offset = 0, limit = 20, departmentId?: number): Promise<CostAllocation[]> {
    let query = db
      .select()
      .from(costAllocations)
      .orderBy(desc(costAllocations.month));
    
    if (departmentId) {
      query = query.where(eq(costAllocations.departmentId, departmentId));
    }
    
    return query.offset(offset).limit(limit);
  }
  
  // Analytics methods
  async getDepartmentUsage(period: "weekly" | "monthly" | "quarterly"): Promise<{departmentName: string; usage: number}[]> {
    // Create a date range based on the period
    const now = new Date();
    let startDate: Date;
    
    if (period === "weekly") {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
    } else if (period === "monthly") {
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 1);
    } else {
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 3);
    }
    
    // Join tasks with departments to get department names
    const result = await db
      .select({
        departmentName: departments.name,
        usage: sqlBuilder<number>`sum(${tasks.weight})::float`
      })
      .from(tasks)
      .leftJoin(departments, eq(tasks.departmentId, departments.id))
      .where(gte(tasks.createdAt, startDate))
      .groupBy(departments.name)
      .orderBy(desc(sqlBuilder`sum(${tasks.weight})`));
    
    return result;
  }
  
  async getTaskCompletionStats(period: "daily" | "weekly" | "monthly"): Promise<{date: string; count: number}[]> {
    // Create a date range based on the period
    const now = new Date();
    let startDate: Date;
    let dateFormat: string;
    
    if (period === "daily") {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7); // Last 7 days
      dateFormat = "yyyy-MM-dd";
    } else if (period === "weekly") {
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 1); // Last month as weeks
      dateFormat = "yyyy-'W'ww"; // Year-Week format
    } else {
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 6); // Last 6 months
      dateFormat = "yyyy-MM"; // Year-Month format
    }
    
    // This is a simplified version; in a real database you'd use appropriate date functions
    const result = await db
      .select({
        date: sqlBuilder<string>`to_char(${tasks.completedAt}, 'YYYY-MM-DD')`,
        count: sqlBuilder<number>`count(*)::int`
      })
      .from(tasks)
      .where(
        and(
          gte(tasks.completedAt, startDate),
          eq(tasks.status, "completed")
        )
      )
      .groupBy(sqlBuilder`to_char(${tasks.completedAt}, 'YYYY-MM-DD')`)
      .orderBy(asc(sqlBuilder`to_char(${tasks.completedAt}, 'YYYY-MM-DD')`));
    
    return result;
  }
  
  async getDashboardStats(): Promise<{
    pendingTasks: number;
    completedToday: number;
    inventoryStatus: number;
    monthlyCosts: number;
  }> {
    // Get pending tasks count
    const [pendingTasksResult] = await db
      .select({ count: sqlBuilder<number>`count(*)::int` })
      .from(tasks)
      .where(
        or(
          eq(tasks.status, "pending"),
          eq(tasks.status, "in_progress")
        )
      );
    
    // Get tasks completed today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const [completedTodayResult] = await db
      .select({ count: sqlBuilder<number>`count(*)::int` })
      .from(tasks)
      .where(
        and(
          eq(tasks.status, "completed"),
          gte(tasks.completedAt, today),
          lt(tasks.completedAt, tomorrow)
        )
      );
    
    // Calculate inventory status (average of all items)
    const inventoryItems = await db
      .select({
        quantity: inventoryItems.quantity,
        minimumLevel: inventoryItems.minimumLevel
      })
      .from(inventoryItems);
    
    let inventoryStatusPercentage = 0;
    if (inventoryItems.length > 0) {
      let totalPercentage = 0;
      for (const item of inventoryItems) {
        // Calculate percentage of current quantity against minimum level
        // 100% means we have twice the minimum level, 50% means we're at the minimum level
        const itemPercentage = Math.min(100, (item.quantity / (item.minimumLevel * 2)) * 100);
        totalPercentage += itemPercentage;
      }
      inventoryStatusPercentage = Math.round(totalPercentage / inventoryItems.length);
    }
    
    // Calculate monthly costs
    const currentMonth = format(new Date(), "yyyy-MM");
    const [monthlyCosts] = await db
      .select({ total: sqlBuilder<number>`sum(${costAllocations.totalCost})::float` })
      .from(costAllocations)
      .where(eq(costAllocations.month, currentMonth));
    
    return {
      pendingTasks: pendingTasksResult?.count || 0,
      completedToday: completedTodayResult?.count || 0,
      inventoryStatus: inventoryStatusPercentage,
      monthlyCosts: monthlyCosts?.total || 0,
    };
  }
}

// For empty database conditions
function or(...conditions: any[]) {
  if (conditions.length === 0) return undefined;
  if (conditions.length === 1) return conditions[0];
  let result = conditions[0];
  for (let i = 1; i < conditions.length; i++) {
    result = sqlBuilder`${result} OR ${conditions[i]}`;
  }
  return result;
}

function lt(column: any, value: any) {
  return sqlBuilder`${column} < ${value}`;
}

export const storage = new DatabaseStorage();
