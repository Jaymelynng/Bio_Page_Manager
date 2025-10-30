-- Phase 1: Lead Generation & AI Concierge Database Schema

-- 1.1 Add new columns to brands table for conversion-focused design
ALTER TABLE public.brands 
ADD COLUMN IF NOT EXISTS tagline TEXT,
ADD COLUMN IF NOT EXISTS primary_cta_text TEXT DEFAULT 'Book Your Free Trial',
ADD COLUMN IF NOT EXISTS primary_cta_url TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS parent_portal_url TEXT,
ADD COLUMN IF NOT EXISTS website_url TEXT,
ADD COLUMN IF NOT EXISTS instagram_url TEXT,
ADD COLUMN IF NOT EXISTS facebook_url TEXT,
ADD COLUMN IF NOT EXISTS directions_url TEXT,
ADD COLUMN IF NOT EXISTS rating NUMERIC(2,1) CHECK (rating >= 0 AND rating <= 5),
ADD COLUMN IF NOT EXISTS rating_count INTEGER DEFAULT 0;

COMMENT ON COLUMN brands.primary_cta_url IS 'URL for the main conversion action (free trial booking)';

-- 1.2 Create sessions table to track user sessions with UTM parameters
CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip_address TEXT
);

CREATE INDEX idx_sessions_gym_id ON public.sessions(gym_id);
CREATE INDEX idx_sessions_started_at ON public.sessions(started_at DESC);

ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create sessions"
  ON public.sessions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can read sessions"
  ON public.sessions FOR SELECT
  USING (true);

-- 1.3 Create leads table to store all lead captures
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id TEXT NOT NULL,
  session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  child_age TEXT,
  interest TEXT,
  notes TEXT,
  source TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'booked', 'lost')),
  activecampaign_synced BOOLEAN DEFAULT FALSE,
  activecampaign_contact_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT require_contact_info CHECK (email IS NOT NULL OR phone IS NOT NULL)
);

CREATE INDEX idx_leads_gym_id ON public.leads(gym_id);
CREATE INDEX idx_leads_session_id ON public.leads(session_id);
CREATE INDEX idx_leads_created_at ON public.leads(created_at DESC);
CREATE INDEX idx_leads_status ON public.leads(status);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create leads"
  ON public.leads FOR INSERT
  WITH CHECK (true);

COMMENT ON COLUMN leads.source IS 'Source: chat, request_info, portal_bounce, exit_intent';
COMMENT ON COLUMN leads.status IS 'Lead status: new, contacted, qualified, booked, lost';

-- 1.4 Create chat_sessions and chat_messages tables for AI concierge
CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE NOT NULL,
  gym_id TEXT NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  lead_captured BOOLEAN DEFAULT FALSE,
  messages_count INTEGER DEFAULT 0
);

CREATE INDEX idx_chat_sessions_session_id ON public.chat_sessions(session_id);
CREATE INDEX idx_chat_sessions_gym_id ON public.chat_sessions(gym_id);

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  actions JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_messages_session ON public.chat_messages(chat_session_id);
CREATE INDEX idx_chat_messages_created_at ON public.chat_messages(created_at DESC);

ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create chat sessions"
  ON public.chat_sessions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can read chat sessions"
  ON public.chat_sessions FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create messages"
  ON public.chat_messages FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can read messages"
  ON public.chat_messages FOR SELECT
  USING (true);

COMMENT ON COLUMN chat_messages.actions IS 'Array of actions like {type: open_url, url: ...}';

-- 1.5 Enhanced link_analytics tracking
ALTER TABLE public.link_analytics 
ADD COLUMN IF NOT EXISTS session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS kind TEXT DEFAULT 'link_click',
ADD COLUMN IF NOT EXISTS label TEXT;

CREATE INDEX IF NOT EXISTS idx_link_analytics_session ON public.link_analytics(session_id);
CREATE INDEX IF NOT EXISTS idx_link_analytics_clicked_at ON public.link_analytics(clicked_at DESC);

