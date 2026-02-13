-- Add new columns to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS collection_name text,
ADD COLUMN IF NOT EXISTS finish text,
ADD COLUMN IF NOT EXISTS type text;

-- Create an index for faster filtering
CREATE INDEX IF NOT EXISTS idx_products_collection ON products(collection_name);
CREATE INDEX IF NOT EXISTS idx_products_finish ON products(finish);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);

-- Sample Data Update (as requested)
-- Update Catalano Toilet
UPDATE products 
SET collection_name = 'Zero', finish = 'Blanco Mate', type = 'Inodoro'
WHERE brand ILIKE '%Catalano%' AND (name ILIKE '%Inodoro%' OR name ILIKE '%Toilet%');

-- Update Hansgrohe Faucet
UPDATE products 
SET collection_name = 'Vernis', finish = 'Cromo', type = 'Grifo'
WHERE brand ILIKE '%Hansgrohe%' AND (name ILIKE '%Grifo%' OR name ILIKE '%Faucet%' OR name ILIKE '%Mezclador%');

-- Update Hansgrohe Shower
UPDATE products 
SET collection_name = 'Vernis', finish = 'Cromo', type = 'Ducha'
WHERE brand ILIKE '%Hansgrohe%' AND (name ILIKE '%Ducha%' OR name ILIKE '%Shower%');

-- Add some more data for testing matches if specific items aren't found above
-- You might need to adjust the WHERE clauses if the names don't match exactly in your DB
