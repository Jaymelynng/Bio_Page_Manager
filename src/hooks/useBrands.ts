import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useBrands = () => {
  return useQuery({
    queryKey: ["brands"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("brands")
        .select(`
          *,
          brand_stats(*)
        `)
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      return data;
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
  });
};

export const useBrand = (handle: string) => {
  return useQuery({
    queryKey: ["brand", handle, "v2"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("brands")
        .select("*")
        .eq("handle", handle)
        .eq("is_active", true)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!handle,
  });
};

// Fetch top traffic source for each brand
export const useBrandTopSources = (brandIds: string[]) => {
  return useQuery({
    queryKey: ["brand-top-sources", brandIds],
    queryFn: async () => {
      if (!brandIds.length) return {};

      // Get all brand links
      const { data: links, error: linksError } = await supabase
        .from("brand_links")
        .select("id, brand_id")
        .in("brand_id", brandIds);

      if (linksError) throw linksError;
      if (!links?.length) return {};

      const linkIds = links.map(l => l.id);
      const linkToBrand = Object.fromEntries(links.map(l => [l.id, l.brand_id]));

      // Get analytics with UTM sources
      const { data: analytics, error: analyticsError } = await supabase
        .from("link_analytics")
        .select("brand_link_id, utm_source, referrer")
        .in("brand_link_id", linkIds);

      if (analyticsError) throw analyticsError;

      // Calculate top source per brand
      const brandSources: Record<string, Record<string, number>> = {};
      
      analytics?.forEach((click) => {
        const brandId = linkToBrand[click.brand_link_id];
        if (!brandId) return;

        // Determine source from UTM or referrer
        let source = 'Direct';
        if (click.utm_source) {
          source = click.utm_source;
        } else if (click.referrer) {
          const ref = click.referrer.toLowerCase();
          if (ref.includes('instagram')) source = 'Instagram';
          else if (ref.includes('facebook') || ref.includes('fb.com')) source = 'Facebook';
          else if (ref.includes('google')) source = 'Google';
          else if (ref) source = 'Other';
        }

        if (!brandSources[brandId]) brandSources[brandId] = {};
        brandSources[brandId][source] = (brandSources[brandId][source] || 0) + 1;
      });

      // Get top source for each brand
      const topSources: Record<string, string | null> = {};
      Object.entries(brandSources).forEach(([brandId, sources]) => {
        const sorted = Object.entries(sources).sort((a, b) => b[1] - a[1]);
        topSources[brandId] = sorted[0]?.[0] || null;
      });

      return topSources;
    },
    enabled: brandIds.length > 0,
    staleTime: 30 * 1000,
  });
};