-- Initial Schema Migration for Laundry Management System
-- This script creates all the necessary tables with their relationships

-- Create enums first
CREATE TYPE user_role AS ENUM (
  'admin', 
  'staff', 
  'department', 
  'manager',
  'supervisor',
  'inventory',
  'technician',
  'billing',
  'reports'
);

CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed', 'delayed');

CREATE TYPE equipment_status AS ENUM ('active', 'maintenance', 'available', 'in_queue');

-- Create tables
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'staff',
  department TEXT,
  email TEXT,
  phone TEXT
);

CREATE TABLE IF NOT EXISTS departments (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  location TEXT,
  contact_person TEXT,
  contact_email TEXT,
  contact_phone TEXT
);

CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  task_id TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  requested_by_id INTEGER NOT NULL REFERENCES users(id),
  assigned_to_id INTEGER REFERENCES users(id),
  department_id INTEGER NOT NULL REFERENCES departments(id),
  status task_status NOT NULL DEFAULT 'pending',
  priority TEXT NOT NULL DEFAULT 'medium',
  weight REAL,
  due_date TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS inventory_items (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  unit TEXT NOT NULL,
  quantity REAL NOT NULL,
  minimum_level REAL NOT NULL,
  unit_cost REAL NOT NULL DEFAULT 0,
  location TEXT,
  supplier TEXT,
  last_restocked TIMESTAMP,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS equipment (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  status equipment_status NOT NULL DEFAULT 'available',
  last_maintenance TIMESTAMP,
  next_maintenance TIMESTAMP,
  time_remaining INTEGER,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS laundry_processes (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL,
  temperature INTEGER,
  detergent_amount REAL,
  softener_amount REAL,
  disinfectant_amount REAL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS cost_allocations (
  id SERIAL PRIMARY KEY,
  department_id INTEGER NOT NULL REFERENCES departments(id),
  month TEXT NOT NULL,
  total_weight REAL NOT NULL,
  total_cost REAL NOT NULL,
  cost_per_kg REAL NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_department_id ON tasks(department_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to_id ON tasks(assigned_to_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_category ON inventory_items(category);
CREATE INDEX IF NOT EXISTS idx_equipment_status ON equipment(status);
CREATE INDEX IF NOT EXISTS idx_cost_allocations_department_id ON cost_allocations(department_id);
CREATE INDEX IF NOT EXISTS idx_cost_allocations_month ON cost_allocations(month);