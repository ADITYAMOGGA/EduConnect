-- MARKSEET PRO - Supabase Database Setup
-- Run these queries in your Supabase SQL editor to create the required tables

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table for authentication and school management
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    email VARCHAR UNIQUE,
    first_name VARCHAR,
    last_name VARCHAR,
    profile_image_url VARCHAR,
    school_name VARCHAR,
    school_logo_url VARCHAR,
    username VARCHAR UNIQUE,
    password VARCHAR,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Students table for managing student records
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    admission_no VARCHAR(50) NOT NULL,
    class VARCHAR(10) NOT NULL,
    email VARCHAR(255),
    user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Exams table for managing different examinations
CREATE TABLE IF NOT EXISTS exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    class VARCHAR(10) NOT NULL,
    max_marks INTEGER NOT NULL DEFAULT 100,
    user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Subjects table for managing course subjects
CREATE TABLE IF NOT EXISTS subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL,
    user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    exam_id UUID REFERENCES exams(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Marks table for storing student marks in different subjects
CREATE TABLE IF NOT EXISTS marks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    subject VARCHAR(100) NOT NULL,
    marks INTEGER NOT NULL,
    max_marks INTEGER NOT NULL DEFAULT 100,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Sessions table for user session management
CREATE TABLE IF NOT EXISTS sessions (
    sid VARCHAR PRIMARY KEY,
    sess JSONB NOT NULL,
    expire TIMESTAMP NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_students_user_id ON students(user_id);
CREATE INDEX IF NOT EXISTS idx_students_class ON students(class);
CREATE INDEX IF NOT EXISTS idx_exams_user_id ON exams(user_id);
CREATE INDEX IF NOT EXISTS idx_subjects_user_id ON subjects(user_id);
CREATE INDEX IF NOT EXISTS idx_subjects_exam_id ON subjects(exam_id);
CREATE INDEX IF NOT EXISTS idx_marks_student_id ON marks(student_id);
CREATE INDEX IF NOT EXISTS idx_marks_exam_id ON marks(exam_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expire ON sessions(expire);

-- Create Row Level Security (RLS) policies for data security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE subjects ENABLE ROW LEVEL SECURITY; -- Disabled for custom auth
ALTER TABLE subjects DISABLE ROW LEVEL SECURITY;
ALTER TABLE marks ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY users_own_data ON users 
    FOR ALL USING (auth.uid()::text = id OR auth.role() = 'service_role');

-- Students belong to specific users
CREATE POLICY students_user_access ON students 
    FOR ALL USING (user_id = auth.uid()::text OR auth.role() = 'service_role');

-- Exams belong to specific users
CREATE POLICY exams_user_access ON exams 
    FOR ALL USING (user_id = auth.uid()::text OR auth.role() = 'service_role');

-- Disable RLS for subjects table since we use custom authentication
-- CREATE POLICY subjects_user_access ON subjects 
--     FOR ALL USING (user_id = auth.uid()::text OR auth.role() = 'service_role');
-- Note: RLS disabled for subjects table to work with custom authentication system

-- Marks access through student ownership
CREATE POLICY marks_user_access ON marks 
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM students 
            WHERE students.id = marks.student_id 
            AND students.user_id = auth.uid()::text
        ) OR auth.role() = 'service_role'
    );

-- Create function to automatically update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_marks_updated_at BEFORE UPDATE ON marks 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing (optional)
-- You can remove this section if you don't want sample data

-- Sample user
INSERT INTO users (id, username, password, email, first_name, last_name, school_name) 
VALUES (
    'sample-user-id',
    'admin',
    '$2a$10$example-hash-would-go-here', -- You'll need to replace this with actual hashed password
    'admin@school.com',
    'Admin',
    'User',
    'Sample High School'
) ON CONFLICT (username) DO NOTHING;

-- Note: To create the actual admin user, use the registration endpoint
-- or manually hash a password and insert it here

COMMENT ON TABLE users IS 'User accounts for school staff and administrators';
COMMENT ON TABLE students IS 'Student records managed by users';
COMMENT ON TABLE exams IS 'Examination definitions for different classes';
COMMENT ON TABLE subjects IS 'Subject definitions managed by users, optionally linked to exams';
COMMENT ON TABLE marks IS 'Student marks for specific exams and subjects';
COMMENT ON TABLE sessions IS 'User session storage for authentication';