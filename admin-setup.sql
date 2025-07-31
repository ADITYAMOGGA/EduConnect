-- Add role and status columns to users table for admin functionality
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'teacher';
ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';

-- Create predefined admin user
INSERT INTO users (id, username, password, email, first_name, last_name, school_name, role, status)
VALUES (
  gen_random_uuid(),
  'Navaneeth Reddy',
  'Knull@123',
  'admin@marksheetpro.com',
  'Navaneeth',
  'Reddy',
  'System Administrator',
  'admin',
  'active'
) ON CONFLICT (username) DO UPDATE SET
  password = EXCLUDED.password,
  role = EXCLUDED.role,
  status = EXCLUDED.status;

-- Create demo student user
INSERT INTO users (id, username, password, email, first_name, last_name, school_name, role, status)
VALUES (
  gen_random_uuid(),
  'student_demo',
  'demo123',
  'student@demo.com',
  'Demo',
  'Student',
  'Demo School',
  'student',
  'active'
) ON CONFLICT (username) DO UPDATE SET
  password = EXCLUDED.password,
  role = EXCLUDED.role,
  status = EXCLUDED.status;

-- Update existing users to have teacher role if no role is set
UPDATE users SET role = 'teacher' WHERE role IS NULL;
UPDATE users SET status = 'active' WHERE status IS NULL;