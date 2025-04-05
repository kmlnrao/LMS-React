#!/usr/bin/env node
import { execSync } from 'child_process';
import fs from 'fs';

// Test Task Creation Process
const API_BASE_URL = "http://localhost:5000";
const COOKIE_JAR = "/tmp/task_cookies.txt";

// Clear any existing cookies
try {
  fs.unlinkSync(COOKIE_JAR);
} catch (e) {
  // File may not exist, ignore
}

/**
 * Simple HTTP client
 */
function httpRequest(method, endpoint, data = null, verbose = false) {
  const url = `${API_BASE_URL}${endpoint}`;
  const verboseFlag = verbose ? '-v' : '-s';
  let cmd = `curl ${verboseFlag} -X ${method} -H "Content-Type: application/json"`;
  
  // Add cookies if they exist
  try {
    if (fs.existsSync(COOKIE_JAR)) {
      cmd += ` -b ${COOKIE_JAR}`;
    }
  } catch (e) {
    // Ignore
  }
  
  // Add data if provided
  if (data) {
    // Escape single quotes in the JSON string
    const jsonData = JSON.stringify(data).replace(/'/g, "\\'");
    cmd += ` -d '${jsonData}'`;
  }
  
  // Add cookie storage for session
  cmd += ` -c ${COOKIE_JAR} "${url}"`;
  
  console.log(`Executing: ${method} ${endpoint}`);
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
    console.error(`Error making request to ${endpoint}:`, e.message);
    return null;
  }
}

// Step 1: Login as admin
console.log("\n*** STEP 1: Logging in as admin ***");
const loginResponse = httpRequest('POST', '/api/auth/login', {
  username: 'admin',
  password: 'admin123'
});

if (!loginResponse || !loginResponse.user) {
  console.error("Login failed. Exiting.");
  process.exit(1);
}

console.log(`Logged in as: ${loginResponse.user.name} (${loginResponse.user.role})`);

// Step 2: Get a list of departments
console.log("\n*** STEP 2: Getting list of departments ***");
const departments = httpRequest('GET', '/api/departments');

if (!departments || !departments.length) {
  console.error("No departments found. Make sure database is seeded. Exiting.");
  process.exit(1);
}

console.log(`Found ${departments.length} departments`);
const targetDepartment = departments[0]; // Use the first department
console.log(`Using department: ${targetDepartment.name} (ID: ${targetDepartment.id})`);

// Step 3: Create a new task manually
console.log("\n*** STEP 3: Creating a new task ***");
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);

// Generate a basic task ID
const taskId = `LT-TEST-${Math.floor(Math.random() * 10000)}`;

const taskData = {
  taskId,
  description: "Test Task created via direct API",
  requestedById: loginResponse.user.id,
  departmentId: targetDepartment.id,
  priority: "high",
  status: "pending",
  dueDate: tomorrow.toISOString()
};

const createdTask = httpRequest('POST', '/api/tasks', taskData, true);

if (!createdTask || !createdTask.id) {
  console.error("Failed to create task. Please check server logs.");
  process.exit(1);
}

console.log(`Created task with ID: ${createdTask.id} and task ID: ${createdTask.taskId}`);

// Step 4: Get the task we just created
console.log("\n*** STEP 4: Retrieving created task ***");
const task = httpRequest('GET', `/api/tasks/${createdTask.id}`);

if (!task || !task.id) {
  console.error("Failed to retrieve task. Exiting.");
  process.exit(1);
}

console.log(`Retrieved task: ${task.description}`);
console.log(`Status: ${task.status}`);

// Step 5: Assign the task to ourselves and change status to in_progress
console.log("\n*** STEP 5: Updating task to in_progress ***");
const updateData = {
  status: "in_progress",
  assignedToId: loginResponse.user.id
};

const updatedTask = httpRequest('PATCH', `/api/tasks/${task.id}`, updateData);

if (!updatedTask || updatedTask.status !== "in_progress") {
  console.error("Failed to update task status. Exiting.");
  process.exit(1);
}

console.log(`Task updated to status: ${updatedTask.status}`);
console.log(`Assigned to: ${loginResponse.user.name}`);

// Step 6: Complete the task
console.log("\n*** STEP 6: Completing the task ***");
const completeData = {
  status: "completed",
  notes: "Task completed via workflow test"
};

const completedTask = httpRequest('PATCH', `/api/tasks/${task.id}`, completeData);

if (!completedTask || completedTask.status !== "completed") {
  console.error("Failed to complete task. Exiting.");
  process.exit(1);
}

console.log(`Task successfully completed! Status: ${completedTask.status}`);
console.log(`Completed at: ${new Date(completedTask.completedAt).toLocaleString()}`);

// Step 7: Verify task list contains our completed task
console.log("\n*** STEP 7: Verifying task exists in task list ***");
const allTasks = httpRequest('GET', '/api/tasks');

const ourTask = allTasks.find(t => t.id === task.id);
if (!ourTask) {
  console.error("Our task was not found in the task list. Something went wrong.");
  process.exit(1);
}

console.log(`Verified task exists in task list with status: ${ourTask.status}`);

// Step 8: Optional cleanup - delete the test task if needed
// Uncomment if you want to delete the test task after testing
/*
console.log("\n*** STEP 8: Cleaning up - deleting test task ***");
const deleteResult = httpRequest('DELETE', `/api/tasks/${task.id}`);

if (!deleteResult || !deleteResult.success) {
  console.error("Failed to delete task. Manual cleanup may be required.");
  process.exit(1);
}

console.log(`Successfully deleted test task with ID: ${task.id}`);
*/

console.log("\n========================================================");
console.log("🎉 Task Workflow Test Completed Successfully! 🎉");
console.log("========================================================");