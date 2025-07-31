import { createClient } from '@supabase/supabase-js';
import * as schema from "@shared/schema";

if (!process.env.SUPABASE_URL) {
  throw new Error("SUPABASE_URL environment variable is required");
}

if (!process.env.SUPABASE_ANON_KEY) {
  throw new Error("SUPABASE_ANON_KEY environment variable is required");
}

// Create Supabase client for database operations
// Use service role key if available for admin operations, otherwise use anon key
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;
export const supabase = createClient(
  process.env.SUPABASE_URL,
  supabaseKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    db: {
      schema: 'public'
    }
  }
);

console.log("Supabase client initialized successfully");
console.log("Using Supabase client for database operations");

// For now, we'll use Supabase client directly for database operations
// This requires updating the storage layer to use Supabase syntax instead of Drizzle
export { supabase as db };