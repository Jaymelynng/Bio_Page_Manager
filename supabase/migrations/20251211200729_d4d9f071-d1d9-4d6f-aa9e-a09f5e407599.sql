-- Create app_settings table for dashboard configuration
CREATE TABLE public.app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read settings
CREATE POLICY "Anyone can read app settings"
ON public.app_settings
FOR SELECT
USING (true);

-- Only admins can modify settings
CREATE POLICY "Admins can manage app settings"
ON public.app_settings
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Insert default hero image setting
INSERT INTO public.app_settings (key, value) 
VALUES ('dashboard_hero_image', NULL);

-- Create dashboard-assets storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('dashboard-assets', 'dashboard-assets', true);

-- Allow public read access to dashboard-assets
CREATE POLICY "Public read access for dashboard-assets"
ON storage.objects
FOR SELECT
USING (bucket_id = 'dashboard-assets');

-- Allow authenticated admin uploads to dashboard-assets
CREATE POLICY "Admin upload access for dashboard-assets"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'dashboard-assets');

-- Allow admin updates to dashboard-assets
CREATE POLICY "Admin update access for dashboard-assets"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'dashboard-assets');