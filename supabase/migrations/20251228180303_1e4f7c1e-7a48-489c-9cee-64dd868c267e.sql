-- Create page_templates table
CREATE TABLE public.page_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  preview_image TEXT,
  layout_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.page_templates ENABLE ROW LEVEL SECURITY;

-- Anyone can view active templates
CREATE POLICY "Anyone can view active templates"
ON public.page_templates
FOR SELECT
USING (is_active = true);

-- Add template_id to brands table
ALTER TABLE public.brands
ADD COLUMN template_id UUID REFERENCES public.page_templates(id);

-- Seed default templates
INSERT INTO public.page_templates (name, description, layout_config, display_order) VALUES
(
  'Modern',
  'Clean white background, rounded buttons, subtle shadows',
  '{"heroStyle": "full", "buttonStyle": "rounded", "colorScheme": "light", "fontFamily": "sans", "spacing": "normal", "showCategories": true}'::jsonb,
  1
),
(
  'Bold',
  'Dark mode with large buttons and strong contrast',
  '{"heroStyle": "full", "buttonStyle": "square", "colorScheme": "dark", "fontFamily": "bold", "spacing": "compact", "showCategories": true}'::jsonb,
  2
),
(
  'Classic',
  'Elegant serif fonts with muted colors',
  '{"heroStyle": "split", "buttonStyle": "outline", "colorScheme": "light", "fontFamily": "serif", "spacing": "relaxed", "showCategories": true}'::jsonb,
  3
),
(
  'Minimal',
  'No hero, just logo and links',
  '{"heroStyle": "none", "buttonStyle": "pill", "colorScheme": "light", "fontFamily": "sans", "spacing": "compact", "showCategories": false}'::jsonb,
  4
),
(
  'Sports',
  'Action-oriented with prominent CTA',
  '{"heroStyle": "full", "buttonStyle": "square", "colorScheme": "dark", "fontFamily": "bold", "spacing": "normal", "showCategories": true}'::jsonb,
  5
),
(
  'Studio',
  'Perfect for dance, yoga, and fitness studios',
  '{"heroStyle": "split", "buttonStyle": "rounded", "colorScheme": "light", "fontFamily": "elegant", "spacing": "relaxed", "showCategories": true}'::jsonb,
  6
);