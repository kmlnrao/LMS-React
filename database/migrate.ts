/**
 * Database migration script for the Laundry Management System
 * This script applies SQL migrations to the database in sequence
 */

import { promises as fs } from 'fs';
import { join, resolve } from 'path';
import postgres from 'postgres';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables if needed
dotenv.config();

// Database connection string
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/laundry_management';

// Executes a SQL file on the database
async function executeSqlFile(filePath: string): Promise<void> {
  try {
    // Read the SQL file
    const sql = await fs.readFile(filePath, 'utf8');
    
    // Connect to the database
    const client = postgres(connectionString);
    
    try {
      // Execute the SQL
      await client.unsafe(sql);
      console.log(`✅ Successfully executed: ${filePath}`);
    } finally {
      // Always close the connection
      await client.end({ timeout: 5 });
    }
  } catch (error) {
    console.error(`❌ Error executing SQL file ${filePath}:`, error);
    throw error;
  }
}

async function runMigrations() {
  console.log('🔄 Starting database migrations...');
  
  // Directory containing SQL migration files
  const migrationsDir = resolve(__dirname, 'migrations');
  
  try {
    // Create migrations directory if it doesn't exist
    try {
      await fs.mkdir(migrationsDir, { recursive: true });
    } catch (error) {
      // Ignore if directory already exists
    }
    
    // Get the list of SQL files in migrations directory
    let migrationFiles: string[];
    try {
      migrationFiles = (await fs.readdir(migrationsDir))
        .filter(file => file.endsWith('.sql'))
        .sort(); // Naturally sort to apply in the correct order
    } catch (error) {
      console.warn(`⚠️ No migrations directory found at ${migrationsDir}. Creating it...`);
      await fs.mkdir(migrationsDir, { recursive: true });
      migrationFiles = [];
    }
    
    // Check if migrations directory is empty
    if (migrationFiles.length === 0) {
      console.log('⚠️ No migration files found. Creating initial schema migration...');
      
      // Create an initial migration from database initialization script
      const initialMigrationContent = `-- Initial schema migration
-- Created automatically by migration script

-- Create enum types
CREATE TYPE IF NOT EXISTS user_role AS ENUM ('admin', 'manager', 'supervisor', 'staff', 'technician', 'department_user');
CREATE TYPE IF NOT EXISTS task_status AS ENUM ('pending', 'in_progress', 'completed', 'delayed');
CREATE TYPE IF NOT EXISTS equipment_status AS ENUM ('active', 'maintenance', 'available', 'in_queue');

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  role user_role NOT NULL,
  phone TEXT,
  department_id INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create departments table
CREATE TABLE IF NOT EXISTS departments (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT,
  contact_person TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key to users table
ALTER TABLE users 
  ADD CONSTRAINT fk_users_department 
  FOREIGN KEY (department_id) 
  REFERENCES departments(id) 
  ON DELETE SET NULL;

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  task_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  status task_status NOT NULL DEFAULT 'pending',
  priority TEXT DEFAULT 'medium',
  department_id INTEGER NOT NULL REFERENCES departments(id),
  created_by INTEGER NOT NULL REFERENCES users(id),
  assigned_to INTEGER REFERENCES users(id),
  weight_kg DECIMAL(10, 2),
  laundry_process_id INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create inventory_items table
CREATE TABLE IF NOT EXISTS inventory_items (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  current_quantity INTEGER NOT NULL DEFAULT 0,
  unit TEXT NOT NULL,
  reorder_threshold INTEGER NOT NULL DEFAULT 10,
  last_restocked TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create equipment table
CREATE TABLE IF NOT EXISTS equipment (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  status equipment_status NOT NULL DEFAULT 'available',
  location TEXT,
  capacity_kg DECIMAL(10, 2),
  last_maintenance TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  next_maintenance TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP + INTERVAL '90 days'
);

-- Create laundry_processes table
CREATE TABLE IF NOT EXISTS laundry_processes (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  temperature INTEGER,
  duration_minutes INTEGER,
  detergent_type TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  cost_per_kg DECIMAL(10, 2) DEFAULT 0
);

-- Add foreign key to tasks table
ALTER TABLE tasks 
  ADD CONSTRAINT fk_tasks_laundry_process 
  FOREIGN KEY (laundry_process_id) 
  REFERENCES laundry_processes(id) 
  ON DELETE SET NULL;

-- Create cost_allocations table
CREATE TABLE IF NOT EXISTS cost_allocations (
  id SERIAL PRIMARY KEY,
  department_id INTEGER NOT NULL REFERENCES departments(id),
  amount DECIMAL(10, 2) NOT NULL,
  weight_kg DECIMAL(10, 2) NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create inventory_alerts table
CREATE TABLE IF NOT EXISTS inventory_alerts (
  id SERIAL PRIMARY KEY,
  inventory_item_id INTEGER REFERENCES inventory_items(id),
  alert_type TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  acknowledged BOOLEAN DEFAULT FALSE
);

-- Create functions and triggers
CREATE OR REPLACE FUNCTION generate_task_id() RETURNS TRIGGER AS $$
DECLARE
  year_prefix TEXT;
  department_prefix TEXT;
  sequence_number INT;
  new_task_id TEXT;
BEGIN
  -- Get the year prefix (last 2 digits of current year)
  year_prefix := to_char(CURRENT_DATE, 'YY');
  
  -- Get the department prefix (first 2 chars of department name)
  SELECT UPPER(SUBSTRING(name FROM 1 FOR 2)) INTO department_prefix
  FROM departments
  WHERE id = NEW.department_id;
  
  IF department_prefix IS NULL THEN
    department_prefix := 'XX';
  END IF;
  
  -- Get next sequence number for this department and year
  SELECT COALESCE(MAX(SUBSTRING(task_id FROM 8)::INT), 0) + 1 INTO sequence_number
  FROM tasks
  WHERE task_id LIKE year_prefix || '-' || department_prefix || '-%';
  
  -- Create new task ID in format: YY-DE-NNNN (year-department-sequence)
  new_task_id := year_prefix || '-' || department_prefix || '-' || LPAD(sequence_number::TEXT, 4, '0');
  
  -- Set the new task_id
  NEW.task_id := new_task_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS generate_task_id_trigger ON tasks;

CREATE TRIGGER generate_task_id_trigger
BEFORE INSERT ON tasks
FOR EACH ROW
WHEN (NEW.task_id IS NULL)
EXECUTE FUNCTION generate_task_id();

-- Create task status update trigger
CREATE OR REPLACE FUNCTION update_task_status() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    NEW.completed_at = CURRENT_TIMESTAMP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_task_status_trigger ON tasks;

CREATE TRIGGER update_task_status_trigger
BEFORE UPDATE ON tasks
FOR EACH ROW
EXECUTE FUNCTION update_task_status();

-- Create inventory check trigger
CREATE OR REPLACE FUNCTION check_inventory_levels() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.current_quantity <= NEW.reorder_threshold AND 
      (OLD.current_quantity IS NULL OR OLD.current_quantity > OLD.reorder_threshold) THEN
    INSERT INTO inventory_alerts (inventory_item_id, alert_type, message)
    VALUES (NEW.id, 'low_stock', 'Item is below reorder threshold');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS check_inventory_levels_trigger ON inventory_items;

CREATE TRIGGER check_inventory_levels_trigger
AFTER UPDATE ON inventory_items
FOR EACH ROW
EXECUTE FUNCTION check_inventory_levels();

-- Create views for reporting
CREATE OR REPLACE VIEW task_details AS
SELECT 
  t.id, 
  t.task_id,
  t.title,
  t.description,
  t.status,
  t.priority,
  t.created_at,
  t.updated_at,
  t.completed_at,
  t.department_id,
  d.name AS department_name,
  t.created_by,
  u1.name AS created_by_name,
  t.assigned_to,
  u2.name AS assigned_to_name,
  t.weight_kg,
  t.laundry_process_id,
  lp.name AS process_name,
  lp.cost_per_kg
FROM 
  tasks t
  LEFT JOIN departments d ON t.department_id = d.id
  LEFT JOIN users u1 ON t.created_by = u1.id
  LEFT JOIN users u2 ON t.assigned_to = u2.id
  LEFT JOIN laundry_processes lp ON t.laundry_process_id = lp.id;

-- Equipment status view
CREATE OR REPLACE VIEW equipment_status_view AS
SELECT 
  e.id,
  e.name,
  e.type,
  e.status,
  e.location,
  e.last_maintenance,
  e.next_maintenance,
  CASE 
    WHEN e.next_maintenance < CURRENT_DATE THEN 'overdue'
    WHEN e.next_maintenance < CURRENT_DATE + INTERVAL '7 days' THEN 'upcoming'
    ELSE 'ok'
  END AS maintenance_status
FROM 
  equipment e;

-- Inventory status view
CREATE OR REPLACE VIEW inventory_status_view AS
SELECT 
  i.id,
  i.name,
  i.category,
  i.current_quantity,
  i.unit,
  i.reorder_threshold,
  i.last_restocked,
  CASE 
    WHEN i.current_quantity <= i.reorder_threshold * 0.5 THEN 'critical'
    WHEN i.current_quantity <= i.reorder_threshold THEN 'low'
    ELSE 'ok'
  END AS stock_status
FROM 
  inventory_items i;

-- Department workload view
CREATE OR REPLACE VIEW department_workload AS
SELECT 
  d.id,
  d.name,
  COUNT(t.id) AS total_tasks,
  SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) AS completed_tasks,
  SUM(CASE WHEN t.status = 'in_progress' THEN 1 ELSE 0 END) AS in_progress_tasks,
  SUM(CASE WHEN t.status = 'pending' THEN 1 ELSE 0 END) AS pending_tasks,
  SUM(CASE WHEN t.status = 'delayed' THEN 1 ELSE 0 END) AS delayed_tasks,
  COALESCE(SUM(t.weight_kg), 0) AS total_weight_kg
FROM 
  departments d
  LEFT JOIN tasks t ON d.id = t.department_id
GROUP BY 
  d.id, d.name;

-- Monthly cost report view
CREATE OR REPLACE VIEW monthly_cost_report AS
SELECT 
  DATE_TRUNC('month', ca.period_start) AS month,
  d.id AS department_id,
  d.name AS department_name,
  SUM(ca.amount) AS total_cost,
  SUM(ca.weight_kg) AS total_weight_kg,
  CASE 
    WHEN SUM(ca.weight_kg) > 0 
    THEN SUM(ca.amount) / SUM(ca.weight_kg) 
    ELSE 0 
  END AS avg_cost_per_kg
FROM 
  cost_allocations ca
  JOIN departments d ON ca.department_id = d.id
GROUP BY 
  DATE_TRUNC('month', ca.period_start),
  d.id,
  d.name
ORDER BY 
  month DESC, total_cost DESC;
`;
      
      // Write the initial migration file
      const initialMigrationPath = join(migrationsDir, '01_initial_schema.sql');
      await fs.writeFile(initialMigrationPath, initialMigrationContent);
      
      // Update the migration files list
      migrationFiles = ['01_initial_schema.sql'];
    }
    
    // Execute each migration file in order
    console.log(`🚀 Found ${migrationFiles.length} migration files to execute...`);
    
    for (const file of migrationFiles) {
      const filePath = join(migrationsDir, file);
      try {
        console.log(`🔄 Applying migration: ${file}`);
        await executeSqlFile(filePath);
      } catch (error) {
        console.error(`❌ Error applying migration ${file}:`, error);
        throw error;
      }
    }
    
    console.log('✅ All migrations applied successfully!');
    
  } catch (error) {
    console.error('❌ Migration process failed:', error);
    throw error;
  }
}

// Run migrations when this file is executed directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  runMigrations()
    .then(() => {
      console.log('🎉 Database migrations completed.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Database migrations failed:', err);
      process.exit(1);
    });
}

export { runMigrations, executeSqlFile };