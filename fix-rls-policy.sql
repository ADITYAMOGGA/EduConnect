-- URGENT FIX: Disable RLS for subjects table
-- The application uses custom authentication, not Supabase Auth
-- So the RLS policy is blocking all inserts

-- Run this in your Supabase SQL Editor:
ALTER TABLE subjects DISABLE ROW LEVEL SECURITY;

-- This will allow the application to create subjects properly
-- since we handle access control at the application level