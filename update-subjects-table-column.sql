-- Update the subjects table to allow longer subject codes
-- Run this in your Supabase SQL Editor:

ALTER TABLE subjects ALTER COLUMN code TYPE VARCHAR(50);

-- This will allow subject codes up to 50 characters instead of 20