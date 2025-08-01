-- SQL queries to update the database schema for class-specific subject management
-- Run these queries in your Supabase SQL editor

-- 1. First, let's check the current exams table structure and fix column naming issues
ALTER TABLE exams RENAME COLUMN exam_date TO exam_date;
-- If exam_date doesn't exist, add it
ALTER TABLE exams ADD COLUMN IF NOT EXISTS exam_date TIMESTAMP;

-- Fix any missing columns in exams table
ALTER TABLE exams ADD COLUMN IF NOT EXISTS org_id UUID;
ALTER TABLE exams ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE exams ADD COLUMN IF NOT EXISTS class_level VARCHAR(20);
ALTER TABLE exams ADD COLUMN IF NOT EXISTS exam_type VARCHAR(50) DEFAULT 'Term Exam';
ALTER TABLE exams ADD COLUMN IF NOT EXISTS total_marks INTEGER DEFAULT 100;
ALTER TABLE exams ADD COLUMN IF NOT EXISTS passing_marks INTEGER DEFAULT 35;
ALTER TABLE exams ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 180;
ALTER TABLE exams ADD COLUMN IF NOT EXISTS academic_year VARCHAR(20) DEFAULT '2024-25';
ALTER TABLE exams ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'scheduled';
ALTER TABLE exams ADD COLUMN IF NOT EXISTS instructions TEXT;
ALTER TABLE exams ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
ALTER TABLE exams ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Drop old columns if they exist with different names
ALTER TABLE exams DROP COLUMN IF EXISTS name;
ALTER TABLE exams DROP COLUMN IF EXISTS class;
ALTER TABLE exams DROP COLUMN IF EXISTS max_marks;

-- Add correct columns
ALTER TABLE exams ADD COLUMN IF NOT EXISTS name VARCHAR(255);

-- 2. Update marks table to match new schema
ALTER TABLE marks ADD COLUMN IF NOT EXISTS org_id UUID;
ALTER TABLE marks ADD COLUMN IF NOT EXISTS subject_id UUID;
ALTER TABLE marks ADD COLUMN IF NOT EXISTS subject_name VARCHAR(255);
ALTER TABLE marks ADD COLUMN IF NOT EXISTS marks_obtained INTEGER;
ALTER TABLE marks ADD COLUMN IF NOT EXISTS max_marks INTEGER DEFAULT 100;
ALTER TABLE marks ADD COLUMN IF NOT EXISTS grade VARCHAR(2);
ALTER TABLE marks ADD COLUMN IF NOT EXISTS remarks TEXT;
ALTER TABLE marks ADD COLUMN IF NOT EXISTS teacher_id UUID;
ALTER TABLE marks ADD COLUMN IF NOT EXISTS entry_date TIMESTAMP DEFAULT NOW();
ALTER TABLE marks ADD COLUMN IF NOT EXISTS verified_by UUID;
ALTER TABLE marks ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP;
ALTER TABLE marks ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'draft';
ALTER TABLE marks ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Drop old marks column if it exists
ALTER TABLE marks DROP COLUMN IF EXISTS marks;
ALTER TABLE marks DROP COLUMN IF EXISTS subject;

-- 3. Ensure subjects table has proper class-level constraint
-- The subjects table should already have class_level column from previous schema

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subjects_class_level ON subjects(class_level);
CREATE INDEX IF NOT EXISTS idx_subjects_org_class ON subjects(org_id, class_level);
CREATE INDEX IF NOT EXISTS idx_exams_org_class ON exams(org_id, class_level);
CREATE INDEX IF NOT EXISTS idx_marks_exam_subject ON marks(exam_id, subject_id);
CREATE INDEX IF NOT EXISTS idx_marks_student_exam ON marks(student_id, exam_id);

-- 5. Add foreign key constraints
ALTER TABLE marks ADD CONSTRAINT IF NOT EXISTS fk_marks_subject 
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE;

ALTER TABLE marks ADD CONSTRAINT IF NOT EXISTS fk_marks_exam 
  FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE;

ALTER TABLE marks ADD CONSTRAINT IF NOT EXISTS fk_marks_student 
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE;

-- 6. Update any existing data to ensure consistency
-- Update subjects to have proper class levels if needed
UPDATE subjects SET class_level = '1' WHERE class_level IS NULL OR class_level = '';

-- 7. Create a view for easy subject-class management
CREATE OR REPLACE VIEW class_subjects AS
SELECT 
  s.id,
  s.name,
  s.code,
  s.class_level,
  s.max_marks,
  s.is_optional,
  s.org_id,
  COUNT(ts.teacher_id) as assigned_teachers
FROM subjects s
LEFT JOIN teacher_subjects ts ON s.id = ts.subject_id
GROUP BY s.id, s.name, s.code, s.class_level, s.max_marks, s.is_optional, s.org_id;

-- 8. Update RLS policies if needed
-- Enable RLS on all tables
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE marks ENABLE ROW LEVEL SECURITY;

-- Create policies for exams table
DROP POLICY IF EXISTS "org_exams_policy" ON exams;
CREATE POLICY "org_exams_policy" ON exams
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM org_admins oa 
      WHERE oa.org_id = exams.org_id
    )
  );

-- Create policies for marks table  
DROP POLICY IF EXISTS "org_marks_policy" ON marks;
CREATE POLICY "org_marks_policy" ON marks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM org_admins oa 
      WHERE oa.org_id = marks.org_id
    ) OR
    EXISTS (
      SELECT 1 FROM teachers t
      WHERE t.id = marks.teacher_id AND t.org_id = marks.org_id
    )
  );

-- 9. Create function to get class-specific subjects
CREATE OR REPLACE FUNCTION get_class_subjects(org_id_param UUID, class_level_param VARCHAR)
RETURNS TABLE (
  id UUID,
  name VARCHAR,
  code VARCHAR,
  class_level VARCHAR,
  max_marks INTEGER,
  is_optional VARCHAR,
  description TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.name,
    s.code,
    s.class_level,
    s.max_marks,
    s.is_optional,
    s.description
  FROM subjects s
  WHERE s.org_id = org_id_param 
    AND s.class_level = class_level_param
  ORDER BY s.name;
END;
$$ LANGUAGE plpgsql;

-- 10. Create function to validate class-subject relationships
CREATE OR REPLACE FUNCTION validate_class_subject_assignment()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if subject belongs to the same class as student
  IF NOT EXISTS (
    SELECT 1 FROM subjects s, students st
    WHERE s.id = NEW.subject_id 
      AND st.id = NEW.student_id
      AND s.class_level = st.class_level
  ) THEN
    RAISE EXCEPTION 'Subject does not belong to student''s class level';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for marks validation
DROP TRIGGER IF EXISTS validate_marks_class_subject ON marks;
CREATE TRIGGER validate_marks_class_subject
  BEFORE INSERT OR UPDATE ON marks
  FOR EACH ROW
  EXECUTE FUNCTION validate_class_subject_assignment();

COMMIT;