COMMENT ON COLUMN link_analytics.kind IS 'Type: link_click, primary_cta, social, directions, call, portal';
COMMENT ON COLUMN link_analytics.label IS 'Human-readable label for the action';

-- 1.6 Create attribution_events table to track conversion funnel
CREATE TABLE IF NOT EXISTS public.attribution_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE NOT NULL,
  gym_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  value NUMERIC,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_attribution_session ON public.attribution_events(session_id);
CREATE INDEX idx_attribution_gym ON public.attribution_events(gym_id);
CREATE INDEX idx_attribution_type ON public.attribution_events(event_type);
CREATE INDEX idx_attribution_created_at ON public.attribution_events(created_at DESC);

ALTER TABLE public.attribution_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create attribution events"
  ON public.attribution_events FOR INSERT
  WITH CHECK (true);

COMMENT ON COLUMN attribution_events.event_type IS 'Event types: page_view, cta_click, chat_start, ai_recommend, lead_submitted, portal_bounce';

-- 1.7 Create ai_knowledge table for gym-specific AI knowledge
CREATE TABLE IF NOT EXISTS public.ai_knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id TEXT NOT NULL,
  kind TEXT NOT NULL,
  question TEXT,
  content TEXT NOT NULL,
  priority INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_knowledge_gym ON public.ai_knowledge(gym_id);
CREATE INDEX idx_ai_knowledge_kind ON public.ai_knowledge(kind);

ALTER TABLE public.ai_knowledge ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active knowledge"
  ON public.ai_knowledge FOR SELECT
  USING (is_active = true);

COMMENT ON COLUMN ai_knowledge.kind IS 'Knowledge type: policy, pricing, schedule, program, location, faq';

-- 1.8 Add trigger for updated_at timestamps
CREATE TRIGGER update_leads_updated_at 
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_knowledge_updated_at 
  BEFORE UPDATE ON public.ai_knowledge
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 1.9 Add sample data for Oasis Gymnastics
UPDATE public.brands
SET 
  tagline = 'Cedar Park''s Premier Gymnastics Training Center',
  primary_cta_text = '🎁 Book Your Free Trial',
  primary_cta_url = 'https://app.jackrabbitclass.com/reg.asp?id=532820',
  phone = '(512) 259-9009',
  email = 'info@oasisgymnastics.com',
  address = '601 E Whitestone Blvd #532',
  city = 'Cedar Park',
  state = 'TX',
  parent_portal_url = 'https://app.jackrabbitclass.com/portal/ppLogin.asp?id=532820',
  website_url = 'https://oasisgymnastics.com',
  instagram_url = 'https://instagram.com/oasisgymnastics',
  facebook_url = 'https://facebook.com/oasisgymnastics',
  directions_url = 'https://maps.google.com/?q=Oasis+Gymnastics+Cedar+Park',
  rating = 4.8,
  rating_count = 347
WHERE handle = 'oasis-gymnastics';

INSERT INTO public.ai_knowledge (gym_id, kind, question, content, priority) VALUES
('oasis-gymnastics', 'program', 'What programs do you offer?', 'We offer Rec Gymnastics (ages 3-18), Ninja classes, Preschool Gym (18mo-3yr), Competitive Team, and seasonal camps. Free trial available for all programs.', 10),
('oasis-gymnastics', 'pricing', 'How much does it cost?', 'Most 55-minute classes are $105/month with no registration fee. Your first class is always free! We also offer sibling discounts and flexible scheduling.', 9),
('oasis-gymnastics', 'schedule', 'What are your hours?', 'Classes run Monday-Saturday from 4pm-8pm, with morning and weekend options available. Book through our Parent Portal to see real-time availability.', 8),
('oasis-gymnastics', 'location', 'Where are you located?', 'We''re in Cedar Park, TX at 601 E Whitestone Blvd, right off Parmer Lane. Easy access from Round Rock and North Austin. Plenty of free parking!', 7),
('oasis-gymnastics', 'faq', 'What should my child wear?', 'Comfortable athletic clothes (t-shirt, shorts/leggings). No jewelry or socks. We recommend bare feet or gymnastics shoes. Hair should be pulled back.', 5);