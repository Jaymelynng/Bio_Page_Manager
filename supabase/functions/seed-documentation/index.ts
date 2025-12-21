import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Documentation content
const README_MD = `# GymBio Hub Documentation

Welcome to the GymBio Hub documentation! This guide covers everything you need to know about managing your gym bio pages.

## Quick Links

- [User Guide](USER-GUIDE.md) - Step-by-step guide for gym managers
- [Developer Guide](DEVELOPER-GUIDE.md) - Technical documentation for developers
- [Database Schema](DATABASE-SCHEMA.md) - Database tables and relationships
- [API Reference](API-REFERENCE.md) - Edge function endpoints
- [Short Links Guide](SHORT-LINKS.md) - URL shortener and tracking
- [Troubleshooting](TROUBLESHOOTING.md) - Common issues and solutions

## Overview

GymBio Hub is a comprehensive bio-link platform designed specifically for gyms and fitness centers. It allows you to:

- Create beautiful, customizable bio pages for each gym
- Track link clicks and user engagement
- Manage multiple gym locations from one dashboard
- Generate short links with UTM tracking
- Upload and manage promotional videos
- View detailed analytics for each gym

## Getting Started

1. Log in to the admin dashboard at \`/biopage\`
2. Add your first gym using the "Add Gym" button
3. Customize your gym's bio page with links and content
4. Share your bio page URL: \`/biopage/your-gym-handle\`

## Support

For technical support or feature requests, contact your system administrator.

---
*Last updated: ${new Date().toISOString().split('T')[0]}*
`;

const USER_GUIDE_MD = `# User Guide for Gym Managers

This guide walks you through using GymBio Hub to manage your gym's online presence.

## Table of Contents

1. [Logging In](#logging-in)
2. [Dashboard Overview](#dashboard-overview)
3. [Managing Your Gym](#managing-your-gym)
4. [Adding Links](#adding-links)
5. [Uploading Videos](#uploading-videos)
6. [Understanding Analytics](#understanding-analytics)
7. [Creating Short Links](#creating-short-links)

---

## Logging In

1. Navigate to \`/biopage/auth\`
2. Enter your email and PIN (4-digit code)
3. If you don't have a PIN, click "Request PIN" and check your email
4. Once logged in, you'll see the main dashboard

## Dashboard Overview

The dashboard shows all gyms you manage:

- **Total Clicks**: Combined clicks across all your gym links
- **Total Links**: Number of active links across all gyms
- **Gym Cards**: Each gym shows its stats and quick action buttons

### Dashboard Actions

- **Refresh Stats**: Update analytics data
- **Settings**: Access dashboard customization
- **Add Gym**: Create a new gym profile

## Managing Your Gym

### Editing Gym Details

1. Click the **Edit** button on any gym card
2. Update the gym information:
   - **Name**: Your gym's display name
   - **Handle**: URL slug (e.g., "fitness-pro" → /biopage/fitness-pro)
   - **Description**: Brief description shown on bio page
   - **Avatar**: Your gym's logo or image
3. Click **Save Changes**

### Gym Categories

Links are organized into categories:
- Social Media
- Booking & Contact
- Offers & Promotions
- Resources

## Adding Links

1. Go to your gym's edit page
2. Scroll to the links section
3. Click **Add Link**
4. Fill in:
   - **Title**: Display text for the link
   - **URL**: Destination URL
   - **Category**: Choose from available categories
   - **Active**: Toggle to show/hide the link
5. Click **Save**

### Link Tips

- Use clear, action-oriented titles ("Book a Class", "Join Now")
- Put your most important links at the top
- Regularly check that all URLs work

## Uploading Videos

1. From the dashboard, click **Upload Videos**
2. Select a gym from the dropdown
3. Drag & drop or click to upload a video file
4. Supported formats: MP4, MOV, WebM
5. Maximum file size: 50MB
6. The video will appear on your gym's bio page

## Understanding Analytics

### Viewing Analytics

1. Click the **Analytics** button on any gym card
2. View detailed statistics:
   - Total clicks over time
   - Clicks per link
   - Top traffic sources
   - Geographic data (if available)

### Key Metrics

- **Total Clicks**: All link clicks for this gym
- **Click-Through Rate**: Visitors who clicked at least one link
- **Top Links**: Your most popular links
- **Traffic Sources**: Where visitors come from (direct, social, search)

## Creating Short Links

Short links help track campaigns and look cleaner when shared.

1. Go to **Settings** → **Link Generator**
2. Select the gym and link you want to shorten
3. Optionally add UTM parameters:
   - **Campaign**: Name of your marketing campaign
   - **Source**: Traffic source (instagram, email, etc.)
   - **Medium**: Marketing medium (social, cpc, etc.)
4. Click **Generate Short Link**
5. Copy and share your new short URL: \`/go/abc123\`

### UTM Tracking

UTM parameters help you understand which campaigns drive traffic:
- \`utm_source\`: Where traffic comes from (facebook, newsletter)
- \`utm_medium\`: Marketing type (social, email, paid)
- \`utm_campaign\`: Campaign name (summer-promo, new-members)

---

## Tips for Success

1. **Keep links updated** - Remove broken or outdated links
2. **Use short links for campaigns** - Track which promotions work
3. **Check analytics weekly** - Understand what content performs
4. **Upload fresh videos** - Keep your bio page engaging
5. **Share your bio link everywhere** - Add to Instagram, email signatures, business cards

---
*Last updated: ${new Date().toISOString().split('T')[0]}*
`;

