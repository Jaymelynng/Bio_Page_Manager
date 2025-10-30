import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useBrandLinks = (brandId: string) => {
  return useQuery({
    queryKey: ["brand-links", brandId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("brand_links")
        .select(`
          *,
          link_categories (
            id,
            name,
            icon,
            display_order
          )
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
