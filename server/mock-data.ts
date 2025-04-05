/**
 * Comprehensive mock data for the Laundry Management System
 * Includes 50+ Indian users with different roles
 */

import { User, Department, Task, InventoryItem, Equipment, LaundryProcess, CostAllocation } from "../shared/schema";

// Indian names for users
export const mockUsers: User[] = [
  // Admin users (5)
  {
    id: 1,
    username: "rajesh.kumar",
    name: "Rajesh Kumar",
    email: "rajesh.kumar@hospital.org",
    role: "admin",
    department: "Administration",
    active: true,
    lastLogin: new Date(Date.now() - 1800000).toISOString()
  },
  {
    id: 2,
    username: "priya.sharma",
    name: "Priya Sharma",
    email: "priya.sharma@hospital.org",
    role: "admin",
    department: "Administration",
    active: true,
    lastLogin: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 3,
    username: "amit.patel",
    name: "Amit Patel",
    email: "amit.patel@hospital.org",
    role: "admin",
    department: "IT",
    active: true,
    lastLogin: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 4,
    username: "sunita.reddy",
    name: "Sunita Reddy",
    email: "sunita.reddy@hospital.org",
    role: "admin",
    department: "Operations",
    active: true,
    lastLogin: new Date(Date.now() - 172800000).toISOString()
  },
  {
    id: 5,
    username: "rahul.malhotra",
    name: "Rahul Malhotra",
    email: "rahul.malhotra@hospital.org",
    role: "admin",
    department: "Finance",
    active: true,
    lastLogin: new Date(Date.now() - 259200000).toISOString()
  },
  
  // Staff users - Laundry Department (15)
  {
    id: 6,
    username: "vikram.singh",
    name: "Vikram Singh",
    email: "vikram.singh@hospital.org",
    role: "staff",
    department: "Laundry",
    active: true,
    lastLogin: new Date(Date.now() - 43200000).toISOString()
  },
  {
    id: 7,
    username: "neha.gupta",
    name: "Neha Gupta",
    email: "neha.gupta@hospital.org",
    role: "staff",
    department: "Laundry",
    active: true,
    lastLogin: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 8,
    username: "arjun.nair",
    name: "Arjun Nair",
    email: "arjun.nair@hospital.org",
    role: "staff",
    department: "Laundry",
    active: true,
    lastLogin: new Date(Date.now() - 129600000).toISOString()
  },
  {
    id: 9,
    username: "deepa.menon",
    name: "Deepa Menon",
    email: "deepa.menon@hospital.org",
    role: "staff",
    department: "Laundry",
    active: true,
    lastLogin: new Date(Date.now() - 172800000).toISOString()
  },
  {
    id: 10,
    username: "kiran.joshi",
    name: "Kiran Joshi",
    email: "kiran.joshi@hospital.org",
    role: "staff",
    department: "Laundry",
    active: true,
    lastLogin: new Date(Date.now() - 43200000).toISOString()
  },
  {
    id: 11,
    username: "anil.nayak",
    name: "Anil Nayak",
    email: "anil.nayak@hospital.org",
    role: "staff",
    department: "Laundry",
    active: true,
    lastLogin: new Date(Date.now() - 129600000).toISOString()
  },
  {
    id: 12,
    username: "meena.rao",
    name: "Meena Rao",
    email: "meena.rao@hospital.org",
    role: "staff",
    department: "Laundry",
    active: true,
    lastLogin: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 13,
    username: "vivek.mishra",
    name: "Vivek Mishra",
    email: "vivek.mishra@hospital.org",
    role: "staff",
    department: "Laundry",
    active: true,
    lastLogin: new Date(Date.now() - 302400000).toISOString()
  },
  {
    id: 14,
    username: "pooja.malik",
    name: "Pooja Malik",
    email: "pooja.malik@hospital.org",
    role: "staff",
    department: "Laundry",
    active: true,
    lastLogin: new Date(Date.now() - 172800000).toISOString()
  },
  {
    id: 15,
    username: "sanjay.verma",
    name: "Sanjay Verma",
    email: "sanjay.verma@hospital.org",
    role: "staff",
    department: "Laundry",
    active: true,
    lastLogin: new Date(Date.now() - 172800000).toISOString()
  },
  {
    id: 16,
    username: "divya.rajan",
    name: "Divya Rajan",
    email: "divya.rajan@hospital.org",
    role: "staff",
    department: "Laundry",
    active: true,
    lastLogin: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 17,
    username: "praveen.khurana",
    name: "Praveen Khurana",
    email: "praveen.khurana@hospital.org",
    role: "staff",
    department: "Laundry",
    active: true,
    lastLogin: new Date(Date.now() - 259200000).toISOString()
  },
  {
    id: 18,
    username: "anjali.mathew",
    name: "Anjali Mathew",
    email: "anjali.mathew@hospital.org",
    role: "staff",
    department: "Laundry",
    active: true,
    lastLogin: new Date(Date.now() - 129600000).toISOString()
  },
  {
    id: 19,
    username: "ravi.pillai",
    name: "Ravi Pillai",
    email: "ravi.pillai@hospital.org",
    role: "staff",
    department: "Laundry",
    active: true,
    lastLogin: new Date(Date.now() - 302400000).toISOString()
  },
  {
    id: 20,
    username: "rekha.tiwari",
    name: "Rekha Tiwari",
    email: "rekha.tiwari@hospital.org",
    role: "staff",
    department: "Laundry",
    active: true,
    lastLogin: new Date(Date.now() - 345600000).toISOString()
  },
  
  // Department users (30)
  // Emergency Department (6)
  {
    id: 21,
    username: "vinod.reddy",
    name: "Dr. Vinod Reddy",
    email: "vinod.reddy@hospital.org",
    role: "department",
    department: "Emergency",
    active: true,
    lastLogin: new Date(Date.now() - 43200000).toISOString()
  },
  {
    id: 22,
    username: "ritika.chadha",
    name: "Ritika Chadha",
    email: "ritika.chadha@hospital.org",
    role: "department",
    department: "Emergency",
    active: true,
    lastLogin: new Date(Date.now() - 129600000).toISOString()
  },
  {
    id: 23,
    username: "suresh.murthy",
    name: "Suresh Murthy",
    email: "suresh.murthy@hospital.org",
    role: "department",
    department: "Emergency",
    active: true,
    lastLogin: new Date(Date.now() - 172800000).toISOString()
  },
  {
    id: 24,
    username: "kavita.bose",
    name: "Kavita Bose",
    email: "kavita.bose@hospital.org",
    role: "department",
    department: "Emergency",
    active: true,
    lastLogin: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 25,
    username: "dinesh.iyer",
    name: "Dinesh Iyer",
    email: "dinesh.iyer@hospital.org",
    role: "department",
    department: "Emergency",
    active: true,
    lastLogin: new Date(Date.now() - 172800000).toISOString()
  },
  {
    id: 26,
    username: "ananya.krishnan",
    name: "Ananya Krishnan",
    email: "ananya.krishnan@hospital.org",
    role: "department",
    department: "Emergency",
    active: true,
    lastLogin: new Date(Date.now() - 259200000).toISOString()
  },
  
  // Surgery Department (6)
  {
    id: 27,
    username: "manoj.kapoor",
    name: "Dr. Manoj Kapoor",
    email: "manoj.kapoor@hospital.org",
    role: "department",
    department: "Surgery",
    active: true,
    lastLogin: new Date(Date.now() - 43200000).toISOString()
  },
  {
    id: 28,
    username: "jyoti.saxena",
    name: "Jyoti Saxena",
    email: "jyoti.saxena@hospital.org",
    role: "department",
    department: "Surgery",
    active: true,
    lastLogin: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 29,
    username: "rajat.khanna",
    name: "Rajat Khanna",
    email: "rajat.khanna@hospital.org",
    role: "department",
    department: "Surgery",
    active: true,
    lastLogin: new Date(Date.now() - 129600000).toISOString()
  },
  {
    id: 30,
    username: "nandini.sen",
    name: "Nandini Sen",
    email: "nandini.sen@hospital.org",
    role: "department",
    department: "Surgery",
    active: true,
    lastLogin: new Date(Date.now() - 172800000).toISOString()
  },
  {
    id: 31,
    username: "prakash.vaidya",
    name: "Prakash Vaidya",
    email: "prakash.vaidya@hospital.org",
    role: "department",
    department: "Surgery",
    active: true,
    lastLogin: new Date(Date.now() - 259200000).toISOString()
  },
  {
    id: 32,
    username: "renuka.devi",
    name: "Renuka Devi",
    email: "renuka.devi@hospital.org",
    role: "department",
    department: "Surgery",
    active: true,
    lastLogin: new Date(Date.now() - 302400000).toISOString()
  },
  
  // Pediatrics Department (6)
  {
    id: 33,
    username: "harish.mehta",
    name: "Dr. Harish Mehta",
    email: "harish.mehta@hospital.org",
    role: "department",
    department: "Pediatrics",
    active: true,
    lastLogin: new Date(Date.now() - 43200000).toISOString()
  },
  {
    id: 34,
    username: "meera.agarwal",
    name: "Meera Agarwal",
    email: "meera.agarwal@hospital.org",
    role: "department",
    department: "Pediatrics",
    active: true,
    lastLogin: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 35,
    username: "rohit.bajaj",
    name: "Rohit Bajaj",
    email: "rohit.bajaj@hospital.org",
    role: "department",
    department: "Pediatrics",
    active: true,
    lastLogin: new Date(Date.now() - 129600000).toISOString()
  },
  {
    id: 36,
    username: "smita.goyal",
    name: "Smita Goyal",
    email: "smita.goyal@hospital.org",
    role: "department",
    department: "Pediatrics",
    active: true,
    lastLogin: new Date(Date.now() - 172800000).toISOString()
  },
  {
    id: 37,
    username: "anand.rao",
    name: "Anand Rao",
    email: "anand.rao@hospital.org",
    role: "department",
    department: "Pediatrics",
    active: true,
    lastLogin: new Date(Date.now() - 259200000).toISOString()
  },
  {
    id: 38,
    username: "reena.pandit",
    name: "Reena Pandit",
    email: "reena.pandit@hospital.org",
    role: "department",
    department: "Pediatrics",
    active: true,
    lastLogin: new Date(Date.now() - 302400000).toISOString()
  },
  
  // ICU Department (6)
  {
    id: 39,
    username: "vikas.bansal",
    name: "Dr. Vikas Bansal",
    email: "vikas.bansal@hospital.org",
    role: "department",
    department: "ICU",
    active: true,
    lastLogin: new Date(Date.now() - 43200000).toISOString()
  },
  {
    id: 40,
    username: "sarika.naidu",
    name: "Sarika Naidu",
    email: "sarika.naidu@hospital.org",
    role: "department",
    department: "ICU",
    active: true,
    lastLogin: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 41,
    username: "alok.datta",
    name: "Alok Datta",
    email: "alok.datta@hospital.org",
    role: "department",
    department: "ICU",
    active: true,
    lastLogin: new Date(Date.now() - 129600000).toISOString()
  },
  {
    id: 42,
    username: "nisha.hegde",
    name: "Nisha Hegde",
    email: "nisha.hegde@hospital.org",
    role: "department",
    department: "ICU",
    active: true,
    lastLogin: new Date(Date.now() - 172800000).toISOString()
  },
  {
    id: 43,
    username: "gaurav.arora",
    name: "Gaurav Arora",
    email: "gaurav.arora@hospital.org",
    role: "department",
    department: "ICU",
    active: true,
    lastLogin: new Date(Date.now() - 259200000).toISOString()
  },
  {
    id: 44,
    username: "madhu.chawla",
    name: "Madhu Chawla",
    email: "madhu.chawla@hospital.org",
    role: "department",
    department: "ICU",
    active: true,
    lastLogin: new Date(Date.now() - 302400000).toISOString()
  },
  
  // OPD Department (6)
  {
    id: 45,
    username: "ramesh.bhatt",
    name: "Dr. Ramesh Bhatt",
    email: "ramesh.bhatt@hospital.org",
    role: "department",
    department: "OPD",
    active: true,
    lastLogin: new Date(Date.now() - 43200000).toISOString()
  },
  {
    id: 46,
    username: "reshma.khalid",
    name: "Reshma Khalid",
    email: "reshma.khalid@hospital.org",
    role: "department",
    department: "OPD",
    active: true,
    lastLogin: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 47,
    username: "siddharth.roy",
    name: "Siddharth Roy",
    email: "siddharth.roy@hospital.org",
    role: "department",
    department: "OPD",
    active: true,
    lastLogin: new Date(Date.now() - 129600000).toISOString()
  },
  {
    id: 48,
    username: "pallavi.desai",
    name: "Pallavi Desai",
    email: "pallavi.desai@hospital.org",
    role: "department",
    department: "OPD",
    active: true,
    lastLogin: new Date(Date.now() - 172800000).toISOString()
  },
  {
    id: 49,
    username: "tejas.shah",
    name: "Tejas Shah",
    email: "tejas.shah@hospital.org",
    role: "department",
    department: "OPD",
    active: true,
    lastLogin: new Date(Date.now() - 259200000).toISOString()
  },
  {
    id: 50,
    username: "anita.sinha",
    name: "Anita Sinha",
    email: "anita.sinha@hospital.org",
    role: "department",
    department: "OPD",
    active: true,
    lastLogin: new Date(Date.now() - 302400000).toISOString()
  }
];

