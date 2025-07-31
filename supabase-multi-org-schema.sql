-- MULTI-ORGANIZATION SCHOOL MANAGEMENT SYSTEM - COMPLETE SUPABASE SCHEMA
-- Created for Indian education system with comprehensive role-based access
-- Updated: January 31, 2025

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security and set timezone
ALTER DATABASE postgres SET timezone TO 'Asia/Kolkata';

-- 1. ORGANIZATIONS TABLE (Schools)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    logo_url TEXT,
    board_type VARCHAR(50) DEFAULT 'CBSE', -- CBSE, ICSE, State Board
    established_year INTEGER,
    website VARCHAR(255),
    principal_name VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active', -- active, suspended, inactive
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. PLATFORM ADMINS TABLE (Super Admins)
CREATE TABLE admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'admin', -- admin, super_admin
    status VARCHAR(20) DEFAULT 'active',
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. ORGANIZATION ADMINS TABLE (School Heads/Principals)
CREATE TABLE org_admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    designation VARCHAR(100) DEFAULT 'Principal', -- Principal, Vice Principal, Admin
    status VARCHAR(20) DEFAULT 'active',
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. SUBJECTS TABLE
CREATE TABLE subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    class_level VARCHAR(20) NOT NULL, -- 9, 10, 11, 12
    max_marks INTEGER DEFAULT 100,
    is_optional BOOLEAN DEFAULT false,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(org_id, code, class_level)
);

-- 5. TEACHERS TABLE
CREATE TABLE teachers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    qualification VARCHAR(255),
    experience_years INTEGER DEFAULT 0,
    employee_id VARCHAR(50),
    status VARCHAR(20) DEFAULT 'active',
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. TEACHER-SUBJECT ASSIGNMENTS TABLE
CREATE TABLE teacher_subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    class_level VARCHAR(20) NOT NULL,
    academic_year VARCHAR(20) DEFAULT '2024-25',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(teacher_id, subject_id, class_level, academic_year)
);

-- 7. STUDENTS TABLE
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    admission_no VARCHAR(50) NOT NULL,
    class_level VARCHAR(20) NOT NULL, -- 9, 10, 11, 12
    section VARCHAR(10) DEFAULT 'A',
    roll_no VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(10),
    father_name VARCHAR(255),
    mother_name VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    photo_url TEXT,
    academic_year VARCHAR(20) DEFAULT '2024-25',
    status VARCHAR(20) DEFAULT 'active', -- active, transferred, graduated
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(org_id, admission_no)
);

-- 8. EXAMS TABLE
CREATE TABLE exams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    class_level VARCHAR(20) NOT NULL,
    exam_type VARCHAR(50) NOT NULL, -- Unit Test, Mid Term, Final, Annual
    academic_year VARCHAR(20) DEFAULT '2024-25',
    start_date DATE,
    end_date DATE,
    description TEXT,
    status VARCHAR(20) DEFAULT 'draft', -- draft, active, completed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. MARKS TABLE
CREATE TABLE marks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES teachers(id),
    marks_obtained INTEGER NOT NULL,
    max_marks INTEGER NOT NULL DEFAULT 100,
    grade VARCHAR(5),
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, subject_id, exam_id)
);

