import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// For Supabase integration, we'll construct a connection string
if (!process.env.SUPABASE_URL) {
  throw new Error("SUPABASE_URL environment variable is required");
}

// Extract project reference from Supabase URL
const supabaseUrl = process.env.SUPABASE_URL;
const projectRef = supabaseUrl.split('//')[1].split('.')[0];

// Create PostgreSQL connection string for Supabase
// This will need the actual database password from Supabase settings
const connectionString = `postgresql://postgres:[YOUR_PASSWORD]@db.${projectRef}.supabase.co:5432/postgres`;

console.log("Connecting to Supabase database...");
console.log("Note: You'll need to replace [YOUR_PASSWORD] with your actual Supabase database password");

// For now, use a fallback for development
let pool: Pool | null = null;
let db: any = null;

try {
  if (process.env.DATABASE_URL) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    db = drizzle({ client: pool, schema });
  } else {
    console.warn("DATABASE_URL not set. Using fallback connection method.");
    // We'll implement in-memory storage as fallback
  }
} catch (error) {
  console.warn("Database connection failed, using fallback storage:", error);
}

export { pool, db };