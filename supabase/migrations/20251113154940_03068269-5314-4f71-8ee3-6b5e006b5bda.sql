-- Allow anyone to upload new videos to gym-videos bucket (temporary - will be secured with auth later)
CREATE POLICY "Allow public uploads to gym-videos"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'gym-videos');

-- Allow anyone to update/replace videos in gym-videos bucket (needed for upsert: true)
CREATE POLICY "Allow public updates to gym-videos"
ON storage.objects
FOR UPDATE
TO public
USING (bucket_id = 'gym-videos')
WITH CHECK (bucket_id = 'gym-videos');