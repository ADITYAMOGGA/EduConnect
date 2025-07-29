# URGENT: Missing Subjects Table Fix

## The Problem
Your application is failing because the `subjects` table doesn't exist in your Supabase database. The error "column exam_id does not exist" occurs because the table itself is missing.

## STEP 1: Create the Missing Table

Go to your **Supabase Dashboard** → **SQL Editor** and run this query:

```sql
-- Create subjects table (missing from original setup)
CREATE TABLE IF NOT EXISTS subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL,
    user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subjects_user_id ON subjects(user_id);

-- Enable Row Level Security
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;

-- Disable RLS for subjects table (since we use custom authentication, not Supabase Auth)
ALTER TABLE subjects DISABLE ROW LEVEL SECURITY;
```

## STEP 2: Fix the RLS Policy Issue

The error you're seeing is because Row Level Security is blocking access. Since we use custom authentication (not Supabase Auth), run this additional query:

```sql
-- Fix RLS policy for our custom authentication system
ALTER TABLE subjects DISABLE ROW LEVEL SECURITY;
```

## STEP 3: Test the Application

After running the SQL:
1. Go back to your application
2. Try adding subjects in the Subject Management tab
3. The subjects should now create successfully

## What I Fixed in the Code

- Removed all `examId` references from the subject creation code
- Updated the database schema to match what actually exists in Supabase
- Fixed all LSP errors related to missing columns
- Simplified subject creation to only use name, code, and userId

The application should work perfectly once you create the table!