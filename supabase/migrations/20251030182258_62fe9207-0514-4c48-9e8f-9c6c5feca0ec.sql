-- Create enum for link categories
CREATE TYPE link_category_name AS ENUM (
  'Contact & Info',
  'Social Media', 
  'Class Schedules',
  'Membership',
  'Featured Content'
);

-- Create brands table
CREATE TABLE brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  handle TEXT UNIQUE NOT NULL,
  description TEXT,
  color TEXT NOT NULL,
  logo_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create link categories table
CREATE TABLE link_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name link_category_name NOT NULL UNIQUE,
  icon TEXT NOT NULL,
  display_order INTEGER NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create brand links table
CREATE TABLE brand_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES link_categories(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  icon TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create link analytics table for tracking clicks
CREATE TABLE link_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_link_id UUID NOT NULL REFERENCES brand_links(id) ON DELETE CASCADE,
  clicked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_agent TEXT,
  referrer TEXT,
  ip_address TEXT
);

-- Create brand stats view for aggregated metrics
CREATE TABLE brand_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE UNIQUE,
  total_clicks INTEGER NOT NULL DEFAULT 0,
  total_links INTEGER NOT NULL DEFAULT 0,
  conversion_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE link_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE link_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_stats ENABLE ROW LEVEL SECURITY;

-- Public read access policies (no auth required for viewing bio pages)
CREATE POLICY "Anyone can view active brands"
  ON brands FOR SELECT
  USING (is_active = true);

CREATE POLICY "Anyone can view active categories"
  ON link_categories FOR SELECT
  USING (is_active = true);

CREATE POLICY "Anyone can view active brand links"
  ON brand_links FOR SELECT
  USING (is_active = true);

CREATE POLICY "Anyone can view brand stats"
  ON brand_stats FOR SELECT
  USING (true);

-- Analytics tracking policy (anyone can insert clicks)
CREATE POLICY "Anyone can track link clicks"
  ON link_analytics FOR INSERT
  WITH CHECK (true);

-- Create indexes for better query performance
CREATE INDEX idx_brands_handle ON brands(handle);
CREATE INDEX idx_brand_links_brand_id ON brand_links(brand_id);
CREATE INDEX idx_brand_links_category_id ON brand_links(category_id);
CREATE INDEX idx_link_analytics_brand_link_id ON link_analytics(brand_link_id);
CREATE INDEX idx_brand_stats_brand_id ON brand_stats(brand_id);

-- Create function to update brand stats
CREATE OR REPLACE FUNCTION update_brand_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO brand_stats (brand_id, total_clicks, total_links, conversion_rate, last_updated)
  SELECT 
    bl.brand_id,
    COUNT(DISTINCT la.id) as total_clicks,
    COUNT(DISTINCT bl.id) as total_links,
    CASE 
      WHEN COUNT(DISTINCT bl.id) > 0 
      THEN ROUND((COUNT(DISTINCT la.id)::numeric / COUNT(DISTINCT bl.id)) * 100, 2)
      ELSE 0 
    END as conversion_rate,
    now()
  FROM brand_links bl
  LEFT JOIN link_analytics la ON bl.id = la.brand_link_id
  WHERE bl.brand_id = NEW.brand_id OR bl.brand_id = (SELECT brand_id FROM brand_links WHERE id = NEW.brand_link_id)
  GROUP BY bl.brand_id
  ON CONFLICT (brand_id) 
  DO UPDATE SET
    total_clicks = EXCLUDED.total_clicks,
    total_links = EXCLUDED.total_links,
    conversion_rate = EXCLUDED.conversion_rate,
    last_updated = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to auto-update stats
CREATE TRIGGER update_stats_on_link_change
  AFTER INSERT OR UPDATE OR DELETE ON brand_links
  FOR EACH ROW EXECUTE FUNCTION update_brand_stats();

CREATE TRIGGER update_stats_on_analytics
  AFTER INSERT ON link_analytics
  FOR EACH ROW EXECUTE FUNCTION update_brand_stats();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for brands updated_at
CREATE TRIGGER update_brands_updated_at
  BEFORE UPDATE ON brands
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();