const DEVELOPER_GUIDE_MD = `# Developer Guide

Technical documentation for developers working on GymBio Hub.

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router v6
- **Backend**: Supabase (Lovable Cloud)
- **Database**: PostgreSQL
- **Storage**: Supabase Storage
- **Edge Functions**: Deno runtime

## Project Structure

\`\`\`
src/
├── assets/           # Static images and media
├── components/       # Reusable UI components
│   └── ui/          # shadcn/ui components
├── hooks/           # Custom React hooks
├── integrations/    # Supabase client and types
├── lib/             # Utility functions
├── pages/           # Page components
└── main.tsx         # App entry point

supabase/
├── functions/       # Edge functions
│   ├── redirect/    # Short link redirects
│   ├── og-image/    # OG image generation
│   └── ...
└── config.toml      # Supabase configuration
\`\`\`

## Key Components

### Pages

| Page | Path | Purpose |
|------|------|---------|
| Index | /biopage | Admin dashboard |
| BrandBioPage | /biopage/:handle | Public bio page |
| AdminEditGym | /biopage/admin/edit/:handle | Edit gym details |
| AdminAnalytics | /biopage/admin/analytics/:handle | View gym stats |
| AdminVideoUpload | /biopage/admin/upload-videos | Upload videos |
| AdminLinkGenerator | /biopage/admin/link-generator | Create short links |
| AuthPage | /biopage/auth | Login page |

### Custom Hooks

\`\`\`typescript
// useBrands - Fetch all gyms
const { data: brands, isLoading } = useBrands();

// useBrandLinks - Fetch links for a gym
const { data: links } = useBrandLinks(brandId);

// useTrackClick - Track link clicks
const { mutate: trackClick } = useTrackClick();

// useAuth - Authentication state
const { user, isAdmin, signOut } = useAuth();

// usePinAuth - PIN-based login
const { requestPin, verifyPin } = usePinAuth();
\`\`\`

## Authentication Flow

1. User enters email on /biopage/auth
2. System generates/retrieves PIN, sends via email
3. User enters PIN to authenticate
4. JWT token stored in localStorage
5. Protected routes check auth state via useAuth hook

### Role-Based Access

\`\`\`sql
-- Check if user has admin role
SELECT public.has_role(auth.uid(), 'admin');
\`\`\`

## Database Operations

### Fetching Data

\`\`\`typescript
import { supabase } from "@/integrations/supabase/client";

// Fetch brands
const { data, error } = await supabase
  .from('brands')
  .select('*')
  .order('created_at', { ascending: false });

// Fetch with relations
const { data } = await supabase
  .from('brands')
  .select(\`
    *,
    brand_links(*),
    brand_stats(*)
  \`)
  .eq('handle', handle)
  .single();
\`\`\`

### Inserting Data

\`\`\`typescript
const { data, error } = await supabase
  .from('brand_links')
  .insert({
    brand_id: brandId,
    title: 'New Link',
    url: 'https://example.com',
    category: 'social_media'
  })
  .select()
  .single();
\`\`\`

## Edge Functions

### Calling Functions

\`\`\`typescript
const { data, error } = await supabase.functions.invoke('function-name', {
  body: { param: 'value' }
});
\`\`\`

### Creating Functions

Edge functions live in \`supabase/functions/\`:

\`\`\`typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  // Function logic here
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
});
\`\`\`

## Storage

### Uploading Files

\`\`\`typescript
const { error } = await supabase.storage
  .from('bucket-name')
  .upload(filePath, file, {
    cacheControl: '3600',
    upsert: true
  });
\`\`\`

### Getting Public URLs

\`\`\`typescript
const { data } = supabase.storage
  .from('bucket-name')
  .getPublicUrl(filePath);

console.log(data.publicUrl);
\`\`\`

## Environment Variables

Available in edge functions:
- \`SUPABASE_URL\`
- \`SUPABASE_ANON_KEY\`
- \`SUPABASE_SERVICE_ROLE_KEY\`

Frontend (.env):
- \`VITE_SUPABASE_URL\`
- \`VITE_SUPABASE_PUBLISHABLE_KEY\`

## Deployment

The application auto-deploys when changes are pushed. Edge functions deploy automatically with the codebase.

---
*Last updated: ${new Date().toISOString().split('T')[0]}*
`;

