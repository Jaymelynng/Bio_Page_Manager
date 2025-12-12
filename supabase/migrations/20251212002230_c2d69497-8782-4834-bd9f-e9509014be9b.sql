-- Add short_code column to brands table
ALTER TABLE public.brands ADD COLUMN short_code text UNIQUE;

-- Add short_code column to campaigns table
ALTER TABLE public.campaigns ADD COLUMN short_code text UNIQUE;

-- Populate brand short codes
UPDATE public.brands SET short_code = 'capitalcp' WHERE handle = 'capital-gym-cedar-park';
UPDATE public.brands SET short_code = 'capitalpf' WHERE handle = 'capital-gym-pflugerville';
UPDATE public.brands SET short_code = 'capitalrr' WHERE handle = 'capital-gym-round-rock';
UPDATE public.brands SET short_code = 'estrella' WHERE handle = 'estrella-gymnastics';
UPDATE public.brands SET short_code = 'houston' WHERE handle = 'houston-gymnastics';
UPDATE public.brands SET short_code = 'oasis' WHERE handle = 'oasis-gymnastics';
UPDATE public.brands SET short_code = 'rbatascoc' WHERE handle = 'rowland-ballard-atascocita';
UPDATE public.brands SET short_code = 'rbkingwood' WHERE handle = 'rowland-ballard-kingwood';
UPDATE public.brands SET short_code = 'scottsdale' WHERE handle = 'scottsdale-gymnastics';
UPDATE public.brands SET short_code = 'tigar' WHERE handle = 'tigar-gymnastics';

-- Populate campaign short codes based on existing campaigns
UPDATE public.campaigns SET short_code = 'ig' WHERE source = 'instagram';
UPDATE public.campaigns SET short_code = 'fb' WHERE source = 'facebook';
UPDATE public.campaigns SET short_code = 'email' WHERE source = 'email';
UPDATE public.campaigns SET short_code = 'msgr' WHERE source = 'messenger';