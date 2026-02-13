-- Add features column to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS features TEXT[];

-- Verify
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'products';
