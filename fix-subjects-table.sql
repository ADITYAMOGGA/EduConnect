-- Fix for missing subjects table in Supabase
-- Run this query in your Supabase SQL Editor to create the missing subjects table

-- Create subjects table (missing from original setup)
CREATE TABLE IF NOT EXISTS subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL,
    user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    exam_id UUID REFERENCES exams(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subjects_user_id ON subjects(user_id);
CREATE INDEX IF NOT EXISTS idx_subjects_exam_id ON subjects(exam_id);

-- Enable Row Level Security
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for subjects
CREATE POLICY subjects_user_access ON subjects 
    FOR ALL USING (user_id = auth.uid()::text OR auth.role() = 'service_role');

-- Add comment
COMMENT ON TABLE subjects IS 'Subject definitions managed by users, optionally linked to exams';