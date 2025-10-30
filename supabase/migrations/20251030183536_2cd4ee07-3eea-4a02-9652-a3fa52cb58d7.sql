-- Drop existing triggers and function
DROP TRIGGER IF EXISTS update_stats_on_link_change ON brand_links;
DROP TRIGGER IF EXISTS update_stats_on_analytics ON link_analytics;
DROP FUNCTION IF EXISTS update_brand_stats();

-- Create improved function to update brand stats
CREATE OR REPLACE FUNCTION update_brand_stats()
RETURNS TRIGGER AS $$
DECLARE
  target_brand_id UUID;
BEGIN
  -- Determine which brand_id to update based on the table and operation
  IF TG_TABLE_NAME = 'brand_links' THEN
    IF TG_OP = 'DELETE' THEN
      target_brand_id := OLD.brand_id;
    ELSE
      target_brand_id := NEW.brand_id;
    END IF;
  ELSIF TG_TABLE_NAME = 'link_analytics' THEN
    SELECT brand_id INTO target_brand_id
    FROM brand_links
    WHERE id = NEW.brand_link_id;
  END IF;

  -- Update or insert brand stats
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
  WHERE bl.brand_id = target_brand_id
  GROUP BY bl.brand_id
  ON CONFLICT (brand_id) 
  DO UPDATE SET
    total_clicks = EXCLUDED.total_clicks,
    total_links = EXCLUDED.total_links,
    conversion_rate = EXCLUDED.conversion_rate,
    last_updated = now();
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Recreate triggers
CREATE TRIGGER update_stats_on_link_change
  AFTER INSERT OR UPDATE OR DELETE ON brand_links
  FOR EACH ROW EXECUTE FUNCTION update_brand_stats();

CREATE TRIGGER update_stats_on_analytics
  AFTER INSERT ON link_analytics
  FOR EACH ROW EXECUTE FUNCTION update_brand_stats();