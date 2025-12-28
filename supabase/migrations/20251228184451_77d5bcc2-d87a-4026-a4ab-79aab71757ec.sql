-- Add section_config column to brands table for storing section visibility and order
ALTER TABLE public.brands 
ADD COLUMN section_config jsonb DEFAULT '{
  "sections": [
    {"id": "hero", "name": "Hero Banner", "visible": true, "order": 1},
    {"id": "cta", "name": "Call to Action", "visible": true, "order": 2},
    {"id": "quickActions", "name": "Quick Actions", "visible": true, "order": 3},
    {"id": "links", "name": "Links by Category", "visible": true, "order": 4},
    {"id": "social", "name": "Social Media", "visible": true, "order": 5},
    {"id": "footer", "name": "Contact & Footer", "visible": true, "order": 6}
  ]
}'::jsonb;