const DATABASE_SCHEMA_MD = `# Database Schema

Complete documentation of all database tables and relationships.

## Tables Overview

| Table | Purpose |
|-------|---------|
| brands | Gym profiles and settings |
| brand_links | Links displayed on bio pages |
| brand_stats | Aggregated statistics per gym |
| link_analytics | Individual click tracking |
| campaigns | Marketing campaigns |
| login_pins | PIN authentication |
| user_roles | Admin role assignments |
| app_settings | Application configuration |
| sessions | User sessions |
| leads | Lead capture forms |
| chat_sessions | Chat/support sessions |
| chat_messages | Chat messages |
| ai_knowledge | AI knowledge base |
| attribution_events | Marketing attribution |
| link_categories | Available link categories |

---

## Table Details

### brands

Primary table for gym information.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | Gym display name |
| handle | TEXT | URL slug (unique) |
| description | TEXT | Bio description |
| avatar_url | TEXT | Logo/avatar image URL |
| video_url | TEXT | Promotional video URL |
| created_at | TIMESTAMP | Creation date |
| updated_at | TIMESTAMP | Last update |

### brand_links

Links displayed on gym bio pages.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| brand_id | UUID | Foreign key to brands |
| title | TEXT | Link display text |
| url | TEXT | Destination URL |
| short_code | TEXT | Short link code |
| category | TEXT | Link category |
| is_active | BOOLEAN | Show/hide toggle |
| position | INTEGER | Display order |
| og_title | TEXT | Open Graph title |
| og_description | TEXT | Open Graph description |
| og_image | TEXT | Open Graph image |
| clicks | INTEGER | Total click count |
| created_at | TIMESTAMP | Creation date |

### brand_stats

Aggregated statistics (auto-updated via trigger).

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| brand_id | UUID | Foreign key to brands |
| total_clicks | INTEGER | Sum of all link clicks |
| total_links | INTEGER | Number of active links |
| conversion_rate | DECIMAL | Click-through rate |
| last_updated | TIMESTAMP | Stats recalculation time |

### link_analytics

Individual click events for detailed tracking.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| brand_link_id | UUID | Foreign key to brand_links |
| clicked_at | TIMESTAMP | Click timestamp |
| user_agent | TEXT | Browser info |
| referrer | TEXT | Traffic source |
| ip_hash | TEXT | Anonymized IP |
| utm_source | TEXT | Campaign source |
| utm_medium | TEXT | Campaign medium |
| utm_campaign | TEXT | Campaign name |
| utm_term | TEXT | Campaign term |
| utm_content | TEXT | Campaign content |

### campaigns

Marketing campaign definitions.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| brand_id | UUID | Foreign key to brands |
| name | TEXT | Campaign name |
| description | TEXT | Campaign details |
| utm_source | TEXT | Default UTM source |
| utm_medium | TEXT | Default UTM medium |
| start_date | DATE | Campaign start |
| end_date | DATE | Campaign end |
| is_active | BOOLEAN | Active status |

### login_pins

PIN-based authentication.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| email | TEXT | User email |
| pin | TEXT | 4-digit PIN (hashed) |
| created_at | TIMESTAMP | PIN creation time |
| expires_at | TIMESTAMP | PIN expiration |
| used | BOOLEAN | Used status |

### user_roles

Role-based access control.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to auth.users |
| role | app_role | Role enum (admin, user) |

---

## Relationships

\`\`\`
brands
  ├── brand_links (1:many)
  │     └── link_analytics (1:many)
  ├── brand_stats (1:1)
  ├── campaigns (1:many)
  ├── leads (1:many)
  └── chat_sessions (1:many)
        └── chat_messages (1:many)

auth.users
  └── user_roles (1:many)
\`\`\`

## Enums

### app_role
- \`admin\` - Full access to all features
- \`user\` - Standard user access

### link_category_name
- \`social_media\`
- \`booking_contact\`
- \`offers_promotions\`
- \`resources\`

## RLS Policies

All tables have Row Level Security enabled. Key policies:

- **brands**: Public read, admin write
- **brand_links**: Public read, admin write
- **link_analytics**: Insert by anyone (for tracking), read by admin
- **user_roles**: Read/write by service role only

---
*Last updated: ${new Date().toISOString().split('T')[0]}*
`;

