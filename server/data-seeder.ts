import { 
  users, departments, tasks, inventoryItems, equipment, laundryProcesses, costAllocations,
  type User, type InsertUser,
  type Department, type InsertDepartment,
  type Task, type InsertTask,
  type InventoryItem, type InsertInventoryItem,
  type Equipment, type InsertEquipment,
  type LaundryProcess, type InsertLaundryProcess,
  type CostAllocation, type InsertCostAllocation,
  userRoleEnum, taskStatusEnum, equipmentStatusEnum
} from "@shared/schema";
import { db } from "./db";
import bcrypt from "bcryptjs";
import { format, subDays, addDays, subMonths } from "date-fns";

// Helper to generate random date between start and end
function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Helper to generate unique task ID
function generateTaskId(): string {
  return `LT-${Math.floor(Math.random() * 10000).toString().padStart(5, '0')}`;
}

// Helper to get random element from array
function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Helper to get random number between min and max
function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper to generate Indian mobile number
function generateMobileNumber(): string {
  const operators = ['9', '8', '7', '6'];
  const randomOperator = getRandomElement(operators);
  const randomNumber = Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
  return randomOperator + randomNumber;
}

// Generate email based on name
function generateEmail(name: string): string {
  const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'rediffmail.com'];
  const nameParts = name.toLowerCase().replace(/\s+/g, '.');
  return `${nameParts}@${getRandomElement(domains)}`;
}

/**
 * Seeds all data for the application
 * @param forceReseed If true, will attempt to seed all tables even if some already have data
 */
export async function seedAllData(forceReseed: boolean = false) {
  try {
    console.log("Starting data seeding...");
    
    // Create departments
    await seedDepartments();
    
    // Create users including admin
    await seedUsers();
    
    // Always seed these tables if forceReseed is true or they're empty
    const taskCount = await db.select().from(tasks);
    if (forceReseed || taskCount.length === 0) {
      // Create inventory items
      await seedInventoryItems();
      
      // Create equipment
      await seedEquipment();
      
      // Create laundry processes
      await seedLaundryProcesses();
      
      // Create tasks
      await seedTasks();
      
      // Create cost allocations
      await seedCostAllocations();
    } else {
      console.log("Some data tables already have data. Set forceReseed to true to override.");
    }
    
    console.log("Data seeding complete!");
    return true;
  } catch (error) {
    console.error("Error seeding data:", error);
    return false;
  }
}

/**
 * Seeds departmental data for the application
 */
