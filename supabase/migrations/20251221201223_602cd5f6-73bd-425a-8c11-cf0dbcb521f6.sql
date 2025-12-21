-- Create documentation storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documentation', 'documentation', true);

-- Allow public read access to documentation files
CREATE POLICY "Anyone can view documentation files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'documentation');

-- Allow service role to upload documentation files
CREATE POLICY "Service role can upload documentation"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'documentation');

-- Allow service role to update documentation files
CREATE POLICY "Service role can update documentation"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'documentation');

-- Allow service role to delete documentation files
CREATE POLICY "Service role can delete documentation"
ON storage.objects
FOR DELETE
USING (bucket_id = 'documentation');