// Mock departments
export const mockDepartments: Department[] = [
  {
    id: 1,
    name: "Emergency",
    location: "Ground Floor, Block A",
    contactPerson: "Dr. Vinod Reddy",
    contactNumber: "9876543210",
    priorityLevel: "high"
  },
  {
    id: 2,
    name: "Surgery",
    location: "1st Floor, Block B",
    contactPerson: "Dr. Manoj Kapoor",
    contactNumber: "9876543211",
    priorityLevel: "high"
  },
  {
    id: 3,
    name: "Pediatrics",
    location: "2nd Floor, Block A",
    contactPerson: "Dr. Harish Mehta",
    contactNumber: "9876543212",
    priorityLevel: "medium"
  },
  {
    id: 4,
    name: "ICU",
    location: "1st Floor, Block C",
    contactPerson: "Dr. Vikas Bansal",
    contactNumber: "9876543213",
    priorityLevel: "critical"
  },
  {
    id: 5,
    name: "OPD",
    location: "Ground Floor, Block B",
    contactPerson: "Dr. Ramesh Bhatt",
    contactNumber: "9876543214",
    priorityLevel: "low"
  },
  {
    id: 6,
    name: "Labor & Delivery",
    location: "2nd Floor, Block C",
    contactPerson: "Dr. Ananya Krishnan",
    contactNumber: "9876543215",
    priorityLevel: "high"
  },
  {
    id: 7,
    name: "Orthopedics",
    location: "3rd Floor, Block B",
    contactPerson: "Dr. Rajat Khanna",
    contactNumber: "9876543216",
    priorityLevel: "medium"
  },
  {
    id: 8,
    name: "Neurology",
    location: "3rd Floor, Block C",
    contactPerson: "Dr. Smita Goyal",
    contactNumber: "9876543217",
    priorityLevel: "medium"
  }
];

