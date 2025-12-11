import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const handle = url.searchParams.get('handle');
    
    if (!handle) {
      console.error('No handle provided');
      return new Response('Handle required', { status: 400 });
    }

    console.log('Fetching brand data for:', handle);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch brand data
    const { data: brand, error } = await supabase
      .from('brands')
      .select('name, tagline, logo_url, city, state, color')
      .eq('handle', handle)
      .eq('is_active', true)
      .single();

    if (error || !brand) {
      console.error('Brand not found:', error);
      return new Response('Brand not found', { status: 404 });
    }

    console.log('Brand found:', brand.name);

    // Build the redirect URL to the actual page with UTM params
    const baseUrl = 'https://biopages.mygymtools.com';
    const utmSource = url.searchParams.get('utm_source');
    const utmMedium = url.searchParams.get('utm_medium');
    const utmCampaign = url.searchParams.get('utm_campaign');
    
    const redirectParams = new URLSearchParams();
    if (utmSource) redirectParams.append('utm_source', utmSource);
    if (utmMedium) redirectParams.append('utm_medium', utmMedium);
    if (utmCampaign) redirectParams.append('utm_campaign', utmCampaign);
    const redirectQuery = redirectParams.toString();
    
    const appUrl = `${baseUrl}/biopage/${handle}${redirectQuery ? `?${redirectQuery}` : ''}`;
    
    // Detect if request is from a social media crawler
    const userAgent = req.headers.get('user-agent') || '';
    const isCrawler = /facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegram|slackbot|discordbot|bingbot|googlebot/i.test(userAgent);
    
    console.log('User-Agent:', userAgent);
    console.log('Is Crawler:', isCrawler);
    console.log('Redirect URL:', appUrl);

    // For regular users, do a direct 302 redirect
    if (!isCrawler) {
      return new Response(null, {
        status: 302,
        headers: {
          'Location': appUrl,
          ...corsHeaders,
        },
      });
    }

    // For crawlers, return HTML with OG tags
    const title = brand.name;
    const description = brand.tagline || `${brand.name} - Classes, schedules, and more in ${brand.city || ''}, ${brand.state || ''}`.trim();
    const imageUrl = brand.logo_url || '';
    const themeColor = brand.color || '#1f53a3';

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <meta name="theme-color" content="${themeColor}">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${appUrl}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${imageUrl}">
  <meta property="og:site_name" content="BioHub">
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary">
  <meta name="twitter:url" content="${appUrl}">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${imageUrl}">
</head>
<body>
  <p>Redirecting to <a href="${appUrl}">${title}</a>...</p>
</body>
</html>`;

    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
        ...corsHeaders,
      },
    });

  } catch (error) {
    console.error('Error generating OG page:', error);
    return new Response('Internal server error', { status: 500 });
  }
});
