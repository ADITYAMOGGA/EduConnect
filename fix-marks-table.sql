-- Fix marks table structure to match application schema
-- Add missing org_id and subject_name columns

-- Add org_id column if it doesn't exist
ALTER TABLE marks ADD COLUMN IF NOT EXISTS org_id UUID;

-- Add subject_name column if it doesn't exist  
ALTER TABLE marks ADD COLUMN IF NOT EXISTS subject_name VARCHAR(255);

-- Add foreign key constraint for org_id
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'marks_org_id_fkey'
    ) THEN
        ALTER TABLE marks ADD CONSTRAINT marks_org_id_fkey 
        FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Update existing marks to have org_id based on student's org_id
UPDATE marks 
SET org_id = students.org_id,
    subject_name = subjects.name
FROM students, subjects
WHERE marks.student_id = students.id 
  AND marks.subject_id = subjects.id
  AND marks.org_id IS NULL;

-- Make org_id NOT NULL after updating existing records
ALTER TABLE marks ALTER COLUMN org_id SET NOT NULL;