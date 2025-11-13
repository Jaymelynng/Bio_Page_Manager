
-- Add "Classes & Programs" to the link_category_name enum
-- This must be in its own transaction
ALTER TYPE link_category_name ADD VALUE IF NOT EXISTS 'Classes & Programs';