// Mock tasks with varied statuses across departments
export const mockTasks: Task[] = [
  // Emergency Department Tasks
  {
    id: 1,
    taskId: "LT-1001",
    description: "Emergency room linens change",
    requestedById: 21, // Dr. Vinod Reddy
    assignedToId: 6, // Vikram Singh
    departmentId: 1, // Emergency
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
    description: "Isolation room deep cleaning",
    requestedById: 22, // Ritika Chadha
    assignedToId: 7, // Neha Gupta
    departmentId: 1, // Emergency
    status: "pending",
    priority: "critical",
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    completedAt: null,
    dueDate: new Date(Date.now() + 3600000).toISOString(),
    weight: 4.0,
    notes: "Isolation protocol required. Use special disinfectant."
  },
  {
    id: 3,
    taskId: "LT-1003",
    description: "Trauma room curtains change",
    requestedById: 23, // Suresh Murthy
    assignedToId: 8, // Arjun Nair
    departmentId: 1, // Emergency
    status: "completed",
    priority: "medium",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    completedAt: new Date(Date.now() - 43200000).toISOString(),
    dueDate: new Date(Date.now() - 50400000).toISOString(),
    weight: 3.5,
    notes: "Standard weekly change completed"
  },
  
  // Surgery Department Tasks
  {
    id: 4,
    taskId: "LT-1004",
    description: "Surgery special equipment cleaning",
    requestedById: 27, // Dr. Manoj Kapoor
    assignedToId: 9, // Deepa Menon
    departmentId: 2, // Surgery
    status: "completed",
    priority: "high",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    completedAt: new Date(Date.now() - 43200000).toISOString(),
    dueDate: new Date(Date.now() - 86400000).toISOString(),
    weight: 3.5,
    notes: "Special detergent used for surgical equipment"
  },
  {
    id: 5,
    taskId: "LT-1005",
    description: "Pre-op area daily linen change",
    requestedById: 28, // Jyoti Saxena
    assignedToId: 10, // Kiran Joshi
    departmentId: 2, // Surgery
    status: "in_progress",
    priority: "medium",
    createdAt: new Date(Date.now() - 10800000).toISOString(),
    completedAt: null,
    dueDate: new Date(Date.now() + 3600000).toISOString(),
    weight: 4.8,
    notes: "Standard daily change for pre-op area"
  },
  {
    id: 6,
    taskId: "LT-1006",
    description: "Post-op recovery room urgent cleaning",
    requestedById: 29, // Rajat Khanna
    assignedToId: 11, // Anil Nayak
    departmentId: 2, // Surgery
    status: "pending",
    priority: "high",
    createdAt: new Date(Date.now() - 5400000).toISOString(),
    completedAt: null,
    dueDate: new Date(Date.now() + 1800000).toISOString(),
    weight: 3.2,
    notes: "Required after emergency procedure"
  },
  
  // Pediatrics Department Tasks
  {
    id: 7,
    taskId: "LT-1007",
    description: "Pediatrics daily linen change",
    requestedById: 33, // Dr. Harish Mehta
    assignedToId: 12, // Meena Rao
    departmentId: 3, // Pediatrics
    status: "pending",
    priority: "medium",
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    completedAt: null,
    dueDate: new Date(Date.now() + 86400000).toISOString(),
    weight: 4.8,
    notes: "Standard daily change for pediatrics ward"
  },
  {
    id: 8,
    taskId: "LT-1008",
    description: "Children's play area sanitization",
    requestedById: 34, // Meera Agarwal
    assignedToId: 13, // Vivek Mishra
    departmentId: 3, // Pediatrics
    status: "completed",
    priority: "medium",
    createdAt: new Date(Date.now() - 129600000).toISOString(),
    completedAt: new Date(Date.now() - 86400000).toISOString(),
    dueDate: new Date(Date.now() - 100800000).toISOString(),
    weight: 2.5,
    notes: "Weekly deep cleaning of play area completed"
  },
  {
    id: 9,
    taskId: "LT-1009",
    description: "Special hypoallergenic bedding change",
    requestedById: 35, // Rohit Bajaj
    assignedToId: 14, // Pooja Malik
    departmentId: 3, // Pediatrics
    status: "delayed",
    priority: "medium",
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    completedAt: null,
    dueDate: new Date(Date.now() - 172800000).toISOString(),
    weight: 3.0,
    notes: "Delayed due to material shortage"
  },
  
  // ICU Department Tasks
  {
    id: 10,
    taskId: "LT-1010",
    description: "ICU isolation beds complete change",
    requestedById: 39, // Dr. Vikas Bansal
    assignedToId: 6, // Vikram Singh
    departmentId: 4, // ICU
    status: "in_progress",
    priority: "critical",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    completedAt: null,
    dueDate: new Date(Date.now() + 1800000).toISOString(),
    weight: 6.5,
    notes: "Critical patient turnover. Use sterile protocol."
  },
  {
    id: 11,
    taskId: "LT-1011",
    description: "Critical care area daily linen",
    requestedById: 40, // Sarika Naidu
    assignedToId: 15, // Sanjay Verma
    departmentId: 4, // ICU
    status: "pending",
    priority: "high",
    createdAt: new Date(Date.now() - 10800000).toISOString(),
    completedAt: null,
    dueDate: new Date(Date.now() + 7200000).toISOString(),
    weight: 5.0,
    notes: "Morning schedule for critical care unit"
  },
  {
    id: 12,
    taskId: "LT-1012",
    description: "Ventilator patient special linens",
    requestedById: 41, // Alok Datta
    assignedToId: 7, // Neha Gupta
    departmentId: 4, // ICU
    status: "completed",
    priority: "high",
    createdAt: new Date(Date.now() - 43200000).toISOString(),
    completedAt: new Date(Date.now() - 21600000).toISOString(),
    dueDate: new Date(Date.now() - 28800000).toISOString(),
    weight: 2.8,
    notes: "Special moisture-wicking linens used"
  },
  
  // OPD Department Tasks
  {
    id: 13,
    taskId: "LT-1013",
    description: "OPD examination rooms routine change",
    requestedById: 45, // Dr. Ramesh Bhatt
    assignedToId: 16, // Divya Rajan
    departmentId: 5, // OPD
    status: "pending",
    priority: "low",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    completedAt: null,
    dueDate: new Date(Date.now() + 259200000).toISOString(),
    weight: 4.2,
    notes: "Weekly scheduled change"
  },
  {
    id: 14,
    taskId: "LT-1014",
    description: "Waiting area curtains cleaning",
    requestedById: 46, // Reshma Khalid
    assignedToId: 17, // Praveen Khurana
    departmentId: 5, // OPD
    status: "delayed",
    priority: "low",
    createdAt: new Date(Date.now() - 345600000).toISOString(),
    completedAt: null,
    dueDate: new Date(Date.now() - 172800000).toISOString(),
    weight: 5.5,
    notes: "Delayed due to staff shortage"
  },
  {
    id: 15,
    taskId: "LT-1015",
    description: "Specialty clinic supplies refresh",
    requestedById: 47, // Siddharth Roy
    assignedToId: 18, // Anjali Mathew
    departmentId: 5, // OPD
    status: "completed",
    priority: "medium",
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    completedAt: new Date(Date.now() - 86400000).toISOString(),
    dueDate: new Date(Date.now() - 129600000).toISOString(),
    weight: 3.0,
    notes: "Monthly refresh completed on schedule"
  }
];