const API_REFERENCE_MD = `# API Reference

Documentation for all Edge Functions.

## Base URL

\`\`\`
https://qfffsgiopzpwcijdkvcv.supabase.co/functions/v1
\`\`\`

---

## Functions

### redirect

Handles short link redirects with OG tag injection.

**Endpoint**: \`/redirect/:shortCode\`

**Method**: GET

**Public**: Yes (no auth required)

**Description**: Redirects to the destination URL while:
- Tracking click analytics
- Capturing UTM parameters
- Serving OG meta tags for social sharing

**Parameters**:
| Name | Location | Description |
|------|----------|-------------|
| shortCode | URL path | The short link code |
| utm_* | Query string | Optional UTM tracking params |

**Response**: 302 Redirect with HTML containing OG tags

---

### og-image

Generates dynamic Open Graph images.

**Endpoint**: \`/og-image\`

**Method**: GET

**Public**: Yes

**Parameters**:
| Name | Type | Description |
|------|------|-------------|
| title | string | Main title text |
| subtitle | string | Optional subtitle |
| image | string | Background image URL |

**Response**: PNG image (1200x630)

---

### update-brand-video

Updates a gym's promotional video.

**Endpoint**: \`/update-brand-video\`

**Method**: POST

**Public**: Yes (should require auth)

**Body**:
\`\`\`json
{
  "brandId": "uuid",
  "videoUrl": "https://..."
}
\`\`\`

**Response**:
\`\`\`json
{
  "success": true
}
\`\`\`

---

### update-app-setting

Updates application settings.

**Endpoint**: \`/update-app-setting\`

**Method**: POST

**Public**: Yes (should require auth)

**Body**:
\`\`\`json
{
  "key": "setting_name",
  "value": "setting_value"
}
\`\`\`

**Response**:
\`\`\`json
{
  "success": true,
  "data": { ... }
}
\`\`\`

---

### clear-analytics

Resets all analytics data.

**Endpoint**: \`/clear-analytics\`

**Method**: POST

**Public**: Yes (should require auth)

**Description**: Clears all entries from link_analytics and resets brand_stats.

**Response**:
\`\`\`json
{
  "success": true,
  "message": "All analytics cleared"
}
\`\`\`

---

### manage-pins

Manages PIN authentication.

**Endpoint**: \`/manage-pins\`

**Method**: GET | POST | DELETE

**Public**: Yes

**Operations**:

**GET** - List all PINs (admin only)
\`\`\`json
{
  "pins": [
    { "email": "...", "pin": "****", "created_at": "..." }
  ]
}
\`\`\`

**POST** - Generate or verify PIN
\`\`\`json
// Generate
{ "action": "generate", "email": "user@example.com" }

// Verify
{ "action": "verify", "email": "user@example.com", "pin": "1234" }
\`\`\`

**DELETE** - Reset a user's PIN
\`\`\`json
{ "email": "user@example.com" }
\`\`\`

---

### seed-documentation

Generates and uploads documentation files.

**Endpoint**: \`/seed-documentation\`

**Method**: POST

**Public**: Yes

**Description**: Creates all documentation markdown files and uploads them to the documentation storage bucket.

**Response**:
\`\`\`json
{
  "success": true,
  "files": ["README.md", "USER-GUIDE.md", ...]
}
\`\`\`

---

## Error Handling

All functions return errors in this format:

\`\`\`json
{
  "error": "Error message",
  "details": "Optional additional details"
}
\`\`\`

HTTP status codes:
- 200: Success
- 400: Bad request
- 401: Unauthorized
- 404: Not found
- 500: Server error

---
*Last updated: ${new Date().toISOString().split('T')[0]}*
`;

