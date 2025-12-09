-- Add SELECT policy for link_analytics so admins can view analytics
CREATE POLICY "Admins can view link analytics" 
ON public.link_analytics 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'::app_role));