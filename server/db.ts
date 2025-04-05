import { drizzle } from "drizzle-orm/neon-serverless";
import { neon } from "@neondatabase/serverless";

// Initialize database
const sql = neon(process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/laundry_management");
export const db = drizzle(sql);
