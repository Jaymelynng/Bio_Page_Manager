import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Campaign {
  id: string;
  name: string;
  source: string;
  medium: string;
  campaign: string;
  icon: string | null;
  is_active: boolean;
  created_at: string;
}

export const useCampaigns = () => {
  return useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as Campaign[];
    },
  });
};

export const useCreateCampaign = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (campaign: Omit<Campaign, 'id' | 'created_at' | 'is_active'>) => {
      const { data, error } = await supabase
        .from('campaigns')
        .insert(campaign)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast.success("Campaign created!");
    },
    onError: (error) => {
      toast.error("Failed to create campaign: " + error.message);
    },
  });
};

export const useDeleteCampaign = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast.success("Campaign deleted!");
    },
    onError: (error) => {
      toast.error("Failed to delete campaign: " + error.message);
    },
  });
};

export const generateShareableUrl = (handle: string, source: string, medium: string, campaign: string) => {
  const ogFunctionUrl = 'https://qfffsgiopzpwcijdkvcv.supabase.co/functions/v1/og-image';
  
  const ogParams = new URLSearchParams();
  ogParams.set('handle', handle);
  if (source) ogParams.set('utm_source', source);
  if (medium) ogParams.set('utm_medium', medium);
  if (campaign) ogParams.set('utm_campaign', campaign);
  
  return `${ogFunctionUrl}?${ogParams.toString()}`;
};