const SHORT_LINKS_MD = `# Short Links Guide

Everything you need to know about the URL shortener and tracking system.

## Overview

GymBio Hub includes a built-in URL shortener that creates trackable short links for your gym's content. These links:

- Look clean and professional (\`/go/abc123\`)
- Track clicks and traffic sources
- Support UTM parameters for campaign tracking
- Include Open Graph tags for social sharing

## How Short Links Work

### 1. Link Creation

When you create a short link, the system:
1. Generates a unique 6-character code
2. Stores the destination URL and metadata
3. Optionally attaches UTM parameters

### 2. Redirect Flow

When someone clicks a short link:

\`\`\`
User clicks /go/abc123
       ↓
Edge function receives request
       ↓
Logs click with:
  - Timestamp
  - User agent
  - Referrer
  - UTM parameters
       ↓
Returns HTML with OG tags + redirect
       ↓
User lands on destination URL
\`\`\`

### 3. Analytics Collection

Each click records:
- When it happened
- Browser/device info
- Traffic source (referrer)
- Campaign parameters (UTM)

## Creating Short Links

### Via Admin Dashboard

1. Go to **Settings** → **Link Generator**
2. Select a gym and link
3. Add optional UTM parameters
4. Click **Generate**
5. Copy your short link

### Short Code Format

Short codes are 6 characters, alphanumeric:
- Example: \`abc123\`, \`x7y9z2\`
- Case-insensitive
- URL: \`/go/abc123\`

## UTM Parameters

UTM parameters help track marketing campaigns.

### Available Parameters

| Parameter | Purpose | Example |
|-----------|---------|---------|
| utm_source | Traffic source | instagram, newsletter, google |
| utm_medium | Marketing medium | social, email, cpc, banner |
| utm_campaign | Campaign name | summer-promo, new-member-offer |
| utm_term | Paid search terms | gym+membership |
| utm_content | A/B test variant | cta-button-red |

### Example URLs

Basic link:
\`\`\`
/go/abc123
\`\`\`

With UTM tracking:
\`\`\`
/go/abc123?utm_source=instagram&utm_medium=social&utm_campaign=summer-promo
\`\`\`

### Best Practices

1. **Be consistent** - Use the same naming conventions
2. **Be specific** - "instagram-story-may" is better than "social"
3. **Use lowercase** - Avoids confusion and duplicate entries
4. **Document campaigns** - Keep a spreadsheet of your UTM values

## Open Graph Tags

Short links automatically include OG tags for rich social previews.

### Default Tags

\`\`\`html
<meta property="og:title" content="Link Title" />
<meta property="og:description" content="Link description" />
<meta property="og:image" content="https://..." />
<meta property="og:url" content="/go/abc123" />
\`\`\`

### Custom OG Data

When editing a link, you can customize:
- **OG Title**: Social sharing headline
- **OG Description**: Preview text
- **OG Image**: Preview image URL

## Viewing Analytics

### Per-Link Stats

1. Go to gym's Analytics page
2. Find the link in the list
3. View click count and trends

### Campaign Performance

Filter analytics by UTM parameters to see:
- Which campaigns drive the most clicks
- Top traffic sources
- Content performance over time

## Technical Details

### Short Code Generation

\`\`\`typescript
// 6-character alphanumeric, random
const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
let shortCode = '';
for (let i = 0; i < 6; i++) {
  shortCode += chars[Math.floor(Math.random() * chars.length)];
}
\`\`\`

### Redirect Edge Function

The \`/functions/redirect\` edge function:
1. Looks up short code in database
2. Records analytics
3. Returns HTML with meta refresh and OG tags

### Database Tables

**brand_links**:
- \`short_code\`: The 6-character code
- \`url\`: Destination URL
- \`og_title\`, \`og_description\`, \`og_image\`: Social preview data

**link_analytics**:
- \`brand_link_id\`: Which link was clicked
- \`utm_source\`, \`utm_medium\`, etc.: Campaign tracking
- \`referrer\`: Traffic source
- \`clicked_at\`: Timestamp

---
*Last updated: ${new Date().toISOString().split('T')[0]}*
`;

