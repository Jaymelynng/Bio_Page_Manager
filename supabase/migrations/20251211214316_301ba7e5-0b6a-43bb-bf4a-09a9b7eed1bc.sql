-- Create campaigns table to store marketing channels
CREATE TABLE public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  source TEXT NOT NULL,
  medium TEXT NOT NULL,
  campaign TEXT NOT NULL,
  icon TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- Anyone can read active campaigns
CREATE POLICY "Anyone can view active campaigns"
ON public.campaigns
FOR SELECT
USING (is_active = true);

-- Only admins can manage campaigns
CREATE POLICY "Admins can insert campaigns"
ON public.campaigns
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update campaigns"
ON public.campaigns
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete campaigns"
ON public.campaigns
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default campaigns
INSERT INTO public.campaigns (name, source, medium, campaign, icon) VALUES
('Instagram Bio', 'instagram', 'social', 'bio_link', 'instagram'),
('Facebook', 'facebook', 'social', 'bio_link', 'facebook'),
('Email Signature', 'email', 'email', 'signature', 'mail'),
('Messenger', 'messenger', 'social', 'direct_message', 'message-circle');