import { drizzle } from "drizzle-orm/postgres-js";
import postgres from 'postgres';

// Check if we are in development mode
export const isDevelopment = process.env.NODE_ENV !== "production";

// Create postgres connection
const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/laundry_management";
// For direct use with postgres.js
export const client = postgres(connectionString);
// For use with drizzle
export const db = drizzle(client);