const TROUBLESHOOTING_MD = `# Troubleshooting Guide

Common issues and their solutions.

## For Gym Managers

### Login Issues

**Problem**: Can't log in / PIN not working

**Solutions**:
1. Make sure you're using the correct email address
2. Request a new PIN - old PINs expire after 24 hours
3. Check your spam folder for the PIN email
4. Clear browser cache and cookies
5. Try a different browser

---

**Problem**: "You don't have permission" error

**Solutions**:
1. Confirm your account has admin access
2. Log out and log back in
3. Contact your administrator to verify your role

---

### Dashboard Issues

**Problem**: Stats not updating

**Solutions**:
1. Click the "Refresh Stats" button in settings
2. Wait a few minutes - stats update may be delayed
3. Check that analytics aren't paused

---

**Problem**: Can't see my gym

**Solutions**:
1. Refresh the dashboard page
2. Check if the gym was accidentally deleted
3. Verify you have access to this gym

---

### Link Issues

**Problem**: Links not working

**Solutions**:
1. Verify the URL is correct (including https://)
2. Check that the link is set to "Active"
3. Test the destination URL directly
4. Make sure there are no extra spaces in the URL

---

**Problem**: Clicks not being tracked

**Solutions**:
1. Use short links (/go/code) instead of direct links
2. Check that link_analytics table has proper RLS policies
3. Verify the redirect edge function is deployed

---

### Video Issues

**Problem**: Video won't upload

**Solutions**:
1. Check file size (max 50MB)
2. Use supported formats: MP4, MOV, WebM
3. Try a different browser
4. Compress the video and try again

---

**Problem**: Video not playing on bio page

**Solutions**:
1. Verify the video URL is accessible
2. Check browser console for errors
3. Try re-uploading the video
4. Ensure video format is web-compatible

---

## For Developers

### Edge Function Errors

**Problem**: CORS errors in browser

**Solution**: Ensure all edge functions include:
\`\`\`typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Handle preflight
if (req.method === 'OPTIONS') {
  return new Response(null, { headers: corsHeaders });
}
\`\`\`

---

**Problem**: Edge function returns 500 error

**Solutions**:
1. Check edge function logs in Supabase dashboard
2. Verify all environment variables are set
3. Test the function with curl to see raw response
4. Check for syntax errors in the function code

---

### Database Issues

**Problem**: RLS policy blocking queries

**Solutions**:
1. Verify user is authenticated
2. Check policy conditions match your use case
3. Use \`supabase.auth.getUser()\` to confirm auth state
4. Test with service role key to isolate RLS issues

---

**Problem**: Trigger not updating stats

**Solutions**:
1. Check trigger exists on the table
2. Verify the function has correct permissions
3. Look for errors in Postgres logs
4. Test trigger manually with an INSERT

---

### Storage Issues

**Problem**: File upload fails

**Solutions**:
1. Check bucket exists and is public (if needed)
2. Verify storage RLS policies
3. Check file size limits
4. Ensure correct bucket name in code

---

**Problem**: Can't access uploaded files

**Solutions**:
1. Verify bucket is set to public
2. Check file path is correct
3. Use \`getPublicUrl()\` for public buckets
4. Check storage RLS policies for private buckets

---

### Authentication Issues

**Problem**: User session not persisting

**Solutions**:
1. Check localStorage isn't blocked
2. Verify auth configuration in Supabase client
3. Look for auth errors in console
4. Clear localStorage and re-authenticate

---

## Common Error Messages

| Error | Meaning | Solution |
|-------|---------|----------|
| PGRST116 | No rows returned | Check query conditions, may be expected |
| JWT expired | Auth token expired | Refresh session or re-login |
| 42501 | Permission denied | Check RLS policies |
| 23505 | Unique violation | Duplicate data, handle gracefully |
| 22P02 | Invalid input syntax | Check data types (UUID format, etc.) |

---

## Getting Help

1. Check this troubleshooting guide
2. Review the relevant documentation section
3. Check browser console for JavaScript errors
4. Check network tab for API errors
5. Review edge function logs
6. Contact your system administrator

---
*Last updated: ${new Date().toISOString().split('T')[0]}*
`;