// Mock inventory items with Indian pricing
export const mockInventoryItems: InventoryItem[] = [
  {
    id: 1,
    name: "Bed Sheets (Queen)",
    category: "Linens",
    quantity: 450,
    minimumLevel: 120,
    unitCost: 750.50, // ₹750.50
    location: "Storage Room A",
    lastRestocked: new Date(Date.now() - 604800000).toISOString(),
    supplier: "Hospital Textiles India Ltd."
  },
  {
    id: 2,
    name: "Pillowcases",
    category: "Linens",
    quantity: 620,
    minimumLevel: 180,
    unitCost: 325.25, // ₹325.25
    location: "Storage Room A",
    lastRestocked: new Date(Date.now() - 302400000).toISOString(),
    supplier: "Hospital Textiles India Ltd."
  },
  {
    id: 3,
    name: "Surgical Towels",
    category: "Surgical",
    quantity: 285,
    minimumLevel: 150,
    unitCost: 575.75, // ₹575.75
    location: "Storage Room B",
    lastRestocked: new Date(Date.now() - 172800000).toISOString(),
    supplier: "MedSupply Co."
  },
  {
    id: 4,
    name: "Laundry Detergent (Industrial)",
    category: "Cleaning",
    quantity: 32,
    minimumLevel: 15,
    unitCost: 3500.99, // ₹3,500.99
    location: "Supply Closet 2",
    lastRestocked: new Date(Date.now() - 1209600000).toISOString(),
    supplier: "CleanPro Industries"
  },
  {
    id: 5,
    name: "Patient Gowns",
    category: "Patient",
    quantity: 320,
    minimumLevel: 100,
    unitCost: 425.00, // ₹425.00
    location: "Storage Room A",
    lastRestocked: new Date(Date.now() - 432000000).toISOString(),
    supplier: "Hospital Textiles India Ltd."
  },
  {
    id: 6,
    name: "Blankets",
    category: "Linens",
    quantity: 230,
    minimumLevel: 80,
    unitCost: 1250.00, // ₹1,250.00
    location: "Storage Room C",
    lastRestocked: new Date(Date.now() - 864000000).toISOString(),
    supplier: "ComfortCare Supplies"
  },
  {
    id: 7,
    name: "Oxygen Mask Covers",
    category: "Surgical",
    quantity: 175,
    minimumLevel: 50,
    unitCost: 225.50, // ₹225.50
    location: "Storage Room B",
    lastRestocked: new Date(Date.now() - 345600000).toISOString(),
    supplier: "MedSupply Co."
  },
  {
    id: 8,
    name: "Fabric Softener (Industrial)",
    category: "Cleaning",
    quantity: 28,
    minimumLevel: 12,
    unitCost: 2250.00, // ₹2,250.00
    location: "Supply Closet 2",
    lastRestocked: new Date(Date.now() - 1036800000).toISOString(),
    supplier: "CleanPro Industries"
  },
  {
    id: 9,
    name: "Pediatric Sheets (Printed)",
    category: "Linens",
    quantity: 180,
    minimumLevel: 60,
    unitCost: 850.75, // ₹850.75
    location: "Storage Room A",
    lastRestocked: new Date(Date.now() - 518400000).toISOString(),
    supplier: "KidsCare Textiles"
  },
  {
    id: 10,
    name: "Scrub Suits",
    category: "Staff",
    quantity: 210,
    minimumLevel: 70,
    unitCost: 1750.00, // ₹1,750.00
    location: "Staff Locker Room",
    lastRestocked: new Date(Date.now() - 691200000).toISOString(),
    supplier: "MedWear India"
  }
];

