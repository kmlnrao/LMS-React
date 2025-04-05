/**
 * Script to apply views and triggers to the database
 */

import postgres from 'postgres';
import { promises as fs } from 'fs';
import { join, resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as dotenv from 'dotenv';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

// Database connection string
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/laundry_management';

// Execute SQL directly with proper error handling
async function executeSQL(sql: string): Promise<void> {
  // Connect to the database
  const client = postgres(connectionString);
  
  try {
    // Execute the SQL
    await client.unsafe(sql);
    console.log(`✅ Successfully executed SQL statement.`);
  } catch (error) {
    console.error(`❌ Error executing SQL:`, error);
    throw error;
  } finally {
    // Always close the connection
    await client.end({ timeout: 5 });
  }
}

async function applyViewsAndTriggers() {
  console.log('🔄 Applying views and triggers to the database...');
  
  try {
    // Create task_details view
    await executeSQL(`
      CREATE OR REPLACE VIEW task_details AS
      SELECT 
        t.id, 
        t.task_id,
        t.description,
        t.status,
        t.priority,
        t.created_at,
        t.completed_at,
        t.department_id,
        d.name AS department_name,
        t.requested_by_id,
        u1.name AS requested_by_name,
        t.assigned_to_id,
        u2.name AS assigned_to_name,
        t.weight
      FROM 
        tasks t
        LEFT JOIN departments d ON t.department_id = d.id
        LEFT JOIN users u1 ON t.requested_by_id = u1.id
        LEFT JOIN users u2 ON t.assigned_to_id = u2.id;
    `);
    
    // Create equipment_status_view
    await executeSQL(`
      CREATE OR REPLACE VIEW equipment_status_view AS
      SELECT 
        e.id,
        e.name,
        e.type,
        e.status,
        e.last_maintenance,
        e.next_maintenance,
        CASE 
          WHEN e.next_maintenance < CURRENT_DATE THEN 'overdue'
          WHEN e.next_maintenance < CURRENT_DATE + INTERVAL '7 days' THEN 'upcoming'
          ELSE 'ok'
        END AS maintenance_status
      FROM 
        equipment e;
    `);
    
    // Create inventory_status_view
    await executeSQL(`
      CREATE OR REPLACE VIEW inventory_status_view AS
      SELECT 
        i.id,
        i.name,
        i.category,
        i.quantity AS current_quantity,
        i.unit,
        i.minimum_level AS reorder_threshold,
        i.last_restocked,
        CASE 
          WHEN i.quantity <= i.minimum_level * 0.5 THEN 'critical'
          WHEN i.quantity <= i.minimum_level THEN 'low'
          ELSE 'ok'
        END AS stock_status
      FROM 
        inventory_items i;
    `);
    
    // Create department_workload view
    await executeSQL(`
      CREATE OR REPLACE VIEW department_workload AS
      SELECT 
        d.id,
        d.name,
        COUNT(t.id) AS total_tasks,
        SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) AS completed_tasks,
        SUM(CASE WHEN t.status = 'in_progress' THEN 1 ELSE 0 END) AS in_progress_tasks,
        SUM(CASE WHEN t.status = 'pending' THEN 1 ELSE 0 END) AS pending_tasks,
        SUM(CASE WHEN t.status = 'delayed' THEN 1 ELSE 0 END) AS delayed_tasks,
        COALESCE(SUM(t.weight), 0) AS total_weight_kg
      FROM 
        departments d
        LEFT JOIN tasks t ON d.id = t.department_id
      GROUP BY 
        d.id, d.name;
    `);
    
    // Create monthly_cost_report view
    await executeSQL(`
      CREATE OR REPLACE VIEW monthly_cost_report AS
      SELECT 
        ca.month,
        d.id AS department_id,
        d.name AS department_name,
        ca.total_cost,
        ca.total_weight AS total_weight_kg,
        ca.cost_per_kg
      FROM 
        cost_allocations ca
        JOIN departments d ON ca.department_id = d.id
      ORDER BY 
        ca.month DESC, ca.total_cost DESC;
    `);
    
    // Create generate_task_id function
    await executeSQL(`
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
    `);
    
    // Create generate_task_id_trigger
    await executeSQL(`
      DROP TRIGGER IF EXISTS generate_task_id_trigger ON tasks;
      
      CREATE TRIGGER generate_task_id_trigger
      BEFORE INSERT ON tasks
      FOR EACH ROW
      WHEN (NEW.task_id IS NULL)
      EXECUTE FUNCTION generate_task_id();
    `);
    
    // Create update_task_status function
    await executeSQL(`
      CREATE OR REPLACE FUNCTION update_task_status() RETURNS TRIGGER AS $$
      BEGIN
        IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
          NEW.completed_at = CURRENT_TIMESTAMP;
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    
    // Create update_task_status_trigger
    await executeSQL(`
      DROP TRIGGER IF EXISTS update_task_status_trigger ON tasks;
      
      CREATE TRIGGER update_task_status_trigger
      BEFORE UPDATE ON tasks
      FOR EACH ROW
      EXECUTE FUNCTION update_task_status();
    `);
    
    // Create inventory alerts table if it doesn't exist yet
    await executeSQL(`
      CREATE TABLE IF NOT EXISTS inventory_alerts (
        id SERIAL PRIMARY KEY,
        inventory_item_id INTEGER REFERENCES inventory_items(id),
        alert_type TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        acknowledged BOOLEAN DEFAULT FALSE
      );
    `);
    
    // Create check_inventory_levels function
    await executeSQL(`
      CREATE OR REPLACE FUNCTION check_inventory_levels() RETURNS TRIGGER AS $$
      BEGIN
        IF NEW.quantity <= NEW.minimum_level AND 
            (OLD.quantity IS NULL OR OLD.quantity > OLD.minimum_level) THEN
          INSERT INTO inventory_alerts (inventory_item_id, alert_type, message)
          VALUES (NEW.id, 'low_stock', 'Item is below reorder threshold');
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    
    // Create check_inventory_levels_trigger
    await executeSQL(`
      DROP TRIGGER IF EXISTS check_inventory_levels_trigger ON inventory_items;
      
      CREATE TRIGGER check_inventory_levels_trigger
      AFTER UPDATE ON inventory_items
      FOR EACH ROW
      EXECUTE FUNCTION check_inventory_levels();
    `);
    
    // Create set_next_maintenance function
    await executeSQL(`
      CREATE OR REPLACE FUNCTION set_next_maintenance() RETURNS TRIGGER AS $$
      BEGIN
        -- Set next maintenance to be 90 days after current maintenance
        IF NEW.last_maintenance IS NOT NULL AND 
           (OLD.last_maintenance IS NULL OR NEW.last_maintenance != OLD.last_maintenance) THEN
          NEW.next_maintenance := NEW.last_maintenance + INTERVAL '90 days';
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    
    // Create set_next_maintenance_trigger
    await executeSQL(`
      DROP TRIGGER IF EXISTS set_next_maintenance_trigger ON equipment;
      
      CREATE TRIGGER set_next_maintenance_trigger
      BEFORE UPDATE ON equipment
      FOR EACH ROW
      EXECUTE FUNCTION set_next_maintenance();
    `);
    
    // Create calculate_cost_per_kg function and trigger
    await executeSQL(`
      CREATE OR REPLACE FUNCTION calculate_cost_per_kg() RETURNS TRIGGER AS $$
      BEGIN
        -- Recalculate cost_per_kg if total_weight is updated
        IF NEW.total_weight > 0 THEN
          NEW.cost_per_kg := NEW.total_cost / NEW.total_weight;
        ELSE
          NEW.cost_per_kg := 0;
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    
    await executeSQL(`
      DROP TRIGGER IF EXISTS calculate_cost_per_kg_trigger ON cost_allocations;
      
      CREATE TRIGGER calculate_cost_per_kg_trigger
      BEFORE INSERT OR UPDATE OF total_cost, total_weight ON cost_allocations
      FOR EACH ROW
      EXECUTE FUNCTION calculate_cost_per_kg();
    `);
    
    console.log('✅ Successfully applied all views and triggers.');
  } catch (error) {
    console.error('❌ Error applying views and triggers:', error);
    throw error;
  }
}

// Run when this file is executed directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  applyViewsAndTriggers()
    .then(() => {
      console.log('🎉 Views and triggers applied successfully.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Failed to apply views and triggers:', err);
      process.exit(1);
    });
}

export { applyViewsAndTriggers };