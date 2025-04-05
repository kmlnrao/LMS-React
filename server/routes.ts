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
  insertCostAllocationSchema,
  InsertUser
} from "@shared/schema";
import { 
  mockUsers, 
  mockDepartments, 
  mockTasks, 
  mockInventoryItems, 
  mockEquipment, 
  mockLaundryProcesses, 
  mockCostAllocations, 
  mockDepartmentUsage, 
  mockTaskCompletionStats, 
  mockDashboardStats 
} from "./mock-data";
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
    // For development purposes, allow all requests through
    if (process.env.NODE_ENV !== "production") {
      // Set a mock user for development
      if (!req.user) {
        (req as any).user = {
          id: 1,
          username: "admin",
          name: "Admin User",
          role: "admin",
          email: "admin@example.com",
          phone: "1234567890",
          department: "Administration"
        };
      }
      return next();
    }
    
    // Normal authentication check for production
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Not authenticated" });
  };
  
  // Authorization middleware for admin routes
  const isAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    // For development purposes, allow all requests through
    if (process.env.NODE_ENV !== "production") {
      // Set a mock admin user for development
      if (!req.user) {
        (req as any).user = {
          id: 1,
          username: "admin",
          name: "Admin User",
          role: "admin",
          email: "admin@example.com",
          phone: "1234567890",
          department: "Administration"
        };
      }
      return next();
    }
    
    // Normal admin check for production
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
    // For development, return a mock session
    if (process.env.NODE_ENV !== "production") {
      // Return a mock user from our mock data for development
      const mockUser = {
        id: 1,
        username: "rajesh.kumar",
        name: "Rajesh Kumar",
        role: "admin",
        email: "rajesh.kumar@hospital.org",
        phone: "9876543210",
        department: "Administration"
      };
      return res.json({ user: mockUser });
    }
    
    // Normal authentication check for production
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
      const { username, password, name, role, department, email, phone, confirmPassword } = req.body;
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // In a real app, we'd hash the password
      // const hashedPassword = await bcrypt.hash(password, 10);
      
      // Note: We're explicitly omitting confirmPassword here as it's only for validation
      const userData: InsertUser = { 
        username, 
        password, 
        name, 
        role, 
        department, 
        email, 
        phone 
      };
      
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
      // For development mode, return mock data
      if (process.env.NODE_ENV !== "production") {
        return res.json([
          {
            id: 1,
            taskId: "LT-1001",
            description: "Emergency room linens change",
            requestedById: 1,
            assignedToId: 2,
            departmentId: 1,
            status: "in_progress",
            priority: "high",
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            completedAt: null,
            dueDate: new Date(Date.now() + 7200000).toISOString(),
            weight: 5.2,
            notes: "Needs priority handling due to emergency room requirements"
          },
          {
            id: 2,
            taskId: "LT-1002",
            description: "Pediatrics daily linen change",
            requestedById: 1,
            assignedToId: 3,
            departmentId: 3,
            status: "pending",
            priority: "medium",
            createdAt: new Date(Date.now() - 7200000).toISOString(),
            completedAt: null,
            dueDate: new Date(Date.now() + 86400000).toISOString(),
            weight: 4.8,
            notes: "Standard daily change for pediatrics ward"
          },
          {
            id: 3,
            taskId: "LT-1003",
            description: "Surgery special equipment cleaning",
            requestedById: 2,
            assignedToId: 4,
            departmentId: 2,
            status: "completed",
            priority: "high",
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            completedAt: new Date(Date.now() - 43200000).toISOString(),
            dueDate: new Date(Date.now() - 86400000).toISOString(),
            weight: 3.5,
            notes: "Special detergent required for surgical equipment"
          }
        ]);
      }
      
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
      // For development mode, return mock data
      if (process.env.NODE_ENV !== "production") {
        return res.json([
          { status: "pending", count: 23 },
          { status: "in_progress", count: 15 },
          { status: "completed", count: 42 },
          { status: "delayed", count: 7 }
        ]);
      }
      
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
      // For development mode, return mock data
      if (process.env.NODE_ENV !== "production") {
        return res.json([
          {
            id: 1,
            name: "Bed Sheets (Queen)",
            category: "Linens",
            unit: "pcs",
            quantity: 450,
            minimumLevel: 120,
            unitCost: 350.50,
            location: "Storage Room A",
            lastRestocked: new Date(Date.now() - 604800000).toISOString(),
            supplier: "Hospital Textiles India Ltd.",
            notes: "Standard quality hospital bed sheets"
          },
          {
            id: 2,
            name: "Pillowcases",
            category: "Linens",
            unit: "pcs",
            quantity: 620,
            minimumLevel: 180,
            unitCost: 125.75,
            location: "Storage Room A",
            lastRestocked: new Date(Date.now() - 302400000).toISOString(),
            supplier: "Hospital Textiles India Ltd.",
            notes: "Regular replacement required"
          },
          {
            id: 3,
            name: "Surgical Towels",
            category: "Surgical",
            unit: "pcs",
            quantity: 285,
            minimumLevel: 150,
            unitCost: 225.50,
            location: "Storage Room B",
            lastRestocked: new Date(Date.now() - 172800000).toISOString(),
            supplier: "MedSupply Co.",
            notes: "Sterilized surgical-grade towels"
          },
          {
            id: 4,
            name: "Laundry Detergent (Industrial)",
            category: "Cleaning",
            unit: "L",
            quantity: 32,
            minimumLevel: 15,
            unitCost: 1250.99,
            location: "Supply Closet 2",
            lastRestocked: new Date(Date.now() - 1209600000).toISOString(),
            supplier: "CleanPro Industries",
            notes: "Hospital-grade detergent with disinfectant properties"
          }
        ]);
      }
      
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
      // For development mode, return mock data
      if (process.env.NODE_ENV !== "production") {
        return res.json([
          {
            id: 1,
            name: "Industrial Washer #1",
            model: "WasherPro X5000",
            status: "active",
            location: "Laundry Room A",
            lastMaintenance: new Date(Date.now() - 2592000000).toISOString(),
            nextMaintenance: new Date(Date.now() + 2592000000).toISOString(),
            maintenanceNotes: "Regular monthly inspection completed. All systems operational."
          },
          {
            id: 2,
            name: "Industrial Dryer #1",
            model: "DryMax 3000",
            status: "maintenance",
            location: "Laundry Room A",
            lastMaintenance: new Date(Date.now() - 86400000).toISOString(),
            nextMaintenance: new Date(Date.now() + 259200000).toISOString(),
            maintenanceNotes: "Heating element replacement scheduled. Currently operating at reduced capacity."
          },
          {
            id: 3,
            name: "Folding Machine #2",
            model: "FoldMaster Pro",
            status: "active",
            location: "Laundry Room B",
            lastMaintenance: new Date(Date.now() - 1209600000).toISOString(),
            nextMaintenance: new Date(Date.now() + 1209600000).toISOString(),
            maintenanceNotes: "Belts replaced during last maintenance."
          },
          {
            id: 4,
            name: "Garment Steamer",
            model: "SteamPress 500",
            status: "available",
            location: "Storage",
            lastMaintenance: new Date(Date.now() - 7776000000).toISOString(),
            nextMaintenance: new Date(Date.now() + 1209600000).toISOString(),
            maintenanceNotes: "Water valve needs inspection during next maintenance."
          }
        ]);
      }
      
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
      // For development mode, return mock data
      if (process.env.NODE_ENV !== "production") {
        return res.json([
          {
            id: 1,
            name: "Standard Linen Wash",
            description: "Standard 40°C wash cycle for regular linens",
            duration: 45,
            waterTemp: 40,
            detergentAmount: 50,
            isActive: true,
            notes: "Used for most cotton and polyester blend linens."
          },
          {
            id: 2,
            name: "Surgical Linen Sanitize",
            description: "High temperature sanitization cycle for surgical linens",
            duration: 65,
            waterTemp: 80,
            detergentAmount: 60,
            isActive: true,
            notes: "Includes extra rinse cycle for thorough detergent removal. Uses hospital-grade disinfectant."
          },
          {
            id: 3,
            name: "Delicate Items",
            description: "Gentle cycle for delicate fabrics",
            duration: 35,
            waterTemp: 30,
            detergentAmount: 40,
            isActive: true,
            notes: "Low spin speed and specialized detergent for delicate items."
          },
          {
            id: 4,
            name: "Heavy Soil Treatment",
            description: "Pre-treatment and extended wash for heavily soiled items",
            duration: 75,
            waterTemp: 60,
            detergentAmount: 70,
            isActive: true,
            notes: "Includes 20-minute pre-soak with enzymatic cleaner."
          },
          {
            id: 5,
            name: "Legacy Cotton Process",
            description: "Old process for cotton items",
            duration: 55,
            waterTemp: 50,
            detergentAmount: 60,
            isActive: false,
            notes: "Deprecated. Use Standard Linen Wash instead."
          }
        ]);
      }
      
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
      // For development mode, return mock data
      if (process.env.NODE_ENV !== "production") {
        return res.json([
          {
            id: 1,
            departmentId: 1,
            month: "2025-03",
            amount: 3450.50,
            itemsProcessed: 1250,
            costPerItem: 2.76,
            createdAt: new Date(Date.now() - 864000000).toISOString(),
            notes: "Includes emergency response linens priority handling."
          },
          {
            id: 2,
            departmentId: 2,
            month: "2025-03",
            amount: 4825.75,
            itemsProcessed: 850,
            costPerItem: 5.68,
            createdAt: new Date(Date.now() - 864000000).toISOString(),
            notes: "Higher cost due to specialized surgical linen processing."
          },
          {
            id: 3,
            departmentId: 3,
            month: "2025-03",
            amount: 2175.25,
            itemsProcessed: 925,
            costPerItem: 2.35,
            createdAt: new Date(Date.now() - 864000000).toISOString(),
            notes: "Standard processing for pediatrics department."
          },
          {
            id: 4,
            departmentId: 4,
            month: "2025-03",
            amount: 1980.80,
            itemsProcessed: 680,
            costPerItem: 2.91,
            createdAt: new Date(Date.now() - 864000000).toISOString(),
            notes: "Includes special handling for isolation unit items."
          }
        ]);
      }
      
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
      // For development mode, return mock data
      if (process.env.NODE_ENV !== "production") {
        return res.json([
          { departmentName: "Emergency", usage: 283 },
          { departmentName: "Surgery", usage: 198 },
          { departmentName: "Pediatrics", usage: 167 },
          { departmentName: "ICU", usage: 142 },
          { departmentName: "Radiology", usage: 98 }
        ]);
      }
      
      const period = (req.query.period as "weekly" | "monthly" | "quarterly") || "weekly";
      const data = await storage.getDepartmentUsage(period);
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Error fetching department usage analytics", error });
    }
  });
  
  app.get("/api/analytics/task-completion", isAuthenticated, async (req, res) => {
    try {
      // For development mode, return mock data
      if (process.env.NODE_ENV !== "production") {
        const today = new Date();
        return res.json([
          { date: new Date(today.setDate(today.getDate() - 6)).toISOString().split('T')[0], count: 23 },
          { date: new Date(today.setDate(today.getDate() + 1)).toISOString().split('T')[0], count: 19 },
          { date: new Date(today.setDate(today.getDate() + 1)).toISOString().split('T')[0], count: 25 },
          { date: new Date(today.setDate(today.getDate() + 1)).toISOString().split('T')[0], count: 18 },
          { date: new Date(today.setDate(today.getDate() + 1)).toISOString().split('T')[0], count: 32 },
          { date: new Date(today.setDate(today.getDate() + 1)).toISOString().split('T')[0], count: 27 },
          { date: new Date(today.setDate(today.getDate() + 1)).toISOString().split('T')[0], count: 31 }
        ]);
      }
      
      const period = (req.query.period as "daily" | "weekly" | "monthly") || "daily";
      const data = await storage.getTaskCompletionStats(period);
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Error fetching task completion analytics", error });
    }
  });
  
  app.get("/api/analytics/dashboard-stats", isAuthenticated, async (req, res) => {
    try {
      // For development mode, return mock data
      if (process.env.NODE_ENV !== "production") {
        return res.json({
          pendingTasks: 42,
          completedToday: 15,
          inventoryStatus: 78,
          monthlyCosts: 12450.75
        });
      }
      
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Error fetching dashboard statistics", error });
    }
  });
  
  return httpServer;
}
