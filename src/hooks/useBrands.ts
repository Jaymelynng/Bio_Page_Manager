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