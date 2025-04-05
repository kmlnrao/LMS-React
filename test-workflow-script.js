// Automated testing script for Laundry Management Workflow
import { execSync } from 'child_process';
import fs from 'fs';

// Global cookie jar
let cookies = '';

// Helper function to run curl commands and handle responses with cookie management
function makeRequest(method, endpoint, data = null) {
  // Ensure we're using the proper port from the server
  let command = `curl -s -X ${method} -c /tmp/cookies.txt -b /tmp/cookies.txt http://localhost:5000${endpoint}`;
  
  if (data) {
    // Escape single quotes in JSON data for shell commands
    command += ` -H "Content-Type: application/json" -d '${JSON.stringify(data).replace(/'/g, "'\\''")}'`;
  }
  
  try {
    console.log(`Executing: ${method} ${endpoint}`);
    const response = execSync(command, { encoding: 'utf8' });
    try {
      return JSON.parse(response);
    } catch (e) {
      console.error(`Response is not valid JSON: ${response}`);
      return { error: "Invalid JSON response", raw: response };
    }
  } catch (error) {
    console.error(`Error executing request: ${error.message}`);
    if (error.stdout) {
      try {
        return JSON.parse(error.stdout);
      } catch (e) {
        return { error: error.stdout };
      }
    }
    return { error: error.message };
  }
}

// Create test users for each role
async function createTestUsers() {
  console.log("\n========== Creating Test Users ==========");
  
  // First, login as admin to be able to create users
  const loginResult = makeRequest('POST', '/api/auth/login', {
    username: 'admin',
    password: 'admin123'
  });
  
  if (loginResult.error) {
    console.error("Admin login failed:", loginResult.error);
    return false;
  }
  
  console.log("Logged in as admin to create test users");
  
  const testUsers = [
    { 
      username: "rakesh.sharma", 
      password: "password123", 
      confirmPassword: "password123", 
      name: "Rakesh Sharma", 
      role: "department", 
      department: "Cardiology", 
      email: "rakesh@hospital.com", 
      phone: "9876543210" 
    },
    { 
      username: "priya.patel", 
      password: "password123", 
      confirmPassword: "password123", 
      name: "Priya Patel", 
      role: "supervisor", 
      department: "Laundry", 
      email: "priya@hospital.com", 
      phone: "9876543211" 
    },
    { 
      username: "amit.kumar", 
      password: "password123", 
      confirmPassword: "password123", 
      name: "Amit Kumar", 
      role: "staff", 
      department: "Laundry", 
      email: "amit@hospital.com", 
      phone: "9876543212" 
    },
    { 
      username: "ananya.singh", 
      password: "password123", 
      confirmPassword: "password123", 
      name: "Ananya Singh", 
      role: "manager", 
      department: "Laundry", 
      email: "ananya@hospital.com", 
      phone: "9876543213" 
    },
    { 
      username: "raj.malhotra", 
      password: "password123", 
      confirmPassword: "password123", 
      name: "Raj Malhotra", 
      role: "inventory", 
      department: "Laundry", 
      email: "raj@hospital.com", 
      phone: "9876543214" 
    },
    { 
      username: "vikram.mehta", 
      password: "password123", 
      confirmPassword: "password123", 
      name: "Vikram Mehta", 
      role: "technician", 
      department: "Maintenance", 
      email: "vikram@hospital.com", 
      phone: "9876543215" 
    },
    { 
      username: "neha.gupta", 
      password: "password123", 
      confirmPassword: "password123", 
      name: "Neha Gupta", 
      role: "billing", 
      department: "Accounts", 
      email: "neha@hospital.com", 
      phone: "9876543216" 
    },
    { 
      username: "sanjay.verma", 
      password: "password123", 
      confirmPassword: "password123", 
      name: "Sanjay Verma", 
      role: "reports", 
      department: "Analytics", 
      email: "sanjay@hospital.com", 
      phone: "9876543217" 
    }
  ];
  
  // Get existing users to avoid duplicates
  const existingUsers = makeRequest('GET', '/api/users');
  
  if (existingUsers.error) {
    console.error("Failed to get users list:", existingUsers.error);
    return false;
  }
  
  console.log(`Found ${existingUsers.length} existing users`);
  const existingUsernames = existingUsers.map(user => user.username);
  
  for (const user of testUsers) {
    if (existingUsernames.includes(user.username)) {
      console.log(`User ${user.username} already exists.`);
      continue;
    }
    
    const result = makeRequest('POST', '/api/users', user);
    
    if (result.error) {
      console.error(`Failed to create user ${user.username}:`, result.error);
    } else {
      console.log(`Created user: ${user.username} with role: ${user.role}`);
    }
  }
  
  return true;
}

// Test workflow step 1: Department Head creates a task
async function testDepartmentTaskCreation() {
  console.log("\n========== Step 1: Department Task Creation ==========");
  
  // Login as department head
  const login = makeRequest('POST', '/api/auth/login', { 
    username: 'rakesh.sharma', 
    password: 'password123' 
  });
  
  if (login.error) {
    console.error("Login failed:", login.error);
    return null;
  }
  
  console.log("Logged in as Department Head: rakesh.sharma");
  
  // Get department ID for the user
  const departments = makeRequest('GET', '/api/departments');
  const userDepartment = departments.find(dept => dept.name === "Cardiology") || departments[0];
  
  if (!userDepartment) {
    console.error("Could not find a department for the task");
    return null;
  }
  
  // Create a task
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // Get the current user
  const sessionResponse = makeRequest('GET', '/api/auth/session');
  if (sessionResponse.error || !sessionResponse.user) {
    console.error("Failed to get current user session");
    return null;
  }
  
  const userId = sessionResponse.user.id;
  console.log(`Current user ID: ${userId}`);
  
  const taskData = {
    description: "Urgent bedding change for isolation ward",
    departmentId: userDepartment.id,
    requestedById: userId,
    assignedToId: null, // Will be assigned by supervisor
    priority: "high",
    status: "pending",
    weight: 15,
    dueDate: tomorrow.toISOString(),
    notes: "Patient discharge expected, need priority service",
    taskId: `LT-${Math.floor(10000 + Math.random() * 90000)}` // Generate a random task ID
  };
  
  const newTask = makeRequest('POST', '/api/tasks', taskData);
  
  if (newTask.error) {
    console.error("Task creation failed:", newTask.error);
    return null;
  }
  
  console.log(`Task created with ID: ${newTask.taskId}`);
  return newTask;
}

