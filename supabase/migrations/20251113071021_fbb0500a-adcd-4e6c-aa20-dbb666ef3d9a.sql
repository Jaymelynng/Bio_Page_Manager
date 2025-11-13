-- Add color columns to brands table for full brand palette
ALTER TABLE brands 
ADD COLUMN IF NOT EXISTS color_secondary text,
ADD COLUMN IF NOT EXISTS color_tertiary text,
ADD COLUMN IF NOT EXISTS hero_video_url text;

-- Update Capital Gymnastics Cedar Park
UPDATE brands 
SET color_secondary = '#bf0a30', color_tertiary = '#d8d8d8'
WHERE handle = 'capital-gym-cedar-park';

-- Update Capital Gymnastics Pflugerville
UPDATE brands 
SET color_secondary = '#bf0a30', color_tertiary = '#d8d8d8'
WHERE handle = 'capital-gym-pflugerville';

-- Update Capital Gymnastics Round Rock
UPDATE brands 
SET color = '#ff1493', color_secondary = '#c0c0c0', color_tertiary = '#3c3939'
WHERE handle = 'capital-gym-round-rock';

-- Update Estrella Gymnastics
UPDATE brands 
SET color = '#011837', color_secondary = '#666666', color_tertiary = '#100f0f'
WHERE handle = 'estrella';

-- Update Houston Gymnastics Academy
UPDATE brands 
SET color = '#c91724', color_secondary = '#262626', color_tertiary = '#d0d0d8'
WHERE handle = 'houston-gym';

-- Update Oasis Gymnastics
UPDATE brands 
SET color = '#3eb29f', color_secondary = '#3e266b', color_tertiary = '#e7e6f0'
WHERE handle = 'oasis';

-- Update Rowland Ballard Atascocita
UPDATE brands 
SET color = '#1a3c66', color_secondary = '#c52928', color_tertiary = '#739ab9'
WHERE handle = 'rowland-ballard-atascocita';

-- Update Rowland Ballard Kingwood
UPDATE brands 
SET color = '#1a3c66', color_secondary = '#c52928', color_tertiary = '#739ab9'
WHERE handle = 'rowland-ballard-kingwood';

-- Update Scottsdale Gymnastics
UPDATE brands 
SET color = '#c72b12', color_secondary = '#e6e6e6', color_tertiary = '#000000'
WHERE handle = 'scottsdale';

-- Update Tigar Gymnastics
UPDATE brands 
SET color = '#f57f20', color_secondary = '#0a3651', color_tertiary = '#7fc4e0'
WHERE handle = 'tigar';