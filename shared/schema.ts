import { pgTable, text, serial, integer, boolean, timestamp, pgEnum, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Enum for user roles
export const userRoleEnum = pgEnum("user_role", [
  "admin", 
  "staff", 
  "department", 
  "manager",
  "supervisor",
  "inventory",
  "technician",
  "billing",
  "reports"
]);

// Enum for task status
export const taskStatusEnum = pgEnum("task_status", ["pending", "in_progress", "completed", "delayed"]);

// Enum for equipment status
export const equipmentStatusEnum = pgEnum("equipment_status", ["active", "maintenance", "available", "in_queue"]);

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: userRoleEnum("role").notNull().default("staff"),
  department: text("department"),
  email: text("email"),
  phone: text("phone"),
});

export const usersRelations = relations(users, ({ many }) => ({
  tasks: many(tasks),
}));

// Departments table
export const departments = pgTable("departments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  location: text("location"),
  contactPerson: text("contact_person"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
});

export const departmentsRelations = relations(departments, ({ many }) => ({
  tasks: many(tasks),
}));

// Laundry Tasks table
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  taskId: text("task_id").notNull().unique(), // e.g., LT-3421
  description: text("description").notNull(),
  requestedById: integer("requested_by_id").notNull().references(() => users.id),
  assignedToId: integer("assigned_to_id").references(() => users.id),
  departmentId: integer("department_id").notNull().references(() => departments.id),
  status: taskStatusEnum("status").notNull().default("pending"),
  priority: text("priority").notNull().default("medium"),
  weight: real("weight"), // in kg
  dueDate: timestamp("due_date").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
  notes: text("notes"),
});

export const tasksRelations = relations(tasks, ({ one }) => ({
  requestedBy: one(users, {
    fields: [tasks.requestedById],
    references: [users.id],
  }),
  assignedTo: one(users, {
    fields: [tasks.assignedToId],
    references: [users.id],
  }),
  department: one(departments, {
    fields: [tasks.departmentId],
    references: [departments.id],
  }),
}));

// Inventory Items table
export const inventoryItems = pgTable("inventory_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  unit: text("unit").notNull(), // e.g., liters, kg, boxes
  quantity: real("quantity").notNull(),
  minimumLevel: real("minimum_level").notNull(),
  unitCost: real("unit_cost").notNull().default(0), // cost per unit in currency
  location: text("location"), // storage location
  supplier: text("supplier"), // supplier name
  lastRestocked: timestamp("last_restocked"),
  notes: text("notes"),
});

// Equipment table
export const equipment = pgTable("equipment", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // washer, dryer, sterilizer
  status: equipmentStatusEnum("status").notNull().default("available"),
  lastMaintenance: timestamp("last_maintenance"),
  nextMaintenance: timestamp("next_maintenance"),
  timeRemaining: integer("time_remaining"), // minutes remaining in current cycle
  notes: text("notes"),
});

// Laundry Processes table
export const laundryProcesses = pgTable("laundry_processes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  duration: integer("duration").notNull(), // in minutes
  temperature: integer("temperature"), // in celsius
  detergentAmount: real("detergent_amount"),
  softenerAmount: real("softener_amount"),
  disinfectantAmount: real("disinfectant_amount"),
  isActive: boolean("is_active").notNull().default(true),
});

// Cost Allocation table
export const costAllocations = pgTable("cost_allocations", {
  id: serial("id").primaryKey(),
  departmentId: integer("department_id").notNull().references(() => departments.id),
  month: text("month").notNull(), // YYYY-MM format
  totalWeight: real("total_weight").notNull(), // in kg
  totalCost: real("total_cost").notNull(), // in currency
  costPerKg: real("cost_per_kg").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Insert schemas using drizzle-zod
export const insertUserSchema = createInsertSchema(users).omit({ id: true }).extend({
  confirmPassword: z.string().min(6),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const insertDepartmentSchema = createInsertSchema(departments).omit({ id: true });
export const insertTaskSchema = createInsertSchema(tasks)
  .omit({ id: true, createdAt: true, completedAt: true, taskId: true }) // Make taskId optional - the server will generate it
  .extend({
    taskId: z.string().optional(), // Allow but don't require taskId
    dueDate: z.preprocess(
      (arg) => {
        if (typeof arg === 'string' || arg instanceof Date) {
          return new Date(arg);
        }
        return arg;
      },
      z.date()
    )
  });
export const insertInventoryItemSchema = createInsertSchema(inventoryItems).omit({ id: true, lastRestocked: true });
export const insertEquipmentSchema = createInsertSchema(equipment).omit({ id: true, lastMaintenance: true, nextMaintenance: true });
export const insertLaundryProcessSchema = createInsertSchema(laundryProcesses).omit({ id: true });
export const insertCostAllocationSchema = createInsertSchema(costAllocations).omit({ id: true, createdAt: true });

// Export types
export type InsertUser = Omit<z.infer<typeof insertUserSchema>, 'confirmPassword'>;
export type InsertDepartment = z.infer<typeof insertDepartmentSchema>;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type InsertInventoryItem = z.infer<typeof insertInventoryItemSchema>;
export type InsertEquipment = z.infer<typeof insertEquipmentSchema>;
export type InsertLaundryProcess = z.infer<typeof insertLaundryProcessSchema>;
export type InsertCostAllocation = z.infer<typeof insertCostAllocationSchema>;

export type User = typeof users.$inferSelect;
export type Department = typeof departments.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type InventoryItem = typeof inventoryItems.$inferSelect;
export type Equipment = typeof equipment.$inferSelect;
export type LaundryProcess = typeof laundryProcesses.$inferSelect;
export type CostAllocation = typeof costAllocations.$inferSelect;