// Test workflow step 2: Supervisor reviews and assigns task
async function testSupervisorAssignment(taskId) {
  console.log("\n========== Step 2: Supervisor Task Assignment ==========");
  
  // Login as supervisor
  const login = makeRequest('POST', '/api/auth/login', { 
    username: 'priya.patel', 
    password: 'password123' 
  });
  
  if (login.error) {
    console.error("Login failed:", login.error);
    return false;
  }
  
  console.log("Logged in as Supervisor: priya.patel");
  
  // Get the task details
  const tasks = makeRequest('GET', '/api/tasks');
  const targetTask = tasks.find(task => task.id === taskId);
  
  if (!targetTask) {
    console.error(`Task with ID ${taskId} not found`);
    return false;
  }
  
  // Get staff user for assignment
  const users = makeRequest('GET', '/api/users');
  const staffUser = users.find(user => user.role === 'staff');
  
  if (!staffUser) {
    console.error("No staff user found for assignment");
    return false;
  }
  
  // Update task status to in_progress and assign to staff
  const updateData = {
    status: "in_progress",
    assignedToId: staffUser.id
  };
  
  const updatedTask = makeRequest('PATCH', `/api/tasks/${targetTask.id}`, updateData);
  
  if (updatedTask.error) {
    console.error("Task update failed:", updatedTask.error);
    return false;
  }
  
  console.log(`Task assigned to ${staffUser.name} and status updated to in_progress`);
  return true;
}

// Test workflow step 3: Staff processes the task
async function testStaffProcessing(taskId) {
  console.log("\n========== Step 3: Staff Task Processing ==========");
  
  // Login as staff
  const login = makeRequest('POST', '/api/auth/login', { 
    username: 'amit.kumar', 
    password: 'password123' 
  });
  
  if (login.error) {
    console.error("Login failed:", login.error);
    return false;
  }
  
  console.log("Logged in as Staff: amit.kumar");
  
  // Get the task details
  const tasks = makeRequest('GET', '/api/tasks');
  const targetTask = tasks.find(task => task.id === taskId);
  
  if (!targetTask) {
    console.error(`Task with ID ${taskId} not found`);
    return false;
  }
  
  // Complete the task
  const updateData = {
    status: "completed",
    completedAt: new Date().toISOString()
  };
  
  const updatedTask = makeRequest('PATCH', `/api/tasks/${targetTask.id}`, updateData);
  
  if (updatedTask.error) {
    console.error("Task completion failed:", updatedTask.error);
    return false;
  }
  
  console.log(`Task marked as completed by staff`);
  return true;
}

// Test workflow step 4: Manager verification
async function testManagerVerification(taskId) {
  console.log("\n========== Step 4: Manager Verification ==========");
  
  // Login as manager
  const login = makeRequest('POST', '/api/auth/login', { 
    username: 'ananya.singh', 
    password: 'password123' 
  });
  
  if (login.error) {
    console.error("Login failed:", login.error);
    return false;
  }
  
  console.log("Logged in as Manager: ananya.singh");
  
  // Get the completed task details
  const tasks = makeRequest('GET', '/api/tasks');
  const targetTask = tasks.find(task => task.id === taskId);
  
  if (!targetTask) {
    console.error(`Task with ID ${taskId} not found`);
    return false;
  }
  
  if (targetTask.status !== 'completed') {
    console.error(`Task with ID ${taskId} is not completed. Current status: ${targetTask.status}`);
    return false;
  }
  
  console.log(`Manager verified task completion: Task ${targetTask.taskId} is properly completed`);
  console.log(`Task details: ${JSON.stringify(targetTask, null, 2)}`);
  
  return true;
}

// Run the complete workflow test
async function runWorkflowTest() {
  console.log("=================================================");
  console.log("Starting Automated Laundry Management Workflow Test");
  console.log("=================================================");
  
  // Step 0: Create test users if they don't exist
  await createTestUsers();
  
  // Step 1: Department Head creates a task
  const newTask = await testDepartmentTaskCreation();
  if (!newTask) {
    console.error("Workflow test failed at step 1: Task creation");
    return;
  }
  
  // Step 2: Supervisor assigns the task
  const assignmentSuccess = await testSupervisorAssignment(newTask.id);
  if (!assignmentSuccess) {
    console.error("Workflow test failed at step 2: Task assignment");
    return;
  }
  
  // Step 3: Staff processes and completes the task
  const processingSuccess = await testStaffProcessing(newTask.id);
  if (!processingSuccess) {
    console.error("Workflow test failed at step 3: Task processing");
    return;
  }
  
  // Step 4: Manager verifies the completed task
  const verificationSuccess = await testManagerVerification(newTask.id);
  if (!verificationSuccess) {
    console.error("Workflow test failed at step 4: Task verification");
    return;
  }
  
  console.log("\n=================================================");
  console.log("Workflow Test Completed Successfully!");
  console.log("=================================================");
}

// Execute the workflow test
runWorkflowTest();