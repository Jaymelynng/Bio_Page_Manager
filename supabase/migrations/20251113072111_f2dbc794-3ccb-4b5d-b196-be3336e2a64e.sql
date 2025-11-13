-- Create public storage bucket for gym videos
INSERT INTO storage.buckets (id, name, public)
VALUES ('gym-videos', 'gym-videos', true);

-- Allow anyone to read videos from the bucket
CREATE POLICY "Public Access to Gym Videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'gym-videos');