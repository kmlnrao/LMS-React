import { drizzle } from "drizzle-orm/neon-serverless";
import { neon } from "@neondatabase/serverless";

// Check if we are in development mode
export const isDevelopment = process.env.NODE_ENV !== "production";

// Initialize database
const sql = neon(process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/laundry_management");
export const db = drizzle(sql);