// Mock equipment
export const mockEquipment: Equipment[] = [
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
  },
  {
    id: 5,
    name: "Industrial Washer #2",
    model: "WasherPro X5000",
    status: "active",
    location: "Laundry Room A",
    lastMaintenance: new Date(Date.now() - 3456000000).toISOString(),
    nextMaintenance: new Date(Date.now() + 1728000000).toISOString(),
    maintenanceNotes: "Operating normally. Scheduled for regular maintenance next month."
  },
  {
    id: 6,
    name: "Industrial Dryer #2",
    model: "DryMax 3000",
    status: "active",
    location: "Laundry Room A",
    lastMaintenance: new Date(Date.now() - 4320000000).toISOString(),
    nextMaintenance: new Date(Date.now() + 864000000).toISOString(),
    maintenanceNotes: "Lint filter replaced during last maintenance."
  },
  {
    id: 7,
    name: "Folding Machine #1",
    model: "FoldMaster Basic",
    status: "maintenance",
    location: "Laundry Room B",
    lastMaintenance: new Date(Date.now() - 172800000).toISOString(),
    nextMaintenance: new Date(Date.now() + 345600000).toISOString(),
    maintenanceNotes: "Tension belt snapped, awaiting replacement parts."
  },
  {
    id: 8,
    name: "Ironing Press",
    model: "FlatPress 2000",
    status: "in_queue",
    location: "Laundry Room C",
    lastMaintenance: new Date(Date.now() - 5184000000).toISOString(),
    nextMaintenance: new Date(Date.now() + 432000000).toISOString(),
    maintenanceNotes: "Awaiting turn for processing special surgical drapes."
  }
];

