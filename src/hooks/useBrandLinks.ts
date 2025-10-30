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

export const useTrackLinkClick = () => {
  return useMutation({
    mutationFn: async (linkId: string) => {
      const { error } = await supabase.from("link_analytics").insert({
        brand_link_id: linkId,
        user_agent: navigator.userAgent,
        referrer: document.referrer || null,
      });

      if (error) throw error;
    },
  });
};