#!/usr/bin/env node
import { execSync } from 'child_process';
import fs from 'fs';

// Complete Laundry Workflow Test
// Tests the entire workflow from department request to admin verification
const API_BASE_URL = "http://localhost:5000";

// User credentials for each role in the workflow
const USERS = {
  department: { username: "rakesh.sharma", password: "password123", role: "department" },
  supervisor: { username: "priya.patel", password: "password123", role: "supervisor" },
  staff: { username: "amit.kumar", password: "password123", role: "staff" },
  manager: { username: "ananya.singh", password: "password123", role: "manager" },
  inventory: { username: "raj.malhotra", password: "password123", role: "inventory" },
  technician: { username: "vikram.mehta", password: "password123", role: "technician" },
  billing: { username: "neha.gupta", password: "password123", role: "billing" },
  reports: { username: "sanjay.verma", password: "password123", role: "reports" },
  admin: { username: "admin", password: "admin123", role: "admin" }
};

// Function to make HTTP requests with proper cookie handling
function makeRequest(role, method, endpoint, data = null, verbose = false) {
  const cookieJar = `/tmp/${role}_cookies.txt`;
  const url = `${API_BASE_URL}${endpoint}`;
  const verboseFlag = verbose ? '-v' : '-s';
  
  let cmd = `curl ${verboseFlag} -X ${method} -H "Content-Type: application/json"`;
  
  // Add cookies if they exist
  try {
    if (fs.existsSync(cookieJar)) {
      cmd += ` -b ${cookieJar}`;
    }
  } catch (e) {
    // Ignore
  }
  
  // Add data if provided
  if (data) {
    const jsonData = JSON.stringify(data).replace(/'/g, "\\'");
    cmd += ` -d '${jsonData}'`;
  }
  
  // Add cookie storage for session
  cmd += ` -c ${cookieJar} "${url}"`;
  
  console.log(`Executing as ${role}: ${method} ${endpoint}`);
  try {
    const output = execSync(cmd, { encoding: 'utf8' });
    try {
      // Try to parse as JSON
      return JSON.parse(output);
    } catch (e) {
      // If not JSON, return as is
      return output;
    }
  } catch (e) {
    console.error(`Error making request to ${endpoint} as ${role}:`, e.message);
    return null;
  }
}

// Helper function to log in a user
function login(role) {
  console.log(`\n*** Logging in as ${role} ***`);
  
  // Clear any existing cookies
  try {
    fs.unlinkSync(`/tmp/${role}_cookies.txt`);
  } catch (e) {
    // File may not exist, ignore
  }
  
  const user = USERS[role];
  const loginResponse = makeRequest(role, 'POST', '/api/auth/login', {
    username: user.username,
    password: user.password
  });
  
  if (!loginResponse || !loginResponse.user) {
    console.error(`Login failed for ${role}. Exiting.`);
    process.exit(1);
  }
  
  console.log(`Logged in as: ${loginResponse.user.name} (${loginResponse.user.role})`);
  return loginResponse.user;
}

// Step 1: Department Request (Task Creation)
async function departmentRequestStep() {
  console.log("\n=== STEP 1: DEPARTMENT REQUEST (TASK CREATION) ===");
  const departmentUser = login('department');
  
  // Get department info
  const departments = makeRequest('department', 'GET', '/api/departments');
  
  if (!departments || !departments.length) {
    console.error("No departments found. Make sure database is seeded. Exiting.");
    process.exit(1);
  }
  
  // Find the user's department
  let departmentId;
  if (departmentUser.department) {
    // If it's already a number, use it directly
    if (typeof departmentUser.department === 'number') {
      departmentId = departmentUser.department;
    } else {
      // Find the department by name
      const dept = departments.find(d => d.name === departmentUser.department);
      departmentId = dept ? dept.id : departments[0].id;
    }
  } else {
    departmentId = departments[0].id;
  }
  console.log(`Using department ID: ${departmentId}`);
  
  // Create a task
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const taskData = {
    description: "Urgent bedding change for isolation ward",
    departmentId: departmentId,
    priority: "high",
    status: "pending",
    weight: 15,
    dueDate: tomorrow.toISOString(),
    notes: "Patient discharge expected, need priority service",
    requestedById: departmentUser.id
  };
  
  console.log("Creating laundry request...");
  const createdTask = makeRequest('department', 'POST', '/api/tasks', taskData);
  
  if (!createdTask || !createdTask.id) {
    console.error("Failed to create task. Please check server logs.");
    process.exit(1);
  }
  
  console.log(`✅ Created task with ID: ${createdTask.id} and task ID: ${createdTask.taskId}`);
  return createdTask;
}

// Step 2: Supervisor Review and Assignment
async function supervisorReviewStep(task) {
  console.log("\n=== STEP 2: SUPERVISOR REVIEW AND ASSIGNMENT ===");
  const supervisorUser = login('supervisor');
  
  // Get the task
  const taskDetails = makeRequest('supervisor', 'GET', `/api/tasks/${task.id}`);
  
  if (!taskDetails || !taskDetails.id) {
    console.error("Failed to retrieve task. Exiting.");
    process.exit(1);
  }
  
  console.log(`Retrieved task: ${taskDetails.description}`);
  console.log(`Current status: ${taskDetails.status}`);
  
  // Update task to in_progress and assign to self
  const updateData = {
    status: "in_progress",
    assignedToId: supervisorUser.id
  };
  
  console.log("Updating task status to In Progress...");
  const updatedTask = makeRequest('supervisor', 'PATCH', `/api/tasks/${task.id}`, updateData);
  
  if (!updatedTask || updatedTask.status !== "in_progress") {
    console.error("Failed to update task status. Exiting.");
    process.exit(1);
  }
  
  console.log(`✅ Task updated to status: ${updatedTask.status}`);
  console.log(`✅ Assigned to: ${supervisorUser.name}`);
  
  return updatedTask;
}

// Step 3: Staff Processing
async function staffProcessingStep(task) {
  console.log("\n=== STEP 3: STAFF PROCESSING ===");
  const staffUser = login('staff');
  
  // Get the task
  const taskDetails = makeRequest('staff', 'GET', `/api/tasks/${task.id}`);
  
  if (!taskDetails || !taskDetails.id) {
    console.error("Failed to retrieve task. Exiting.");
    process.exit(1);
  }
  
  console.log(`Retrieved task: ${taskDetails.description}`);
  console.log(`Current status: ${taskDetails.status}`);
  
  // Complete the task
  const completeData = {
    status: "completed",
    notes: taskDetails.notes + "\nCompleted by laundry staff."
  };
  
  console.log("Completing the task...");
  const completedTask = makeRequest('staff', 'PATCH', `/api/tasks/${task.id}`, completeData);
  
  if (!completedTask || completedTask.status !== "completed") {
    console.error("Failed to complete task. Exiting.");
    process.exit(1);
  }
  
  console.log(`✅ Task successfully completed! Status: ${completedTask.status}`);
  console.log(`✅ Completed at: ${new Date(completedTask.completedAt).toLocaleString()}`);
  
  return completedTask;
}

// Step 4: Manager Verification
async function managerVerificationStep(task) {
  console.log("\n=== STEP 4: MANAGER VERIFICATION ===");
  const managerUser = login('manager');
  
  // Get the task
  const taskDetails = makeRequest('manager', 'GET', `/api/tasks/${task.id}`);
  
  if (!taskDetails || !taskDetails.id) {
    console.error("Failed to retrieve task. Exiting.");
    process.exit(1);
  }
  
  console.log(`✅ Verified task: ${taskDetails.description}`);
  console.log(`✅ Final status: ${taskDetails.status}`);
  console.log(`✅ Completion time: ${new Date(taskDetails.completedAt).toLocaleString()}`);
  
  // Check dashboard metrics (optional)
  const dashboardStats = makeRequest('manager', 'GET', '/api/analytics/dashboard-stats');
  if (dashboardStats) {
    console.log(`Dashboard updated: ${JSON.stringify(dashboardStats)}`);
  }
  
  return taskDetails;
}

// Step 5: Inventory Management
async function inventoryManagementStep(task) {
  console.log("\n=== STEP 5: INVENTORY MANAGEMENT ===");
  login('inventory');
  
  // Get inventory items
  const inventoryItems = makeRequest('inventory', 'GET', '/api/inventory');
  
  if (!inventoryItems || !inventoryItems.length) {
    console.error("No inventory items found. Check database seeding.");
    process.exit(1);
  }
  
  console.log(`Retrieved ${inventoryItems.length} inventory items`);
  
  // Update an inventory item (simulate usage)
  const item = inventoryItems[0];
  const currentQuantity = item.quantity;
  const updateData = {
    quantity: Math.max(1, currentQuantity - 5) // Reduce by 5 but don't go below 1
  };
  
  console.log(`Updating inventory item ${item.name}, current quantity: ${currentQuantity}`);
  const updatedItem = makeRequest('inventory', 'PATCH', `/api/inventory/${item.id}`, updateData);
  
  if (!updatedItem) {
    console.error("Failed to update inventory item.");
    process.exit(1);
  }
  
  console.log(`✅ Updated inventory item ${updatedItem.name}`);
  console.log(`✅ New quantity: ${updatedItem.quantity} (was: ${currentQuantity})`);
  console.log(`✅ Last restocked: ${new Date(updatedItem.lastRestocked).toLocaleString()}`);
  
  return { task, inventoryItem: updatedItem };
}

// Step 6: Technical Support
async function technicalSupportStep() {
  console.log("\n=== STEP 6: TECHNICAL SUPPORT ===");
  login('technician');
  
  // Get equipment list
  const equipmentList = makeRequest('technician', 'GET', '/api/equipment');
  
  if (!equipmentList || !equipmentList.length) {
    console.error("No equipment found. Check database seeding.");
    process.exit(1);
  }
  
  console.log(`Retrieved ${equipmentList.length} equipment items`);
  
  // Update an equipment status (simulate maintenance check)
  const equipment = equipmentList[0];
  
  // Keep it simpler - only update the status to reduce chance of errors
  const updateData = {
    status: "maintenance"
  };
  
  console.log(`Updating equipment ${equipment.name}, current status: ${equipment.status}`);
  const updatedEquipment = makeRequest('technician', 'PATCH', `/api/equipment/${equipment.id}`, updateData);
  
  if (!updatedEquipment) {
    console.error("Failed to update equipment status.");
    process.exit(1);
  }
  
  console.log(`✅ Updated equipment ${updatedEquipment?.name || equipment.name}`);
  console.log(`✅ New status: ${updatedEquipment?.status || 'Unknown'} (was: ${equipment.status})`);
  
  const nextMaintDate = updatedEquipment?.nextMaintenance 
    ? new Date(updatedEquipment.nextMaintenance).toLocaleString() 
    : 'Not scheduled';
  console.log(`✅ Next maintenance: ${nextMaintDate}`);
  
  return updatedEquipment;
}

// Step 7: Billing and Reporting
async function billingAndReportingStep() {
  console.log("\n=== STEP 7: BILLING AND REPORTING ===");
  
  // Billing staff view
  login('billing');
  
  // Get cost allocations
  const costAllocations = makeRequest('billing', 'GET', '/api/cost-allocations');
  
  if (!costAllocations || !costAllocations.length) {
    console.error("No cost allocations found. Check database seeding.");
    process.exit(1);
  }
  
  console.log(`✅ Retrieved ${costAllocations.length} cost allocation records`);
  
  // Format the cost allocation display better
  const latestAllocation = costAllocations[0];
  
  // Handle potentially different date formats in the response
  let month, year;
  if (latestAllocation.month && latestAllocation.year) {
    month = latestAllocation.month;
    year = latestAllocation.year;
  } else if (latestAllocation.month && latestAllocation.month.includes('-')) {
    // Handle format like "2025-04"
    const parts = latestAllocation.month.split('-');
    year = parts[0];
    month = parts[1];
  } else {
    month = new Date().getMonth() + 1;
    year = new Date().getFullYear();
  }
  
  const allocation = latestAllocation.amount || 0;
  console.log(`✅ Latest cost allocation: ₹${allocation.toLocaleString()} for month ${month}/${year}`);
  
  // Reports staff view
  login('reports');
  
  // Get analytics data
  const departmentUsage = makeRequest('reports', 'GET', '/api/analytics/department-usage?period=monthly');
  const taskCompletion = makeRequest('reports', 'GET', '/api/analytics/task-completion?period=weekly');
  
  if (!departmentUsage || !taskCompletion) {
    console.error("Failed to retrieve analytics data.");
    process.exit(1);
  }
  
  console.log(`✅ Retrieved department usage data for ${departmentUsage.length} departments`);
  console.log(`✅ Retrieved task completion stats for ${taskCompletion.length} time periods`);
  
  return { costAllocations, departmentUsage, taskCompletion };
}

// Step 8: Admin Review
async function adminReviewStep(task) {
  console.log("\n=== STEP 8: ADMIN REVIEW ===");
  login('admin');
  
  // Check dashboard metrics
  const dashboardStats = makeRequest('admin', 'GET', '/api/analytics/dashboard-stats');
  
  if (!dashboardStats) {
    console.error("Failed to retrieve dashboard stats.");
    process.exit(1);
  }
  
  console.log(`✅ Dashboard metrics:`);
  console.log(`  - Pending tasks: ${dashboardStats.pendingTasks}`);
  console.log(`  - Completed today: ${dashboardStats.completedToday}`);
  console.log(`  - Inventory status: ${dashboardStats.inventoryStatus}%`);
  console.log(`  - Monthly costs: ₹${dashboardStats.monthlyCosts.toLocaleString()}`);
  
  // Get full task details including history
  const taskDetails = makeRequest('admin', 'GET', `/api/tasks/${task.id}`);
  
  if (!taskDetails || !taskDetails.id) {
    console.error("Failed to retrieve task as admin.");
    process.exit(1);
  }
  
  console.log(`✅ Admin verified task ${taskDetails.taskId}: ${taskDetails.description}`);
  console.log(`✅ Final status: ${taskDetails.status}`);
  
  return { dashboardStats, taskDetails };
}

// Run the complete workflow
async function runCompleteWorkflow() {
  console.log("\n================================================");
  console.log("🏥 LAUNDRY MANAGEMENT COMPLETE WORKFLOW TEST 🧺");
  console.log("================================================\n");
  
  try {
    // Step 1: Department creates a task
    const task = await departmentRequestStep();
    
    // Step 2: Supervisor reviews and assigns
    const assignedTask = await supervisorReviewStep(task);
    
    // Step 3: Staff processes the task
    const completedTask = await staffProcessingStep(assignedTask);
    
    // Step 4: Manager verifies
    await managerVerificationStep(completedTask);
    
    // Step 5: Inventory management
    await inventoryManagementStep(completedTask);
    
    // Step 6: Technical support
    await technicalSupportStep();
    
    // Step 7: Billing and reporting
    await billingAndReportingStep();
    
    // Step 8: Admin review
    await adminReviewStep(completedTask);
    
    console.log("\n================================================");
    console.log("🎉 COMPLETE WORKFLOW TEST SUCCESSFUL! 🎉");
    console.log("================================================");
    console.log("All roles successfully participated in the laundry management workflow:");
    console.log("✅ Department Head - Created task request");
    console.log("✅ Supervisor - Reviewed and assigned task");
    console.log("✅ Staff - Processed and completed task");
    console.log("✅ Manager - Verified task completion");
    console.log("✅ Inventory Manager - Updated supply levels");
    console.log("✅ Technician - Performed equipment maintenance");
    console.log("✅ Billing Staff - Reviewed cost allocations");
    console.log("✅ Reports Analyst - Generated analytics");
    console.log("✅ Admin - System-wide verification");
    console.log("================================================");
    
  } catch (error) {
    console.error("Workflow test failed:", error);
    process.exit(1);
  }
}

// Run the workflow test
runCompleteWorkflow();