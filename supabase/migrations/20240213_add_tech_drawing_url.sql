-- Add tech_drawing_url column to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS tech_drawing_url TEXT;

-- Verify the column was added (optional, for manual verification)
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'products';
