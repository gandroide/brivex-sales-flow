-- Create tables
CREATE TABLE IF NOT EXISTS products (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku         TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  description TEXT,
  price       NUMERIC(12,2) NOT NULL DEFAULT 0,
  image_url   TEXT,
  category    TEXT,
  stock_status TEXT DEFAULT 'in_stock',
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS clients (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  pipedrive_id TEXT,
  whatsapp     TEXT,
  created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS generated_dossiers (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID, -- Can be linked to auth.users if auth is enabled
  products   JSONB, -- Array of product details included in the dossier
  pdf_url    TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_dossiers ENABLE ROW LEVEL SECURITY;

-- Create policies (allowing public read for demo purposes, restrict write)
CREATE POLICY "Public read access for products" ON products FOR SELECT USING (true);
CREATE POLICY "Public read access for clients" ON clients FOR SELECT USING (true);
CREATE POLICY "Public read access for dossiers" ON generated_dossiers FOR SELECT USING (true);

-- Insert Seed Data (Luxury Faucets)
INSERT INTO products (sku, name, description, price, image_url, category, stock_status) VALUES
('BRI-001', 'Grifo Lavabo Oro Cepillado', 'Grifo monomando de diseño minimalista con acabado en oro cepillado de alta durabilidad.', 450.00, 'https://images.unsplash.com/photo-1584622050111-993a426fbf0a?auto=format&fit=crop&q=80&w=800', 'Grifería', 'in_stock'),
('BRI-002', 'Mezcladora de Ducha Matte Black', 'Sistema completo de ducha con termostato y rociador efecto lluvia en negro mate.', 890.00, 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&q=80&w=800', 'Duchas', 'in_stock'),
('BRI-003', 'Inodoro Suspendido Smart', 'Inodoro inteligente con funciones de lavado, secado y asiento calefactado. Diseño rimless.', 1200.00, 'https://images.unsplash.com/photo-1564540586988-aa8e521a02f3?auto=format&fit=crop&q=80&w=800', 'Sanitarios', 'low_stock'),
('BRI-004', 'Grifo Cocina Chef Pro', 'Grifo de cocina profesional con caño extraíble y dos tipos de chorro. Acero inoxidable.', 320.00, 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=800', 'Cocina', 'in_stock'),
('BRI-005', 'Bañera Exenta Stone', 'Bañera exenta de resina mineral (solid surface) en blanco mate. Diseño ovalado ergonómico.', 2500.00, 'https://images.unsplash.com/photo-1604014237800-1c9102c219da?auto=format&fit=crop&q=80&w=800', 'Bañeras', 'pre_order'),
('BRI-006', 'Espejo LED Anti-vaho', 'Espejo rectangular 100x80cm con iluminación LED perimetral y sistema anti-vaho táctil.', 280.00, 'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&q=80&w=800', 'Accesorios', 'in_stock');

-- Indexes for performance
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_name ON products(name);