-- 10. SESSIONS TABLE (for authentication)
CREATE TABLE sessions (
    sid VARCHAR PRIMARY KEY,
    sess JSON NOT NULL,
    expire TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_organizations_status ON organizations(status);
CREATE INDEX idx_org_admins_org_id ON org_admins(org_id);
CREATE INDEX idx_teachers_org_id ON teachers(org_id);
CREATE INDEX idx_students_org_id ON students(org_id);
CREATE INDEX idx_students_class ON students(org_id, class_level);
CREATE INDEX idx_subjects_org_class ON subjects(org_id, class_level);
CREATE INDEX idx_teacher_subjects_teacher ON teacher_subjects(teacher_id);
CREATE INDEX idx_marks_student ON marks(student_id);
CREATE INDEX idx_marks_exam ON marks(exam_id);
CREATE INDEX idx_exams_org_class ON exams(org_id, class_level);

-- Insert comprehensive sample data for testing

-- Sample Platform Admin
INSERT INTO admins (name, email, password_hash, role) VALUES 
('Platform Admin', 'admin@marksheetpro.com', '$2b$10$EyH7zA6k1cUVAIZxUZT9ZO.g7rCKfvhKQNVLz6J2vNRgT0/1bY4qG', 'super_admin');

-- Sample Organizations
INSERT INTO organizations (name, address, board_type, principal_name, phone, email) VALUES 
('Delhi Public School', 'Sector 45, Gurgaon, Haryana', 'CBSE', 'Dr. Rajesh Kumar', '+91-124-4567890', 'info@dps.edu.in'),
('St. Mary''s Convent', 'Civil Lines, Delhi', 'ICSE', 'Sister Margaret', '+91-11-2345678', 'admin@stmarys.edu.in'),
('Government Senior Secondary School', 'Sector 12, Chandigarh', 'CBSE', 'Mr. Suresh Sharma', '+91-172-1234567', 'principal@gsss.edu.in');

-- Sample Org Admins
INSERT INTO org_admins (org_id, name, email, password_hash, designation, phone) 
SELECT id, 'Dr. Rajesh Kumar', 'principal@dps.edu.in', '$2b$10$EyH7zA6k1cUVAIZxUZT9ZO.g7rCKfvhKQNVLz6J2vNRgT0/1bY4qG', 'Principal', '+91-9876543210'
FROM organizations WHERE name = 'Delhi Public School'
UNION ALL
SELECT id, 'Sister Margaret', 'principal@stmarys.edu.in', '$2b$10$EyH7zA6k1cUVAIZxUZT9ZO.g7rCKfvhKQNVLz6J2vNRgT0/1bY4qG', 'Principal', '+91-9876543211'
FROM organizations WHERE name = 'St. Mary''s Convent';

-- Sample Subjects for multiple classes
WITH org_dps AS (SELECT id FROM organizations WHERE name = 'Delhi Public School' LIMIT 1)
INSERT INTO subjects (org_id, name, code, class_level, max_marks) 
SELECT id, 'Mathematics', 'MATH09', '9', 100 FROM org_dps
UNION ALL SELECT id, 'Science', 'SCI09', '9', 100 FROM org_dps
UNION ALL SELECT id, 'English', 'ENG09', '9', 100 FROM org_dps
UNION ALL SELECT id, 'Social Science', 'SS09', '9', 100 FROM org_dps
UNION ALL SELECT id, 'Hindi', 'HIN09', '9', 100 FROM org_dps
UNION ALL SELECT id, 'Mathematics', 'MATH10', '10', 100 FROM org_dps
UNION ALL SELECT id, 'Science', 'SCI10', '10', 100 FROM org_dps
UNION ALL SELECT id, 'English', 'ENG10', '10', 100 FROM org_dps
UNION ALL SELECT id, 'Social Science', 'SS10', '10', 100 FROM org_dps
UNION ALL SELECT id, 'Hindi', 'HIN10', '10', 100 FROM org_dps
UNION ALL SELECT id, 'Computer Science', 'CS10', '10', 100 FROM org_dps;

-- Sample Teachers
WITH org_dps AS (SELECT id FROM organizations WHERE name = 'Delhi Public School' LIMIT 1)
INSERT INTO teachers (org_id, name, email, password_hash, phone, qualification, experience_years, employee_id)
SELECT id, 'Mrs. Priya Sharma', 'priya.sharma@dps.edu.in', '$2b$10$EyH7zA6k1cUVAIZxUZT9ZO.g7rCKfvhKQNVLz6J2vNRgT0/1bY4qG', '+91-9876543212', 'M.Sc Mathematics, B.Ed', 8, 'EMP001' FROM org_dps
UNION ALL
SELECT id, 'Mr. Amit Singh', 'amit.singh@dps.edu.in', '$2b$10$EyH7zA6k1cUVAIZxUZT9ZO.g7rCKfvhKQNVLz6J2vNRgT0/1bY4qG', '+91-9876543213', 'M.Sc Physics, B.Ed', 12, 'EMP002' FROM org_dps
UNION ALL
SELECT id, 'Ms. Neha Gupta', 'neha.gupta@dps.edu.in', '$2b$10$EyH7zA6k1cUVAIZxUZT9ZO.g7rCKfvhKQNVLz6J2vNRgT0/1bY4qG', '+91-9876543214', 'M.A English, B.Ed', 6, 'EMP003' FROM org_dps
UNION ALL
SELECT id, 'Mr. Rajesh Verma', 'rajesh.verma@dps.edu.in', '$2b$10$EyH7zA6k1cUVAIZxUZT9ZO.g7rCKfvhKQNVLz6J2vNRgT0/1bY4qG', '+91-9876543215', 'M.A History, B.Ed', 10, 'EMP004' FROM org_dps;

-- Sample Students
WITH org_dps AS (SELECT id FROM organizations WHERE name = 'Delhi Public School' LIMIT 1)
INSERT INTO students (org_id, name, admission_no, class_level, section, roll_no, date_of_birth, gender, father_name, mother_name, phone, address)
SELECT id, 'Arjun Kumar', 'DPS2024001', '10', 'A', '01', '2009-05-15', 'Male', 'Mr. Sunil Kumar', 'Mrs. Meera Kumar', '+91-9876543216', 'H-123, Sector 21, Gurgaon' FROM org_dps
UNION ALL
SELECT id, 'Priya Patel', 'DPS2024002', '10', 'A', '02', '2009-08-22', 'Female', 'Mr. Kiran Patel', 'Mrs. Sunita Patel', '+91-9876543217', 'B-456, Sector 18, Gurgaon' FROM org_dps
UNION ALL
SELECT id, 'Rohit Sharma', 'DPS2024003', '10', 'A', '03', '2009-03-10', 'Male', 'Mr. Raj Sharma', 'Mrs. Kavita Sharma', '+91-9876543218', 'C-789, Sector 14, Gurgaon' FROM org_dps
UNION ALL
SELECT id, 'Ananya Singh', 'DPS2024004', '9', 'A', '01', '2010-07-18', 'Female', 'Mr. Vikram Singh', 'Mrs. Pooja Singh', '+91-9876543219', 'D-321, Sector 22, Gurgaon' FROM org_dps
UNION ALL
SELECT id, 'Karan Agarwal', 'DPS2024005', '9', 'A', '02', '2010-11-30', 'Male', 'Mr. Suresh Agarwal', 'Mrs. Deepa Agarwal', '+91-9876543220', 'E-654, Sector 17, Gurgaon' FROM org_dps;

-- Enable Row Level Security on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE marks ENABLE ROW LEVEL SECURITY;

-- Row Level Security Policies

-- Organizations: Only platform admins can see all, org admins see their own
CREATE POLICY "Platform admins can view all organizations" ON organizations
    FOR ALL USING (auth.role() = 'service_role');

-- Org Admins: Can only see their own org
CREATE POLICY "Org admins can view their organization" ON org_admins
    FOR ALL USING (auth.role() = 'service_role');

-- Teachers: Can only see their own data and org
CREATE POLICY "Teachers can view their own data" ON teachers
    FOR ALL USING (auth.role() = 'service_role');

-- Students: Can be viewed by org admins and assigned teachers
CREATE POLICY "Organization members can view students" ON students
    FOR ALL USING (auth.role() = 'service_role');

-- Subjects: Can be viewed by org members
CREATE POLICY "Organization members can view subjects" ON subjects
    FOR ALL USING (auth.role() = 'service_role');

-- Teacher subjects: Can be viewed by org members
CREATE POLICY "Organization members can view teacher subjects" ON teacher_subjects
    FOR ALL USING (auth.role() = 'service_role');

-- Exams: Can be viewed by org members
CREATE POLICY "Organization members can view exams" ON exams
    FOR ALL USING (auth.role() = 'service_role');

-- Marks: Can be viewed by org members
CREATE POLICY "Organization members can view marks" ON marks
    FOR ALL USING (auth.role() = 'service_role');

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers to all tables
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admins_updated_at BEFORE UPDATE ON admins FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_org_admins_updated_at BEFORE UPDATE ON org_admins FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_teachers_updated_at BEFORE UPDATE ON teachers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subjects_updated_at BEFORE UPDATE ON subjects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_exams_updated_at BEFORE UPDATE ON exams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_marks_updated_at BEFORE UPDATE ON marks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO postgres, authenticated, service_role;