/**
 * Database initialization script to rebuild the database from scratch
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema';
import { seedAllData } from '../server/data-seeder';
import * as dotenv from 'dotenv';
import { exec } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables if needed
dotenv.config();

// Convert exec to promise-based
const execPromise = promisify(exec);

// Database connection string
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/laundry_management';

async function initializeDatabase() {
  console.log('🔄 Starting database initialization...');
  const client = postgres(connectionString);
  const db = drizzle(client, { schema });
  
  try {
    // Get all table names from our schema
    const tables = [
      'users',
      'departments',
      'tasks',
      'inventory_items',
      'equipment',
      'laundry_processes',
      'cost_allocations'
    ];
    
    // Drop all tables in reverse order to handle dependencies
    console.log('🗑️  Dropping existing tables...');
    
    for (const table of [...tables].reverse()) {
      try {
        await client`DROP TABLE IF EXISTS ${client(table)} CASCADE`;
        console.log(`✅ Dropped table: ${table}`);
      } catch (error) {
        console.error(`❌ Error dropping table ${table}:`, error);
      }
    }
    
    // Drop custom types
    console.log('\n🗑️  Dropping existing types...');
    const types = ['user_role', 'task_status', 'equipment_status'];
    
    for (const type of types) {
      try {
        await client`DROP TYPE IF EXISTS ${client(type)} CASCADE`;
        console.log(`✅ Dropped type: ${type}`);
      } catch (error) {
        console.error(`❌ Error dropping type ${type}:`, error);
      }
    }
    
    // Create schema using drizzle-kit push
    console.log('\n🏗️  Creating schema using drizzle-kit...');
    
    try {
      const { stdout, stderr } = await execPromise('npm run db:push');
      if (stderr && !stderr.includes('warning')) {
        console.warn('drizzle-kit warnings:', stderr);
      }
      console.log('✅ Schema created successfully');
    } catch (error) {
      console.error('❌ Error creating schema:', error);
      throw error;
    }
    
    // Seed the database with initial data
    console.log('\n🌱 Seeding database with initial data...');
    try {
      await seedAllData(true);
      console.log('✅ Database seeded successfully');
    } catch (error) {
      console.error('❌ Error seeding database:', error);
      throw error;
    }
    
    // Create additional database objects that aren't handled by Drizzle
    console.log('\n🏗️  Creating additional database objects...');
    
    // Create task ID generation function and trigger
    try {
      await client`
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
      `;
      console.log('✅ Created task ID generation function and trigger');
    } catch (error) {
      console.warn('⚠️ Error creating task ID generation trigger:', error);
    }
    
    // Create task status update trigger
    try {
      await client`
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
      `;
      console.log('✅ Created task status update trigger');
    } catch (error) {
      console.warn('⚠️ Error creating task status update trigger:', error);
    }
    
    // Create inventory alerts table and trigger
    try {
      await client`
        CREATE TABLE IF NOT EXISTS inventory_alerts (
          id SERIAL PRIMARY KEY,
          inventory_item_id INTEGER REFERENCES inventory_items(id),
          alert_type TEXT NOT NULL,
          message TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          acknowledged BOOLEAN DEFAULT FALSE
        );
        
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
      `;
      console.log('✅ Created inventory alerts table and trigger');
    } catch (error) {
      console.warn('⚠️ Error creating inventory alerts trigger:', error);
    }
    
    // Create common views
    try {
      // Task details view
      await client`
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
      `;
      console.log('✅ Created task_details view');
      
      // Equipment status view
      await client`
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
      `;
      console.log('✅ Created equipment_status_view');
      
      // Inventory status view
      await client`
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
      `;
      console.log('✅ Created inventory_status_view');
      
      // Department workload view
      await client`
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
      `;
      console.log('✅ Created department_workload view');
      
      // Monthly cost report view
      await client`
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
      console.log('✅ Created monthly_cost_report view');
      
    } catch (error) {
      console.warn('⚠️ Error creating views:', error);
    }
    
    console.log('\n✅ Database initialization completed successfully!');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  } finally {
    // Close the database connection
    await client.end({ timeout: 5 });
  }
}

// Run the initialization when this file is executed directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  initializeDatabase()
    .then(() => {
      console.log('🎉 Database initialization completed.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Database initialization failed:', err);
      process.exit(1);
    });
}

export { initializeDatabase };