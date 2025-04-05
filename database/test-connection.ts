/**
 * Database connection test utility
 * This script validates the database connection and checks the schema integrity
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema';
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

async function testDatabaseConnection() {
  console.log('Testing database connection...');
  const client = postgres(connectionString, { max: 1 });
  const db = drizzle(client, { schema });
  
  try {
    // Test basic connection
    const result = await client`SELECT version()`;
    console.log('✅ Database connection successful');
    console.log(`PostgreSQL version: ${result[0].version}`);
    
    // Check if tables exist
    console.log('\nChecking tables...');
    const tables = [
      'users',
      'departments',
      'tasks',
      'inventory_items',
      'equipment',
      'laundry_processes',
      'cost_allocations'
    ];
    
    for (const table of tables) {
      try {
        const count = await client`SELECT COUNT(*) FROM ${client(table)}`;
        console.log(`✅ Table "${table}" exists with ${count[0].count} records`);
      } catch (error) {
        console.error(`❌ Table "${table}" check failed:`, error);
      }
    }
    
    // Verify enums
    console.log('\nChecking custom types...');
    const types = ['user_role', 'task_status', 'equipment_status'];
    
    for (const type of types) {
      try {
        const typeExists = await client`
          SELECT EXISTS (
            SELECT 1 FROM pg_type t 
            JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace 
            WHERE t.typname = ${type}
          )
        `;
        
        if (typeExists[0].exists) {
          console.log(`✅ Type "${type}" exists`);
        } else {
          console.log(`❌ Type "${type}" does not exist`);
        }
      } catch (error) {
        console.error(`❌ Error checking type "${type}":`, error);
      }
    }
    
    // Check for views
    console.log('\nChecking views...');
    const views = [
      'task_details',
      'equipment_status_view',
      'inventory_status_view',
      'department_workload',
      'monthly_cost_report'
    ];
    
    for (const view of views) {
      try {
        const viewExists = await client`
          SELECT EXISTS (
            SELECT 1 FROM pg_views
            WHERE viewname = ${view}
          )
        `;
        
        if (viewExists[0].exists) {
          console.log(`✅ View "${view}" exists`);
        } else {
          console.log(`❌ View "${view}" does not exist`);
        }
      } catch (error) {
        console.error(`❌ Error checking view "${view}":`, error);
      }
    }
    
    // Check for triggers
    console.log('\nChecking triggers...');
    const triggerNames = [
      'generate_task_id_trigger',
      'update_task_status_trigger',
      'check_inventory_levels_trigger',
      'calculate_cost_per_kg_trigger',
      'set_next_maintenance_trigger'
    ];
    
    for (const trigger of triggerNames) {
      try {
        const triggerExists = await client`
          SELECT EXISTS (
            SELECT 1 FROM pg_trigger
            WHERE tgname = ${trigger}
          )
        `;
        
        if (triggerExists[0].exists) {
          console.log(`✅ Trigger "${trigger}" exists`);
        } else {
          console.log(`❌ Trigger "${trigger}" does not exist`);
        }
      } catch (error) {
        console.error(`❌ Error checking trigger "${trigger}":`, error);
      }
    }
    
    console.log('\nDatabase validation completed');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  } finally {
    // Close the database connection
    await client.end();
  }
}

// Run the test when this file is executed directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  testDatabaseConnection()
    .then(() => console.log('Database connection test completed.'))
    .catch((err) => {
      console.error('Database connection test failed:', err);
      process.exit(1);
    });
}

export { testDatabaseConnection };