// Mock laundry processes
export const mockLaundryProcesses: LaundryProcess[] = [
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
    waterTemp: 45,
    detergentAmount: 55,
    isActive: false,
    notes: "Deprecated process. Use Standard Linen Wash instead."
  },
  {
    id: 6,
    name: "Isolation Garments",
    description: "Specialized process for isolation area garments",
    duration: 90,
    waterTemp: 75,
    detergentAmount: 80,
    isActive: true,
    notes: "Triple rinse with antimicrobial additive in final cycle."
  },
  {
    id: 7,
    name: "Allergy-Sensitive",
    description: "Process for allergy-sensitive patients",
    duration: 60,
    waterTemp: 60,
    detergentAmount: 30,
    isActive: true,
    notes: "Uses special hypoallergenic detergent and extra rinses."
  }
];

// Mock cost allocations with Indian currency values
export const mockCostAllocations: CostAllocation[] = [
  {
    id: 1,
    departmentId: 1, // Emergency
    month: "April 2025",
    year: 2025,
    baseAmount: 15000.00, // ₹15,000.00
    usageAmount: 7850.50, // ₹7,850.50
    specialServicesAmount: 2500.00, // ₹2,500.00
    totalAmount: 25350.50, // ₹25,350.50
    createdAt: new Date(Date.now() - 604800000).toISOString(),
    notes: "Higher usage due to increased emergency admissions"
  },
  {
    id: 2,
    departmentId: 2, // Surgery
    month: "April 2025",
    year: 2025,
    baseAmount: 18000.00, // ₹18,000.00
    usageAmount: 12500.75, // ₹12,500.75
    specialServicesAmount: 5000.00, // ₹5,000.00
    totalAmount: 35500.75, // ₹35,500.75
    createdAt: new Date(Date.now() - 604800000).toISOString(),
    notes: "Special services include surgical pack sterilization"
  },
  {
    id: 3,
    departmentId: 3, // Pediatrics
    month: "April 2025",
    year: 2025,
    baseAmount: 12000.00, // ₹12,000.00
    usageAmount: 6320.25, // ₹6,320.25
    specialServicesAmount: 1800.00, // ₹1,800.00
    totalAmount: 20120.25, // ₹20,120.25
    createdAt: new Date(Date.now() - 604800000).toISOString(),
    notes: "Special services for hypoallergenic processing"
  },
  {
    id: 4,
    departmentId: 4, // ICU
    month: "April 2025",
    year: 2025,
    baseAmount: 25000.00, // ₹25,000.00
    usageAmount: 18750.50, // ₹18,750.50
    specialServicesAmount: 7500.00, // ₹7,500.00
    totalAmount: 51250.50, // ₹51,250.50
    createdAt: new Date(Date.now() - 604800000).toISOString(),
    notes: "High volume due to full ICU capacity and isolation requirements"
  },
  {
    id: 5,
    departmentId: 5, // OPD
    month: "April 2025",
    year: 2025,
    baseAmount: 8000.00, // ₹8,000.00
    usageAmount: 3250.75, // ₹3,250.75
    specialServicesAmount: 500.00, // ₹500.00
    totalAmount: 11750.75, // ₹11,750.75
    createdAt: new Date(Date.now() - 604800000).toISOString(),
    notes: "Standard outpatient services"
  },
  {
    id: 6,
    departmentId: 1, // Emergency
    month: "March 2025",
    year: 2025,
    baseAmount: 15000.00, // ₹15,000.00
    usageAmount: 8450.25, // ₹8,450.25
    specialServicesAmount: 3000.00, // ₹3,000.00
    totalAmount: 26450.25, // ₹26,450.25
    createdAt: new Date(Date.now() - 2592000000).toISOString(),
    notes: "Month with multiple trauma incidents"
  },
  {
    id: 7,
    departmentId: 2, // Surgery
    month: "March 2025",
    year: 2025,
    baseAmount: 18000.00, // ₹18,000.00
    usageAmount: 11750.50, // ₹11,750.50
    specialServicesAmount: 4500.00, // ₹4,500.00
    totalAmount: 34250.50, // ₹34,250.50
    createdAt: new Date(Date.now() - 2592000000).toISOString(),
    notes: "High surgical volume month"
  },
  {
    id: 8,
    departmentId: 3, // Pediatrics
    month: "March 2025",
    year: 2025,
    baseAmount: 12000.00, // ₹12,000.00
    usageAmount: 5870.75, // ₹5,870.75
    specialServicesAmount: 1500.00, // ₹1,500.00
    totalAmount: 19370.75, // ₹19,370.75
    createdAt: new Date(Date.now() - 2592000000).toISOString(),
    notes: "Standard monthly charges"
  }
];

// Department usage statistics for analytics
export const mockDepartmentUsage = [
  { departmentName: "Emergency", usage: 28 },
  { departmentName: "Surgery", usage: 35 },
  { departmentName: "Pediatrics", usage: 18 },
  { departmentName: "ICU", usage: 45 },
  { departmentName: "OPD", usage: 12 }
];

// Task completion statistics for analytics
export const mockTaskCompletionStats = [
  { date: "2025-04-01", count: 12 },
  { date: "2025-04-02", count: 15 },
  { date: "2025-04-03", count: 9 },
  { date: "2025-04-04", count: 18 },
  { date: "2025-04-05", count: 14 },
  { date: "2025-04-06", count: 8 },
  { date: "2025-04-07", count: 11 }
];

// Dashboard statistics
export const mockDashboardStats = {
  pendingTasks: 42,
  completedToday: 15,
  inventoryStatus: 85,
  monthlyCosts: 143450.75 // ₹1,43,450.75
};