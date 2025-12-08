-- Allow admins to update brands
CREATE POLICY "Admins can update brands"
ON public.brands
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Allow admins to manage brand_links (insert, update, delete)
CREATE POLICY "Admins can insert brand links"
ON public.brand_links
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update brand links"
ON public.brand_links
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete brand links"
ON public.brand_links
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));