const DOCS = [
  { name: 'README.md', content: README_MD },
  { name: 'USER-GUIDE.md', content: USER_GUIDE_MD },
  { name: 'DEVELOPER-GUIDE.md', content: DEVELOPER_GUIDE_MD },
  { name: 'DATABASE-SCHEMA.md', content: DATABASE_SCHEMA_MD },
  { name: 'API-REFERENCE.md', content: API_REFERENCE_MD },
  { name: 'SHORT-LINKS.md', content: SHORT_LINKS_MD },
  { name: 'TROUBLESHOOTING.md', content: TROUBLESHOOTING_MD },
];

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting documentation seed...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const uploadedFiles: string[] = [];
    const errors: string[] = [];

    for (const doc of DOCS) {
      console.log(`Uploading ${doc.name}...`);
      
      const blob = new Blob([doc.content], { type: 'text/markdown' });
      
      const { error } = await supabase.storage
        .from('documentation')
        .upload(doc.name, blob, {
          contentType: 'text/markdown',
          upsert: true
        });

      if (error) {
        console.error(`Error uploading ${doc.name}:`, error);
        errors.push(`${doc.name}: ${error.message}`);
      } else {
        console.log(`Successfully uploaded ${doc.name}`);
        uploadedFiles.push(doc.name);
      }
    }

    if (errors.length > 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Some files failed to upload',
          uploaded: uploadedFiles,
          errors 
        }),
        { 
          status: 207,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'All documentation files uploaded successfully',
        files: uploadedFiles 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error: unknown) {
    console.error('Error seeding documentation:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
