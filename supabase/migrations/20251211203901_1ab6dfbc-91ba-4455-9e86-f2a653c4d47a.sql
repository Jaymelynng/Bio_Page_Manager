-- Create table for PIN-based authentication
CREATE TABLE public.login_pins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  pin TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT false,
  brand_id UUID REFERENCES public.brands(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_login_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(pin)
);

-- Enable RLS
ALTER TABLE public.login_pins ENABLE ROW LEVEL SECURITY;

-- Allow anyone to verify a PIN (for login)
CREATE POLICY "Anyone can verify pins"
ON public.login_pins
FOR SELECT
USING (true);

-- Insert Jayme as admin
INSERT INTO public.login_pins (name, pin, is_admin) VALUES ('Jayme', '1234', true);

-- Insert PINs for each gym (you can change these PINs later)
INSERT INTO public.login_pins (name, pin, brand_id) 
SELECT 'Capital Gymnastics Cedar Park', '2001', id FROM brands WHERE handle = 'capital-gym-cedar-park';

INSERT INTO public.login_pins (name, pin, brand_id) 
SELECT 'Capital Gymnastics Pflugerville', '2002', id FROM brands WHERE handle = 'capital-gym-pflugerville';

INSERT INTO public.login_pins (name, pin, brand_id) 
SELECT 'Capital Gymnastics Round Rock', '2003', id FROM brands WHERE handle = 'capital-gym-round-rock';

INSERT INTO public.login_pins (name, pin, brand_id) 
SELECT 'Rowland Ballard - Atascocita', '2004', id FROM brands WHERE handle = 'rowland-ballard-atascocita';

INSERT INTO public.login_pins (name, pin, brand_id) 
SELECT 'Rowland Ballard - Kingwood', '2005', id FROM brands WHERE handle = 'rowland-ballard-kingwood';

INSERT INTO public.login_pins (name, pin, brand_id) 
SELECT 'Houston Gymnastics Academy', '2006', id FROM brands WHERE handle = 'houston-gymnastics';

INSERT INTO public.login_pins (name, pin, brand_id) 
SELECT 'Estrella Gymnastics', '2007', id FROM brands WHERE handle = 'estrella-gymnastics';

INSERT INTO public.login_pins (name, pin, brand_id) 
SELECT 'Oasis Gymnastics', '2008', id FROM brands WHERE handle = 'oasis-gymnastics';

INSERT INTO public.login_pins (name, pin, brand_id) 
SELECT 'Scottsdale Gymnastics', '2009', id FROM brands WHERE handle = 'scottsdale-gymnastics';

INSERT INTO public.login_pins (name, pin, brand_id) 
SELECT 'Tigar Gymnastics', '2010', id FROM brands WHERE handle = 'tigar-gymnastics';