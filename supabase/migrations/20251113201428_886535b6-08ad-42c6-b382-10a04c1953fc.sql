-- Create trigger on brand_links table to update stats when links are added/updated/deleted
CREATE TRIGGER update_stats_on_brand_links_change
AFTER INSERT OR UPDATE OR DELETE ON brand_links
FOR EACH ROW
EXECUTE FUNCTION update_brand_stats();

-- Create trigger on link_analytics table to update stats when clicks are tracked
CREATE TRIGGER update_stats_on_link_click
AFTER INSERT ON link_analytics
FOR EACH ROW
EXECUTE FUNCTION update_brand_stats();