import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Check, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Template {
  id: string;
  name: string;
  description: string | null;
  preview_image: string | null;
  layout_config: TemplateConfig;
  display_order: number;
}

export interface TemplateConfig {
  heroStyle: 'full' | 'split' | 'none';
  buttonStyle: 'rounded' | 'square' | 'pill' | 'outline';
  colorScheme: 'light' | 'dark';
  fontFamily: 'sans' | 'serif' | 'bold' | 'elegant';
  spacing: 'compact' | 'normal' | 'relaxed';
  showCategories: boolean;
}

interface TemplateSelectorProps {
  selectedTemplateId: string | null;
  brandColor: string;
  onSelect: (templateId: string) => void;
}

const templatePreviews: Record<string, { bg: string; accent: string; style: string }> = {
  'Modern': { bg: 'bg-white', accent: 'bg-blue-500', style: 'rounded-xl' },
  'Bold': { bg: 'bg-gray-900', accent: 'bg-yellow-400', style: 'rounded-none' },
  'Classic': { bg: 'bg-amber-50', accent: 'bg-amber-700', style: 'rounded-lg border-2' },
  'Minimal': { bg: 'bg-white', accent: 'bg-gray-800', style: 'rounded-full' },
  'Sports': { bg: 'bg-slate-900', accent: 'bg-red-500', style: 'rounded-md' },
  'Studio': { bg: 'bg-rose-50', accent: 'bg-rose-400', style: 'rounded-2xl' },
};

export default function TemplateSelector({ selectedTemplateId, brandColor, onSelect }: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('page_templates')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      
      // Parse layout_config from JSON
      const parsedTemplates = (data || []).map(t => ({
        ...t,
        layout_config: t.layout_config as unknown as TemplateConfig
      }));
      
      setTemplates(parsedTemplates);
    } catch (error: any) {
      toast({ title: 'Error loading templates', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {templates.map((template) => {
        const preview = templatePreviews[template.name] || templatePreviews['Modern'];
        const isSelected = selectedTemplateId === template.id;
        const config = template.layout_config;

        return (
          <button
            key={template.id}
            onClick={() => onSelect(template.id)}
            className={cn(
              "relative p-3 rounded-xl border-2 transition-all hover:shadow-lg text-left",
              isSelected 
                ? "border-primary ring-2 ring-primary/20" 
                : "border-border hover:border-primary/50"
            )}
          >
            {/* Selected indicator */}
            {isSelected && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center z-10">
                <Check className="w-4 h-4 text-primary-foreground" />
              </div>
            )}

            {/* Mini preview */}
            <div className={cn(
              "aspect-[3/4] rounded-lg overflow-hidden mb-3",
              preview.bg,
              config.colorScheme === 'dark' ? 'bg-gray-900' : 'bg-white'
            )}>
              {/* Hero simulation */}
              {config.heroStyle !== 'none' && (
                <div 
                  className={cn(
                    "w-full",
                    config.heroStyle === 'full' ? 'h-1/3' : 'h-1/4'
                  )}
                  style={{ backgroundColor: brandColor }}
                />
              )}
              
              {/* Links simulation */}
              <div className={cn(
                "p-2 space-y-1.5",
                config.spacing === 'compact' ? 'space-y-1' : config.spacing === 'relaxed' ? 'space-y-2' : 'space-y-1.5'
              )}>
                {[1, 2, 3].map((i) => (
                  <div 
                    key={i}
                    className={cn(
                      "h-3 w-full",
                      config.buttonStyle === 'rounded' && 'rounded-lg',
                      config.buttonStyle === 'square' && 'rounded-none',
                      config.buttonStyle === 'pill' && 'rounded-full',
                      config.buttonStyle === 'outline' && 'rounded-lg border-2 bg-transparent',
                      config.buttonStyle !== 'outline' && 'bg-opacity-20'
                    )}
                    style={{ 
                      backgroundColor: config.buttonStyle === 'outline' ? 'transparent' : brandColor,
                      borderColor: config.buttonStyle === 'outline' ? brandColor : 'transparent',
                      opacity: config.buttonStyle === 'outline' ? 1 : 0.3
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Template info */}
            <h3 className={cn(
              "font-semibold text-sm",
              config.fontFamily === 'serif' && 'font-serif',
              config.fontFamily === 'bold' && 'font-black',
              config.fontFamily === 'elegant' && 'tracking-wide'
            )}>
              {template.name}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
              {template.description}
            </p>
          </button>
        );
      })}
    </div>
  );
}
