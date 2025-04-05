/**
 * Database backup and restore utility for the Laundry Management System
 * This script provides functions to backup the database to a file and restore from a backup file
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { resolve } from 'path';
import { mkdirSync, existsSync } from 'fs';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables if needed
dotenv.config();

// Convert exec to promise-based
const execPromise = promisify(exec);

// Extract connection details from DATABASE_URL
function parseConnectionString(connectionString: string) {
  try {
    const url = new URL(connectionString);
    return {
      host: url.hostname,
      port: url.port || '5432',
      database: url.pathname.substring(1), // remove leading '/'
      user: url.username,
      password: url.password,
    };
  } catch (error) {
    console.error('Error parsing connection string:', error);
    throw new Error('Invalid database connection string');
  }
}

// Make sure the backup directory exists
function ensureBackupDir(backupDir: string) {
  const fullPath = resolve(process.cwd(), backupDir);
  if (!existsSync(fullPath)) {
    mkdirSync(fullPath, { recursive: true });
    console.log(`Created backup directory: ${fullPath}`);
  }
  return fullPath;
}

// Backup the database to a file
async function backupDatabase(backupDir = './database/backups', filename?: string) {
  const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/laundry_management';
  const conn = parseConnectionString(connectionString);
  
  // Create a timestamped filename if not provided
  if (!filename) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    filename = `backup-${timestamp}.sql`;
  }
  
  // Ensure the backup directory exists
  const backupPath = ensureBackupDir(backupDir);
  const fullPath = resolve(backupPath, filename);
  
  console.log(`Starting database backup to ${fullPath}...`);
  
  try {
    // Construct the pg_dump command
    const command = `PGPASSWORD="${conn.password}" pg_dump -h ${conn.host} -p ${conn.port} -U ${conn.user} -d ${conn.database} -F p -f "${fullPath}"`;
    
    // Execute the command
    const { stdout, stderr } = await execPromise(command);
    
    if (stderr && !stderr.includes('warning')) {
      console.error('pg_dump stderr:', stderr);
      throw new Error('Error during backup process');
    }
    
    console.log(`Database backup completed successfully: ${fullPath}`);
    return fullPath;
  } catch (error) {
    console.error('Error backing up database:', error);
    throw error;
  }
}

// Restore the database from a backup file
async function restoreDatabase(backupFile: string) {
  const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/laundry_management';
  const conn = parseConnectionString(connectionString);
  
  // Resolve the full path to the backup file
  const fullPath = resolve(process.cwd(), backupFile);
  
  console.log(`Starting database restore from ${fullPath}...`);
  
  try {
    // Construct the psql command
    const command = `PGPASSWORD="${conn.password}" psql -h ${conn.host} -p ${conn.port} -U ${conn.user} -d ${conn.database} -f "${fullPath}"`;
    
    // Execute the command
    const { stdout, stderr } = await execPromise(command);
    
    if (stderr && !stderr.includes('NOTICE')) {
      console.error('psql stderr:', stderr);
      throw new Error('Error during restore process');
    }
    
    console.log(`Database restore completed successfully from: ${fullPath}`);
    return true;
  } catch (error) {
    console.error('Error restoring database:', error);
    throw error;
  }
}

// When this script is executed directly, backup the database
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  // Get command line args
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (command === 'backup') {
    backupDatabase()
      .then((path) => console.log(`Backup saved to: ${path}`))
      .catch((err) => {
        console.error('Backup failed:', err);
        process.exit(1);
      });
  } else if (command === 'restore') {
    const backupFile = args[1];
    if (!backupFile) {
      console.error('Error: Please provide a backup file path');
      process.exit(1);
    }
    
    restoreDatabase(backupFile)
      .then(() => console.log('Restore completed successfully.'))
      .catch((err) => {
        console.error('Restore failed:', err);
        process.exit(1);
      });
  } else {
    console.log('Usage:');
    console.log('  npx tsx database/backup-restore.ts backup');
    console.log('  npx tsx database/backup-restore.ts restore <backup-file-path>');
  }
}

export { backupDatabase, restoreDatabase };