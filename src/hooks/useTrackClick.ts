import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface TrackClickData {
  brandLinkId: string;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
}

export const useTrackClick = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: TrackClickData) => {
      const { error } = await supabase
        .from("link_analytics")
        .insert({
          brand_link_id: data.brandLinkId,
          user_agent: navigator.userAgent,
          referrer: document.referrer,
          utm_source: data.utmSource,
          utm_medium: data.utmMedium,
          utm_campaign: data.utmCampaign,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      // Invalidate brand stats to refresh click counts
      queryClient.invalidateQueries({ queryKey: ["brands"] });
    },
  });
};
