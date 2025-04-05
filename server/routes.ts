import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema,
  insertDepartmentSchema,
  insertTaskSchema,
  insertInventoryItemSchema,
  insertEquipmentSchema,
  insertLaundryProcessSchema,
  insertCostAllocationSchema 
} from "@shared/schema";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Configure session handling
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "laundry-management-secret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24, // 1 day
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
      },
    })
  );
  
  // Configure passport
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Passport local strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Invalid username or password" });
        }
        
        // In a real app, you'd hash and compare passwords
        // Something like: const match = await bcrypt.compare(password, user.password);
        if (password !== user.password) {
          return done(null, false, { message: "Invalid username or password" });
        }
        
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );
  
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
  
  // Custom middleware for authenticated routes
  const isAuthenticated = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Not authenticated" });
  };
  
  // Authorization middleware for admin routes
  const isAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.isAuthenticated() && req.user && (req.user as any).role === "admin") {
      return next();
    }
    res.status(403).json({ message: "Admin access required" });
  };
  
  // Helper for handling zod validation errors
  const validateRequest = (schema: z.ZodType<any, any>) => (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        next(error);
      }
    }
  };
  
  // Authentication routes
  app.post("/api/auth/login", passport.authenticate("local"), (req, res) => {
    res.json({ user: req.user });
  });
  
  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Error logging out" });
      }
      res.json({ success: true });
    });
  });
  
  app.get("/api/auth/session", (req, res) => {
    if (req.isAuthenticated()) {
      res.json({ user: req.user });
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });
  
  // User routes
  app.get("/api/users", isAdmin, async (req, res) => {
    try {
      const offset = parseInt(req.query.offset as string) || 0;
      const limit = parseInt(req.query.limit as string) || 20;
      const users = await storage.listUsers(offset, limit);
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Error fetching users", error });
    }
  });
  
  app.get("/api/users/:id", isAuthenticated, async (req, res) => {
    try {
      const user = await storage.getUser(parseInt(req.params.id));
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Error fetching user", error });
    }
  });
  
  app.post("/api/users", isAdmin, validateRequest(insertUserSchema), async (req, res) => {
    try {
      // Extract just the fields we need from insertUserSchema (omitting confirmPassword)
      const { username, password, name, role, department, email, phone } = req.body;
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // In a real app, we'd hash the password
      // const hashedPassword = await bcrypt.hash(password, 10);
      const userData = { username, password, name, role, department, email, phone };
      
      const newUser = await storage.createUser(userData);
      res.status(201).json(newUser);
    } catch (error) {
      res.status(500).json({ message: "Error creating user", error });
    }
  });
  
  app.patch("/api/users/:id", isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const updatedUser = await storage.updateUser(userId, req.body);
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: "Error updating user", error });
    }
  });
  
  app.delete("/api/users/:id", isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      await storage.deleteUser(userId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Error deleting user", error });
    }
  });
  
  // Department routes
  app.get("/api/departments", isAuthenticated, async (req, res) => {
    try {
      const offset = parseInt(req.query.offset as string) || 0;
      const limit = parseInt(req.query.limit as string) || 20;
      const departments = await storage.listDepartments(offset, limit);
      res.json(departments);
    } catch (error) {
      res.status(500).json({ message: "Error fetching departments", error });
    }
  });
  
  app.get("/api/departments/:id", isAuthenticated, async (req, res) => {
    try {
      const department = await storage.getDepartment(parseInt(req.params.id));
      if (!department) {
        return res.status(404).json({ message: "Department not found" });
      }
      res.json(department);
    } catch (error) {
      res.status(500).json({ message: "Error fetching department", error });
    }
  });
  
  app.post("/api/departments", isAdmin, validateRequest(insertDepartmentSchema), async (req, res) => {
    try {
      const newDepartment = await storage.createDepartment(req.body);
      res.status(201).json(newDepartment);
    } catch (error) {
      res.status(500).json({ message: "Error creating department", error });
    }
  });
  
  app.patch("/api/departments/:id", isAdmin, async (req, res) => {
    try {
      const departmentId = parseInt(req.params.id);
      const department = await storage.getDepartment(departmentId);
      if (!department) {
        return res.status(404).json({ message: "Department not found" });
      }
      
      const updatedDepartment = await storage.updateDepartment(departmentId, req.body);
      res.json(updatedDepartment);
    } catch (error) {
      res.status(500).json({ message: "Error updating department", error });
    }
  });
  
  app.delete("/api/departments/:id", isAdmin, async (req, res) => {
    try {
      const departmentId = parseInt(req.params.id);
      const department = await storage.getDepartment(departmentId);
      if (!department) {
        return res.status(404).json({ message: "Department not found" });
      }
      
      await storage.deleteDepartment(departmentId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Error deleting department", error });
    }
  });
  
  // Task routes
  app.get("/api/tasks", isAuthenticated, async (req, res) => {
    try {
      const offset = parseInt(req.query.offset as string) || 0;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = req.query.status as string | undefined;
      const tasks = await storage.listTasks(offset, limit, status);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Error fetching tasks", error });
    }
  });
  
  app.get("/api/tasks/count-by-status", isAuthenticated, async (req, res) => {
    try {
      const statusCounts = await storage.getTasksCountByStatus();
      res.json(statusCounts);
    } catch (error) {
      res.status(500).json({ message: "Error fetching task counts", error });
    }
  });
  
  app.get("/api/tasks/department/:departmentId", isAuthenticated, async (req, res) => {
    try {
      const departmentId = parseInt(req.params.departmentId);
      const offset = parseInt(req.query.offset as string) || 0;
      const limit = parseInt(req.query.limit as string) || 20;
      const tasks = await storage.listTasksByDepartment(departmentId, offset, limit);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Error fetching tasks by department", error });
    }
  });
  
  app.get("/api/tasks/assigned/:userId", isAuthenticated, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const offset = parseInt(req.query.offset as string) || 0;
      const limit = parseInt(req.query.limit as string) || 20;
      const tasks = await storage.listTasksByAssignee(userId, offset, limit);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Error fetching tasks by assignee", error });
    }
  });
  
  app.get("/api/tasks/:id", isAuthenticated, async (req, res) => {
    try {
      const task = await storage.getTask(parseInt(req.params.id));
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: "Error fetching task", error });
    }
  });
  
  app.post("/api/tasks", isAuthenticated, validateRequest(insertTaskSchema), async (req, res) => {
    try {
      const newTask = await storage.createTask(req.body);
      res.status(201).json(newTask);
    } catch (error) {
      res.status(500).json({ message: "Error creating task", error });
    }
  });
  
  app.patch("/api/tasks/:id", isAuthenticated, async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const task = await storage.getTask(taskId);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      // If status is being updated to "completed", set completedAt timestamp
      const updateData = { ...req.body };
      if (updateData.status === "completed" && task.status !== "completed") {
        updateData.completedAt = new Date();
      }
      
      const updatedTask = await storage.updateTask(taskId, updateData);
      res.json(updatedTask);
    } catch (error) {
      res.status(500).json({ message: "Error updating task", error });
    }
  });
  
  app.delete("/api/tasks/:id", isAuthenticated, async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const task = await storage.getTask(taskId);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      await storage.deleteTask(taskId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Error deleting task", error });
    }
  });
  
  // Inventory routes
  app.get("/api/inventory", isAuthenticated, async (req, res) => {
    try {
      const offset = parseInt(req.query.offset as string) || 0;
      const limit = parseInt(req.query.limit as string) || 20;
      const category = req.query.category as string | undefined;
      const items = await storage.listInventoryItems(offset, limit, category);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Error fetching inventory items", error });
    }
  });
  
  app.get("/api/inventory/:id", isAuthenticated, async (req, res) => {
    try {
      const item = await storage.getInventoryItem(parseInt(req.params.id));
      if (!item) {
        return res.status(404).json({ message: "Inventory item not found" });
      }
      res.json(item);
    } catch (error) {
      res.status(500).json({ message: "Error fetching inventory item", error });
    }
  });
  
  app.post("/api/inventory", isAuthenticated, validateRequest(insertInventoryItemSchema), async (req, res) => {
    try {
      const newItem = await storage.createInventoryItem(req.body);
      res.status(201).json(newItem);
    } catch (error) {
      res.status(500).json({ message: "Error creating inventory item", error });
    }
  });
  
  app.patch("/api/inventory/:id", isAuthenticated, async (req, res) => {
    try {
      const itemId = parseInt(req.params.id);
      const item = await storage.getInventoryItem(itemId);
      if (!item) {
        return res.status(404).json({ message: "Inventory item not found" });
      }
      
      // If quantity is being updated, set lastRestocked timestamp
      const updateData = { ...req.body };
      if (updateData.quantity !== undefined && updateData.quantity !== item.quantity) {
        updateData.lastRestocked = new Date();
      }
      
      const updatedItem = await storage.updateInventoryItem(itemId, updateData);
      res.json(updatedItem);
    } catch (error) {
      res.status(500).json({ message: "Error updating inventory item", error });
    }
  });
  
  app.delete("/api/inventory/:id", isAdmin, async (req, res) => {
    try {
      const itemId = parseInt(req.params.id);
      const item = await storage.getInventoryItem(itemId);
      if (!item) {
        return res.status(404).json({ message: "Inventory item not found" });
      }
      
      await storage.deleteInventoryItem(itemId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Error deleting inventory item", error });
    }
  });
  
  // Equipment routes
  app.get("/api/equipment", isAuthenticated, async (req, res) => {
    try {
      const offset = parseInt(req.query.offset as string) || 0;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = req.query.status as string | undefined;
      const equipmentList = await storage.listEquipment(offset, limit, status);
      res.json(equipmentList);
    } catch (error) {
      res.status(500).json({ message: "Error fetching equipment list", error });
    }
  });
  
  app.get("/api/equipment/:id", isAuthenticated, async (req, res) => {
    try {
      const equipmentItem = await storage.getEquipment(parseInt(req.params.id));
      if (!equipmentItem) {
        return res.status(404).json({ message: "Equipment item not found" });
      }
      res.json(equipmentItem);
    } catch (error) {
      res.status(500).json({ message: "Error fetching equipment item", error });
    }
  });
  
  app.post("/api/equipment", isAdmin, validateRequest(insertEquipmentSchema), async (req, res) => {
    try {
      const newEquipment = await storage.createEquipment(req.body);
      res.status(201).json(newEquipment);
    } catch (error) {
      res.status(500).json({ message: "Error creating equipment item", error });
    }
  });
  
  app.patch("/api/equipment/:id", isAuthenticated, async (req, res) => {
    try {
      const equipmentId = parseInt(req.params.id);
      const equipmentItem = await storage.getEquipment(equipmentId);
      if (!equipmentItem) {
        return res.status(404).json({ message: "Equipment item not found" });
      }
      
      const updatedEquipment = await storage.updateEquipment(equipmentId, req.body);
      res.json(updatedEquipment);
    } catch (error) {
      res.status(500).json({ message: "Error updating equipment item", error });
    }
  });
  
  app.delete("/api/equipment/:id", isAdmin, async (req, res) => {
    try {
      const equipmentId = parseInt(req.params.id);
      const equipmentItem = await storage.getEquipment(equipmentId);
      if (!equipmentItem) {
        return res.status(404).json({ message: "Equipment item not found" });
      }
      
      await storage.deleteEquipment(equipmentId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Error deleting equipment item", error });
    }
  });
  
  // Laundry Process routes
  app.get("/api/laundry-processes", isAuthenticated, async (req, res) => {
    try {
      const offset = parseInt(req.query.offset as string) || 0;
      const limit = parseInt(req.query.limit as string) || 20;
      const isActive = req.query.isActive === "true" ? true : 
                       req.query.isActive === "false" ? false : undefined;
                       
      const processes = await storage.listLaundryProcesses(offset, limit, isActive);
      res.json(processes);
    } catch (error) {
      res.status(500).json({ message: "Error fetching laundry processes", error });
    }
  });
  
  app.get("/api/laundry-processes/:id", isAuthenticated, async (req, res) => {
    try {
      const process = await storage.getLaundryProcess(parseInt(req.params.id));
      if (!process) {
        return res.status(404).json({ message: "Laundry process not found" });
      }
      res.json(process);
    } catch (error) {
      res.status(500).json({ message: "Error fetching laundry process", error });
    }
  });
  
  app.post("/api/laundry-processes", isAdmin, validateRequest(insertLaundryProcessSchema), async (req, res) => {
    try {
      const newProcess = await storage.createLaundryProcess(req.body);
      res.status(201).json(newProcess);
    } catch (error) {
      res.status(500).json({ message: "Error creating laundry process", error });
    }
  });
  
  app.patch("/api/laundry-processes/:id", isAdmin, async (req, res) => {
    try {
      const processId = parseInt(req.params.id);
      const process = await storage.getLaundryProcess(processId);
      if (!process) {
        return res.status(404).json({ message: "Laundry process not found" });
      }
      
      const updatedProcess = await storage.updateLaundryProcess(processId, req.body);
      res.json(updatedProcess);
    } catch (error) {
      res.status(500).json({ message: "Error updating laundry process", error });
    }
  });
  
  app.delete("/api/laundry-processes/:id", isAdmin, async (req, res) => {
    try {
      const processId = parseInt(req.params.id);
      const process = await storage.getLaundryProcess(processId);
      if (!process) {
        return res.status(404).json({ message: "Laundry process not found" });
      }
      
      await storage.deleteLaundryProcess(processId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Error deleting laundry process", error });
    }
  });
  
  // Cost Allocation routes
  app.get("/api/cost-allocations", isAuthenticated, async (req, res) => {
    try {
      const offset = parseInt(req.query.offset as string) || 0;
      const limit = parseInt(req.query.limit as string) || 20;
      const departmentId = req.query.departmentId ? parseInt(req.query.departmentId as string) : undefined;
      
      const costAllocations = await storage.listCostAllocations(offset, limit, departmentId);
      res.json(costAllocations);
    } catch (error) {
      res.status(500).json({ message: "Error fetching cost allocations", error });
    }
  });
  
  app.get("/api/cost-allocations/:id", isAuthenticated, async (req, res) => {
    try {
      const costAllocation = await storage.getCostAllocation(parseInt(req.params.id));
      if (!costAllocation) {
        return res.status(404).json({ message: "Cost allocation not found" });
      }
      res.json(costAllocation);
    } catch (error) {
      res.status(500).json({ message: "Error fetching cost allocation", error });
    }
  });
  
  app.post("/api/cost-allocations", isAdmin, validateRequest(insertCostAllocationSchema), async (req, res) => {
    try {
      const newCostAllocation = await storage.createCostAllocation(req.body);
      res.status(201).json(newCostAllocation);
    } catch (error) {
      res.status(500).json({ message: "Error creating cost allocation", error });
    }
  });
  
  app.patch("/api/cost-allocations/:id", isAdmin, async (req, res) => {
    try {
      const costAllocationId = parseInt(req.params.id);
      const costAllocation = await storage.getCostAllocation(costAllocationId);
      if (!costAllocation) {
        return res.status(404).json({ message: "Cost allocation not found" });
      }
      
      const updatedCostAllocation = await storage.updateCostAllocation(costAllocationId, req.body);
      res.json(updatedCostAllocation);
    } catch (error) {
      res.status(500).json({ message: "Error updating cost allocation", error });
    }
  });
  
  app.delete("/api/cost-allocations/:id", isAdmin, async (req, res) => {
    try {
      const costAllocationId = parseInt(req.params.id);
      const costAllocation = await storage.getCostAllocation(costAllocationId);
      if (!costAllocation) {
        return res.status(404).json({ message: "Cost allocation not found" });
      }
      
      await storage.deleteCostAllocation(costAllocationId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Error deleting cost allocation", error });
    }
  });
  
  // Analytics routes
  app.get("/api/analytics/department-usage", isAuthenticated, async (req, res) => {
    try {
      const period = (req.query.period as "weekly" | "monthly" | "quarterly") || "weekly";
      const data = await storage.getDepartmentUsage(period);
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Error fetching department usage analytics", error });
    }
  });
  
  app.get("/api/analytics/task-completion", isAuthenticated, async (req, res) => {
    try {
      const period = (req.query.period as "daily" | "weekly" | "monthly") || "daily";
      const data = await storage.getTaskCompletionStats(period);
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Error fetching task completion analytics", error });
    }
  });
  
  app.get("/api/analytics/dashboard-stats", isAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Error fetching dashboard statistics", error });
    }
  });
  
  return httpServer;
}
