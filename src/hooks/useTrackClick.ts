import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useTrackClick = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (brandLinkId: string) => {
      const { error } = await supabase
        .from("link_analytics")
        .insert({
          brand_link_id: brandLinkId,
          user_agent: navigator.userAgent,
          referrer: document.referrer,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      // Invalidate brand stats to refresh click counts
      queryClient.invalidateQueries({ queryKey: ["brands"] });
    },
  });
};
