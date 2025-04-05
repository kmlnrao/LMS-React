import postgres from 'postgres';

async function main() {
  // Create a new postgres connection for migrations
  const migrationClient = postgres(process.env.DATABASE_URL!, { max: 1 });
  
  console.log('Pushing schema changes...');
  
  try {
    // Manually create schema items in the correct order
    // Create enums
    await migrationClient`
      CREATE TYPE "user_role" AS ENUM (
        'admin', 'staff', 'department', 'manager', 'supervisor', 
        'inventory', 'technician', 'billing', 'reports'
      );
    `;
    
    await migrationClient`
      CREATE TYPE "task_status" AS ENUM (
        'pending', 'in_progress', 'completed', 'delayed'
      );
    `;
    
    await migrationClient`
      CREATE TYPE "equipment_status" AS ENUM (
        'active', 'maintenance', 'available', 'in_queue'
      );
    `;
    
    // Create tables
    await migrationClient`
      CREATE TABLE "users" (
        "id" SERIAL PRIMARY KEY,
        "username" TEXT NOT NULL UNIQUE,
        "password" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "role" "user_role" NOT NULL DEFAULT 'staff',
        "department" TEXT,
        "email" TEXT,
        "phone" TEXT
      );
    `;
    
    await migrationClient`
      CREATE TABLE "departments" (
        "id" SERIAL PRIMARY KEY,
        "name" TEXT NOT NULL UNIQUE,
        "location" TEXT,
        "contact_person" TEXT,
        "contact_email" TEXT,
        "contact_phone" TEXT
      );
    `;
    
    await migrationClient`
      CREATE TABLE "tasks" (
        "id" SERIAL PRIMARY KEY,
        "task_id" TEXT NOT NULL UNIQUE,
        "description" TEXT NOT NULL,
        "requested_by_id" INTEGER NOT NULL REFERENCES "users" ("id"),
        "assigned_to_id" INTEGER REFERENCES "users" ("id"),
        "department_id" INTEGER NOT NULL REFERENCES "departments" ("id"),
        "status" "task_status" NOT NULL DEFAULT 'pending',
        "priority" TEXT NOT NULL DEFAULT 'medium',
        "weight" REAL,
        "due_date" TIMESTAMP NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
        "completed_at" TIMESTAMP,
        "notes" TEXT
      );
    `;
    
    await migrationClient`
      CREATE TABLE "inventory_items" (
        "id" SERIAL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "category" TEXT NOT NULL,
        "unit" TEXT NOT NULL,
        "quantity" REAL NOT NULL,
        "minimum_level" REAL NOT NULL,
        "unit_cost" REAL NOT NULL DEFAULT 0,
        "location" TEXT,
        "supplier" TEXT,
        "last_restocked" TIMESTAMP,
        "notes" TEXT
      );
    `;
    
    await migrationClient`
      CREATE TABLE "equipment" (
        "id" SERIAL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "status" "equipment_status" NOT NULL DEFAULT 'available',
        "last_maintenance" TIMESTAMP,
        "next_maintenance" TIMESTAMP,
        "time_remaining" INTEGER,
        "notes" TEXT
      );
    `;
    
    await migrationClient`
      CREATE TABLE "laundry_processes" (
        "id" SERIAL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "duration" INTEGER NOT NULL,
        "temperature" INTEGER,
        "detergent_amount" REAL,
        "softener_amount" REAL,
        "disinfectant_amount" REAL,
        "is_active" BOOLEAN NOT NULL DEFAULT TRUE
      );
    `;
    
    await migrationClient`
      CREATE TABLE "cost_allocations" (
        "id" SERIAL PRIMARY KEY,
        "department_id" INTEGER NOT NULL REFERENCES "departments" ("id"),
        "month" TEXT NOT NULL,
        "total_weight" REAL NOT NULL,
        "total_cost" REAL NOT NULL,
        "cost_per_kg" REAL NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;
    
    console.log('Database schema recreated successfully');
  } catch (error) {
    console.error('Error during database rebuild:', error);
  } finally {
    // Close the migration client
    await migrationClient.end();
  }
}

main().catch(console.error);