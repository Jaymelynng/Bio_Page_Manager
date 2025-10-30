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
          brand_stats (
            total_clicks,
            total_links,
            conversion_rate
          )
        `)
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      return data;
    },
  });
};

export const useBrand = (handle: string) => {
  return useQuery({
    queryKey: ["brand", handle],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("brands")
        .select(`
          *,
          brand_stats (
            total_clicks,
            total_links,
            conversion_rate
          )
        `)
        .eq("handle", handle)
        .eq("is_active", true)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!handle,
  });
};
