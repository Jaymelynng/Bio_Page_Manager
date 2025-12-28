import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TemplateConfig } from '@/components/TemplateSelector';

export interface Template {
  id: string;
  name: string;
  description: string | null;
  preview_image: string | null;
  layout_config: TemplateConfig;
  display_order: number;
}

export function useTemplate(templateId: string | null) {
  return useQuery({
    queryKey: ['template', templateId],
    queryFn: async () => {
      if (!templateId) return null;
      
      const { data, error } = await supabase
        .from('page_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (error) throw error;
      
      return {
        ...data,
        layout_config: data.layout_config as unknown as TemplateConfig
      } as Template;
    },
    enabled: !!templateId,
  });
}

export function useTemplates() {
  return useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('page_templates')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      
      return (data || []).map(t => ({
        ...t,
        layout_config: t.layout_config as unknown as TemplateConfig
      })) as Template[];
    },
  });
}
