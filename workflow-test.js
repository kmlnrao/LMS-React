// Simplified Workflow Testing Script
import { execSync } from 'child_process';

// Clear any existing cookies
execSync("rm -f /tmp/cookies.txt");

// Step 1: Login as admin
console.log("\n=== Step 1: Login as admin ===");
let output = execSync("curl -s -X POST -H 'Content-Type: application/json' -d '{\"username\":\"admin\", \"password\":\"admin123\"}' http://localhost:5000/api/auth/login -c /tmp/cookies.txt");
console.log("Admin login successful");

// Step 2: Check available departments
console.log("\n=== Step 2: Check departments ===");
try {
  output = execSync("curl -s -X GET http://localhost:5000/api/departments -b /tmp/cookies.txt");
  const departments = JSON.parse(output);
  if (departments && departments.length > 0) {
    console.log(`Found ${departments.length} departments`);
    console.log("First department:", departments[0]);
  } else {
    console.log("No departments found, check database seeding");
  }
} catch (e) {
  console.error("Error checking departments:", e.message);
}

// Step 3: Debug task creation issue
console.log("\n=== Step 3: Debug task creation ===");
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);

// Simplified task data for diagnosis
const taskData = {
  description: "Debug test task",
  departmentId: 1, // Use the first department
  requestedById: 1, // Admin user ID
  priority: "high",
  status: "pending",
  dueDate: tomorrow.toISOString()
};

try {
  console.log("Sending task data:", JSON.stringify(taskData, null, 2));
  output = execSync("curl -v -X POST -H 'Content-Type: application/json' -d '" + 
    JSON.stringify(taskData).replace(/'/g, "\\'") + 
    "' http://localhost:5000/api/tasks -b /tmp/cookies.txt 2>&1");
  console.log("Task creation response:", output.toString());
} catch (e) {
  console.error("Error creating task:", e.message);
  if (e.stdout) {
    console.error("Response:", e.stdout.toString());
  }
  if (e.stderr) {
    console.error("Error details:", e.stderr.toString());
  }
}

// Step 4: Check existing tasks
console.log("\n=== Step 4: Check existing tasks ===");
try {
  output = execSync("curl -s -X GET http://localhost:5000/api/tasks -b /tmp/cookies.txt");
  const tasks = JSON.parse(output);
  if (tasks && tasks.length > 0) {
    console.log(`Found ${tasks.length} tasks`);
    console.log("Sample task:", JSON.stringify(tasks[0], null, 2));
  } else {
    console.log("No tasks found in the database");
  }
} catch (e) {
  console.error("Error checking tasks:", e.message);
}

// Step 5: Check task validation schema
console.log("\n=== Step 5: Compare with task schema ===");
try {
  // This will check the schema indirectly
  const taskSchemaData = {
    description: "Schema test task",
    departmentId: 1,
    requestedById: 1,
    priority: "high",
    status: "pending",
    dueDate: tomorrow.toISOString()
  };
  
  console.log("Inspecting validation in task route...");
  console.log("Data to test with:", JSON.stringify(taskSchemaData, null, 2));
  
  output = execSync("curl -v -X POST -H 'Content-Type: application/json' -d '" + 
    JSON.stringify(taskSchemaData).replace(/'/g, "\\'") + 
    "' http://localhost:5000/api/tasks -b /tmp/cookies.txt 2>&1");
    
  console.log("Validation response:", output.toString());
} catch (e) {
  console.error("Error in schema validation test:", e.message);
}

console.log("\n=================================================");
console.log("Workflow Debugging Completed");
console.log("=================================================");