async function seedDepartments() {
  const existingDepartments = await db.select().from(departments);
  if (existingDepartments.length > 0) {
    console.log(`Skipping department seeding, ${existingDepartments.length} departments already exist`);
    return;
  }
  
  const departmentData: InsertDepartment[] = [
    { name: "General Ward", location: "Block A, 1st Floor", contactPerson: "Dr. Amit Singh", contactEmail: "amit.singh@hospital.com", contactPhone: "9876543210" },
    { name: "ICU", location: "Block B, Ground Floor", contactPerson: "Dr. Priya Sharma", contactEmail: "priya.sharma@hospital.com", contactPhone: "9876543211" },
    { name: "Pediatrics", location: "Block A, 2nd Floor", contactPerson: "Dr. Rajesh Kumar", contactEmail: "rajesh.kumar@hospital.com", contactPhone: "9876543212" },
    { name: "Maternity", location: "Block C, 1st Floor", contactPerson: "Dr. Sunita Patel", contactEmail: "sunita.patel@hospital.com", contactPhone: "9876543213" },
    { name: "Orthopedics", location: "Block D, Ground Floor", contactPerson: "Dr. Vikram Reddy", contactEmail: "vikram.reddy@hospital.com", contactPhone: "9876543214" },
    { name: "Neurology", location: "Block B, 2nd Floor", contactPerson: "Dr. Meena Joshi", contactEmail: "meena.joshi@hospital.com", contactPhone: "9876543215" },
    { name: "Cardiology", location: "Block C, 2nd Floor", contactPerson: "Dr. Arjun Nair", contactEmail: "arjun.nair@hospital.com", contactPhone: "9876543216" },
    { name: "Oncology", location: "Block D, 1st Floor", contactPerson: "Dr. Neha Gupta", contactEmail: "neha.gupta@hospital.com", contactPhone: "9876543217" },
    { name: "Gastroenterology", location: "Block E, Ground Floor", contactPerson: "Dr. Sanjay Mehta", contactEmail: "sanjay.mehta@hospital.com", contactPhone: "9876543218" },
    { name: "Emergency", location: "Block A, Ground Floor", contactPerson: "Dr. Divya Kapoor", contactEmail: "divya.kapoor@hospital.com", contactPhone: "9876543219" },
  ];
  
  const additionalDepartments = [
    "Ophthalmology", "ENT", "Dermatology", "Psychiatry", "Urology", "Nephrology", "Pulmonology", "Radiology", "Pathology", "Surgery"
  ];
  
  // Add more departments with generated data
  for (let i = 0; i < additionalDepartments.length; i++) {
    const name = additionalDepartments[i];
    const blocks = ["A", "B", "C", "D", "E", "F"];
    const floors = ["Ground Floor", "1st Floor", "2nd Floor", "3rd Floor"];
    
    const location = `Block ${getRandomElement(blocks)}, ${getRandomElement(floors)}`;
    const contactPerson = getRandomElement([
      "Dr. Rahul Verma", "Dr. Ananya Desai", "Dr. Kiran Malhotra", "Dr. Aisha Khan", 
      "Dr. Vivek Chauhan", "Dr. Ritu Agarwal", "Dr. Prakash Tiwari", "Dr. Shweta Iyer"
    ]);
    const contactEmail = contactPerson.toLowerCase().replace("dr. ", "").replace(" ", ".") + "@hospital.com";
    const contactPhone = "98765" + Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    
    departmentData.push({
      name,
      location,
      contactPerson,
      contactEmail,
      contactPhone
    });
  }
  
  await db.insert(departments).values(departmentData);
  console.log(`Seeded ${departmentData.length} departments`);
}

/**
 * Seeds user data for the application including the main admin account
 */
