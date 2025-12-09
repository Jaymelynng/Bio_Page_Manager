import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useBrandLinks = (brandId: string) => {
  return useQuery({
    queryKey: ["brand-links", brandId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("brand_links")
        .select(`
          *,
          category:link_categories(*)
        `)
        .eq("brand_id", brandId)
        .eq("is_active", true)
        .order("display_order");

      if (error) throw error;
      return data;
    },
    enabled: !!brandId,
  });
};

interface TrackClickData {
  brandLinkId: string;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
}

export const useTrackLinkClick = () => {
  return useMutation({
    mutationFn: async (data: TrackClickData) => {
      const { error } = await supabase.from("link_analytics").insert({
        brand_link_id: data.brandLinkId,
        user_agent: navigator.userAgent,
        referrer: document.referrer || null,
        utm_source: data.utmSource,
        utm_medium: data.utmMedium,
        utm_campaign: data.utmCampaign,
      });

      if (error) throw error;
    },
  });
};