async function seedUsers() {
  const existingUsers = await db.select().from(users);
  if (existingUsers.length > 0) {
    console.log(`Skipping user seeding, ${existingUsers.length} users already exist`);
    return;
  }
  
  // First, create the admin user
  const hashedPassword = await bcrypt.hash("admin123", 10);
  
  const adminUser: InsertUser = {
    username: "admin",
    password: hashedPassword,
    name: "System Administrator",
    role: "admin",
    department: null,
    email: "admin@hospital.com",
    phone: "9876543200"
  };
  
  await db.insert(users).values(adminUser);
  
  // Get all departments to assign users
  const allDepartments = await db.select().from(departments);
  
  // Common Indian first names and last names for generating realistic user data
  const indianFirstNames = [
    "Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Reyansh", "Ayaan", "Atharva", "Krishna", "Ishaan",
    "Shaurya", "Advait", "Dhruv", "Kabir", "Ritvik", "Aarush", "Kayaan", "Darsh", "Veer", "Samar",
    "Saanvi", "Aanya", "Aadhya", "Aaradhya", "Ananya", "Pari", "Anika", "Navya", "Diya", "Riya",
    "Sara", "Kiara", "Myra", "Amyra", "Ishita", "Avni", "Aarna", "Ira", "Ahana", "Anvi",
    "Rajesh", "Suresh", "Mahesh", "Ramesh", "Dinesh", "Amit", "Ajay", "Vijay", "Sanjay", "Anil",
    "Sunil", "Pankaj", "Deepak", "Ashok", "Manish", "Ravi", "Rakesh", "Mukesh", "Praveen", "Naveen",
    "Neha", "Pooja", "Priya", "Swati", "Sneha", "Nisha", "Kavita", "Anjali", "Preeti", "Rekha",
    "Sunita", "Anita", "Savita", "Kiran", "Shikha", "Asha", "Meena", "Geeta", "Sita", "Sarita"
  ];
  
  const indianLastNames = [
    "Sharma", "Verma", "Patel", "Gupta", "Singh", "Kumar", "Joshi", "Shah", "Mehta", "Desai",
    "Patil", "Rao", "Reddy", "Chaudhary", "Nair", "Menon", "Iyer", "Iyengar", "Agarwal", "Banerjee",
    "Chatterjee", "Mukherjee", "Dasgupta", "Sen", "Bose", "Das", "Dutta", "Dey", "Roy", "Choudhury",
    "Malhotra", "Kapoor", "Khanna", "Mehra", "Ahuja", "Bhatia", "Chopra", "Arora", "Suri", "Vyas",
    "Trivedi", "Dave", "Modi", "Pandey", "Mishra", "Shukla", "Dubey", "Tiwari", "Jha", "Sinha",
    "Srivastava", "Yadav", "Chauhan", "Rathore", "Shekhawat", "Rajput", "Malik", "Khan", "Ahmed", "Qureshi"
  ];
  
  // Define the distribution of roles (total 60 users)
  const roleDistribution = [
    { role: "admin", count: 3 },         // 3 administrators
    { role: "manager", count: 5 },       // 5 managers
    { role: "supervisor", count: 8 },    // 8 supervisors
    { role: "staff", count: 15 },        // 15 general staff
    { role: "department", count: 10 },   // 10 department users
    { role: "inventory", count: 7 },     // 7 inventory specialists
    { role: "technician", count: 6 },    // 6 technicians
    { role: "billing", count: 4 },       // 4 billing specialists
    { role: "reports", count: 2 }        // 2 report specialists
  ];
  
  // Create users array
  const allUsers: InsertUser[] = [];
  
  // Generate users according to the distribution
  for (const roleData of roleDistribution) {
    for (let i = 0; i < roleData.count; i++) {
      const firstName = getRandomElement(indianFirstNames);
      const lastName = getRandomElement(indianLastNames);
      const name = `${firstName} ${lastName}`;
      const email = generateEmail(name);
      const phone = generateMobileNumber();
      const role = roleData.role;
      
      // Assign department based on role
      let department = null;
      
      // Assign a department for certain roles that need it
      if (role === "department") {
        // Department users always have a department
        department = getRandomElement(allDepartments).name;
      } else if (["staff", "supervisor", "technician"].includes(role)) {
        // These roles often have department assignments
        department = Math.random() > 0.3 ? getRandomElement(allDepartments).name : null;
      } else if (role === "manager") {
        // Managers sometimes have department assignments
        department = Math.random() > 0.5 ? getRandomElement(allDepartments).name : null;
      }
      
      // Create a username based on firstname.lastname format
      // Ensure uniqueness by adding a number if needed
      let username = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`;
      if (allUsers.some(u => u.username === username)) {
        username = `${username}${Math.floor(Math.random() * 100)}`;
      }
      
      // Create a simple password (in production, you would use a more secure method)
      const password = await bcrypt.hash(`${firstName.toLowerCase()}123`, 10);
      
      allUsers.push({
        username,
        password,
        name,
        role: role as any,
        department,
        email,
        phone
      });
    }
  }
  
  // Create batches of 10 to avoid overloading the database
  for (let i = 0; i < allUsers.length; i += 10) {
    const batch = allUsers.slice(i, i + 10);
    await db.insert(users).values(batch);
  }
  
  console.log(`Seeded 1 admin user and ${allUsers.length} additional users`);
}

/**
 * Seeds inventory item data for the application
 */
async function seedInventoryItems() {
  const existingItems = await db.select().from(inventoryItems);
  if (existingItems.length > 0) {
    console.log(`Skipping inventory seeding, ${existingItems.length} items already exist`);
    return;
  }
  
  const categories = ["Bed Sheets", "Pillow Cases", "Towels", "Blankets", "Curtains", "Scrubs", "Gowns", "Uniforms"];
  const suppliers = ["MediTextiles Ltd.", "HealthFabric Solutions", "HospiLinen Suppliers", "CleanCare Textiles", "MediComfort Linens"];
  const locations = ["Main Storage", "Basement Storage", "Ward A Storage", "Ward B Storage", "Laundry Department", "Emergency Department"];
  
  const inventoryData: InsertInventoryItem[] = [];
  
  // Create 50 inventory items
  for (let i = 0; i < 50; i++) {
    const category = getRandomElement(categories);
    const itemPrefix = Math.floor(i / 5);
    const name = `${category} - Type ${itemPrefix + 1}`;
    
    const quantity = getRandomNumber(20, 500);
    const minimumStock = getRandomNumber(5, 50);
    const unitCost = getRandomNumber(100, 2000) / 10; // Generates values like 10.0 to 200.0
    
    const supplier = getRandomElement(suppliers);
    const location = getRandomElement(locations);
    const lastRestocked = randomDate(subMonths(new Date(), 6), new Date());
    
    // Create inventory object without lastRestocked field which is not in InsertInventoryItem type
    inventoryData.push({
      name,
      notes: `Hospital grade ${category.toLowerCase()} for patient care`,
      category,
      unit: 'unit',
      quantity,
      minimumLevel: minimumStock,
      unitCost,
      supplier,
      location
    });
  }
  
  // Create batches of 10 to avoid overloading the database
  for (let i = 0; i < inventoryData.length; i += 10) {
    const batch = inventoryData.slice(i, i + 10);
    await db.insert(inventoryItems).values(batch);
  }
  
  console.log(`Seeded ${inventoryData.length} inventory items`);
}

/**
 * Seeds equipment data for the application
 */
async function seedEquipment() {
  const existingEquipment = await db.select().from(equipment);
  if (existingEquipment.length > 0) {
    console.log(`Skipping equipment seeding, ${existingEquipment.length} items already exist`);
    return;
  }
  
  const equipmentTypes = ["Washing Machine", "Dryer", "Folding Station", "Iron", "Steamer", "Sorting Table", "Transport Cart", "Sterilization Unit"];
  const manufacturers = ["MediEquip", "LaundryTech", "HospiSystems", "CleanWash Technologies", "SterileSolutions"];
  const statuses = ["active", "maintenance", "available", "in_queue"];
  
  const equipmentData: InsertEquipment[] = [];
  
  // Create 50 equipment items
  for (let i = 0; i < 50; i++) {
    const equipmentType = getRandomElement(equipmentTypes);
    const itemNumber = Math.floor(i / 5) + 1;
    const name = `${equipmentType} ${String.fromCharCode(65 + (i % 5))}-${itemNumber}`;
    
    const manufacturer = getRandomElement(manufacturers);
    const status = getRandomElement(statuses) as any;
    const model = `${manufacturer.substring(0, 4)}-${getRandomNumber(1000, 9999)}`;
    const purchaseDate = randomDate(subMonths(new Date(), 36), subMonths(new Date(), 1));
    
    const lastMaintenance = randomDate(subMonths(new Date(), 6), new Date());
    const maintenanceInterval = getRandomNumber(60, 180); // Days
    const nextMaintenance = addDays(lastMaintenance, maintenanceInterval);
    
    // Create equipment object without lastMaintenance and nextMaintenance fields
    equipmentData.push({
      name,
      type: equipmentType,
      status: status as any,
      timeRemaining: Math.floor(Math.random() * 120), // Random time remaining for equipment in use
      notes: `Regular maintenance needed every ${maintenanceInterval} days`
    });
  }
  
  // Create batches of 10 to avoid overloading the database
  for (let i = 0; i < equipmentData.length; i += 10) {
    const batch = equipmentData.slice(i, i + 10);
    await db.insert(equipment).values(batch);
  }
  
  console.log(`Seeded ${equipmentData.length} equipment items`);
}

/**
 * Seeds laundry process data for the application
 */
async function seedLaundryProcesses() {
  const existingProcesses = await db.select().from(laundryProcesses);
  if (existingProcesses.length > 0) {
    console.log(`Skipping laundry process seeding, ${existingProcesses.length} processes already exist`);
    return;
  }
  
  const processData: InsertLaundryProcess[] = [
    {
      name: "Standard Bedding Wash",
      description: "Regular washing process for bed linens",
      duration: 60,
      temperature: 60,
      detergentAmount: 50,
      softenerAmount: 25,
      disinfectantAmount: 15,
      isActive: true
    },
    {
      name: "High-Temperature Sterilization",
      description: "Sterilizing wash for ICU and surgical linens",
      duration: 90,
      temperature: 90,
      detergentAmount: 60,
      softenerAmount: 20,
      disinfectantAmount: 30,
      isActive: true
    },
    {
      name: "Gentle Cycle - Patient Gowns",
      description: "Gentle washing for delicate patient gowns",
      duration: 45,
      temperature: 40,
      detergentAmount: 40,
      softenerAmount: 30,
      disinfectantAmount: 10,
      isActive: true
    },
    {
      name: "Staff Uniform Process",
      description: "Specialized wash for staff uniforms",
      duration: 75,
      temperature: 50,
      detergentAmount: 45,
      softenerAmount: 25,
      disinfectantAmount: 15,
      isActive: true
    },
    {
      name: "Emergency Quick Wash",
      description: "Rapid wash cycle for emergency needs",
      duration: 30,
      temperature: 65,
      detergentAmount: 55,
      softenerAmount: 15,
      disinfectantAmount: 25,
      isActive: true
    }
  ];
  
  // Create additional processes with variations
  const baseNames = ["Bedding Wash", "Sterilization", "Gentle Cycle", "Standard Wash", "Power Wash"];
  const modifiers = ["Extended", "Economy", "Premium", "Quick", "Ultra", "Eco-friendly", "Intensive"];
  const itemTypes = ["Towels", "Blankets", "Curtains", "Scrubs", "Isolation Gowns", "Reusable PPE"];
  
  for (let i = 0; i < 15; i++) {
    const baseName = getRandomElement(baseNames);
    const modifier = getRandomElement(modifiers);
    const itemType = getRandomElement(itemTypes);
    
    const name = `${modifier} ${baseName} - ${itemType}`;
    const duration = getRandomNumber(30, 120);
    const temperature = getRandomNumber(30, 95);
    const detergentAmount = getRandomNumber(20, 70);
    const softenerAmount = getRandomNumber(10, 40);
    const disinfectantAmount = getRandomNumber(5, 35);
    const isActive = Math.random() > 0.2; // 80% chance of being active
    
    processData.push({
      name,
      description: `${modifier.toLowerCase()} washing process for ${itemType.toLowerCase()}`,
      duration,
      temperature,
      detergentAmount,
      softenerAmount,
      disinfectantAmount,
      isActive
    });
  }
  
  await db.insert(laundryProcesses).values(processData);
  console.log(`Seeded ${processData.length} laundry processes`);
}

/**
 * Seeds task data for the application
 */
async function seedTasks() {
  const existingTasks = await db.select().from(tasks);
  if (existingTasks.length > 0) {
    console.log(`Skipping task seeding, ${existingTasks.length} tasks already exist`);
    return;
  }
  
  // Get all departments, users, and processes for assignments
  const allDepartments = await db.select().from(departments);
  const allUsers = await db.select().from(users);
  const allProcesses = await db.select().from(laundryProcesses);
  
  const priorities = ["High", "Medium", "Low"];
  const statuses = ["pending", "in_progress", "completed", "delayed"];
  
  const taskTypes = [
    "Linen Collection", "Washing", "Drying", "Folding", "Distribution", 
    "Inventory Check", "Special Treatment", "Stain Removal", "Repair", "Sterilization"
  ];
  
  const taskData: InsertTask[] = [];
  
  // Create 50 tasks with varied dates and statuses
  for (let i = 0; i < 50; i++) {
    const taskId = generateTaskId();
    const taskType = getRandomElement(taskTypes);
    const departmentObj = getRandomElement(allDepartments);
    const description = `${taskType} - ${departmentObj.name} task for regular hospital operations`;
    const status = getRandomElement(statuses) as any;
    
    // Create different date patterns based on status
    let createdAt = new Date();
    let dueDate = addDays(new Date(), getRandomNumber(1, 7));
    let completedAt = null;
    
    if (status === "completed") {
      createdAt = subDays(new Date(), getRandomNumber(1, 30));
      dueDate = addDays(createdAt, getRandomNumber(1, 7));
      completedAt = randomDate(createdAt, dueDate); // Completed between created and due
    } else if (status === "delayed") {
      createdAt = subDays(new Date(), getRandomNumber(7, 30));
      dueDate = subDays(new Date(), getRandomNumber(1, 6)); // Due date in the past
    } else if (status === "in_progress") {
      createdAt = subDays(new Date(), getRandomNumber(1, 10));
      dueDate = addDays(new Date(), getRandomNumber(1, 5));
    }
    
    const departmentId = departmentObj.id;
    const assignedToUser = getRandomElement(allUsers);
    const requestedById = getRandomElement(allUsers).id;
    const priority = getRandomElement(priorities);
    const weight = getRandomNumber(5, 100);
    const processId = getRandomElement(allProcesses).id;
    
    // Create task object without completedAt field which is not in InsertTask type
    const taskObj: any = {
      taskId,
      description,
      requestedById,
      departmentId,
      status: status as any,
      priority,
      dueDate,
      assignedToId: assignedToUser.id,
      weight,
      processId: processId
    };
    
    taskData.push(taskObj);
  }
  
  // Create batches of 10 to avoid overloading the database
  for (let i = 0; i < taskData.length; i += 10) {
    const batch = taskData.slice(i, i + 10);
    await db.insert(tasks).values(batch);
  }
  
  console.log(`Seeded ${taskData.length} tasks`);
}

/**
 * Seeds cost allocation data for the application
 */
async function seedCostAllocations() {
  const existingAllocations = await db.select().from(costAllocations);
  if (existingAllocations.length > 0) {
    console.log(`Skipping cost allocation seeding, ${existingAllocations.length} allocations already exist`);
    return;
  }
  
  // Get all departments for allocations
  const allDepartments = await db.select().from(departments);
  
  const costData: InsertCostAllocation[] = [];
  const currentDate = new Date();
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  // Create cost allocations for the past 12 months for each department
  for (const department of allDepartments) {
    for (let i = 0; i < 12; i++) {
      const allocationDate = subMonths(currentDate, i);
      // Format as YYYY-MM to match schema definition
      const formattedMonth = format(allocationDate, "yyyy-MM");
      
      // Generate amounts in Indian Rupees
      const laborCost = getRandomNumber(25000, 100000);
      const materialCost = getRandomNumber(15000, 80000);
      const utilityCost = getRandomNumber(5000, 30000);
      const maintenanceCost = getRandomNumber(2000, 25000);
      
      // Calculate total
      const totalCost = laborCost + materialCost + utilityCost + maintenanceCost;
      
      // Generate laundry weight (in kg)
      const totalWeight = getRandomNumber(200, 2000);
      // Calculate cost per kg
      const costPerKg = totalCost / totalWeight;
      
      costData.push({
        departmentId: department.id,
        month: formattedMonth,
        totalWeight,
        totalCost,
        costPerKg
      });
    }
  }
  
  // Create batches of 10 to avoid overloading the database
  for (let i = 0; i < costData.length; i += 10) {
    const batch = costData.slice(i, i + 10);
    await db.insert(costAllocations).values(batch);
  }
  
  console.log(`Seeded ${costData.length} cost allocations`);
}

export async function checkIfDataExists() {
  try {
    const taskCount = await db.select().from(tasks);
    const inventoryCount = await db.select().from(inventoryItems);
    const equipmentCount = await db.select().from(equipment);
    const processCount = await db.select().from(laundryProcesses);
    const costCount = await db.select().from(costAllocations);
    
    // Check if all types of data exist
    const allDataExists = 
      taskCount.length > 0 && 
      inventoryCount.length > 0 && 
      equipmentCount.length > 0 && 
      processCount.length > 0 && 
      costCount.length > 0;
    
    return allDataExists;
  } catch (error) {
    console.error("Error checking if data exists:", error);
    return false;
  }
}