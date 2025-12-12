import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PRODUCTION_DOMAIN = 'https://biopages.mygymtools.com';

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    
    // Expected path: /redirect/{shortCode} where shortCode is like "capitalrr-ig"
    const shortCode = pathParts[pathParts.length - 1] || url.searchParams.get('code');
    
    if (!shortCode) {
      console.error('No short code provided');
      return new Response('Short code required', { status: 400 });
    }

    console.log('Processing short code:', shortCode);

    // Parse the short code: format is {brand-short-code}-{campaign-short-code}
    const lastDashIndex = shortCode.lastIndexOf('-');
    if (lastDashIndex === -1) {
      console.error('Invalid short code format:', shortCode);
      return new Response('Invalid short code format', { status: 400 });
    }

    const brandShortCode = shortCode.substring(0, lastDashIndex);
    const campaignShortCode = shortCode.substring(lastDashIndex + 1);

    console.log('Brand short code:', brandShortCode, 'Campaign short code:', campaignShortCode);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Look up brand by short_code
    const { data: brand, error: brandError } = await supabase
      .from('brands')
      .select('handle, name, tagline, logo_url, city, state, color')
      .eq('short_code', brandShortCode)
      .eq('is_active', true)
      .single();

    if (brandError || !brand) {
      console.error('Brand not found for short code:', brandShortCode, brandError);
      return new Response('Brand not found', { status: 404 });
    }

    console.log('Found brand:', brand.handle);

    // Look up campaign by short_code
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('source, medium, campaign')
      .eq('short_code', campaignShortCode)
      .eq('is_active', true)
      .single();

    if (campaignError || !campaign) {
      console.error('Campaign not found for short code:', campaignShortCode, campaignError);
      return new Response('Campaign not found', { status: 404 });
    }

    console.log('Found campaign:', campaign.source, campaign.medium, campaign.campaign);

    // Build the final redirect URL with UTM parameters
    const redirectParams = new URLSearchParams();
    redirectParams.set('utm_source', campaign.source);
    redirectParams.set('utm_medium', campaign.medium);
    redirectParams.set('utm_campaign', campaign.campaign);

    const finalUrl = `${PRODUCTION_DOMAIN}/biopage/${brand.handle}?${redirectParams.toString()}`;

    // Check if request is from a social media crawler
    const userAgent = req.headers.get('user-agent')?.toLowerCase() || '';
    const crawlerPatterns = [
      'facebookexternalhit',
      'twitterbot',
      'linkedinbot',
      'whatsapp',
      'telegram',
      'slackbot',
      'discordbot',
      'bingbot',
      'googlebot',
    ];
    
    const isCrawler = crawlerPatterns.some(pattern => userAgent.includes(pattern));

    if (isCrawler) {
      console.log('Social crawler detected, serving OG tags');
      
      // Serve HTML with OG tags for social crawlers
      const location = [brand.city, brand.state].filter(Boolean).join(', ');
      const fallbackImage = 'https://biopages.mygymtools.com/og-default.png';
      const ogImage = brand.logo_url || fallbackImage;

      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${brand.name}</title>
  
  <!-- Open Graph Tags -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="${brand.name}">
  <meta property="og:description" content="${brand.tagline || `Visit ${brand.name}${location ? ` in ${location}` : ''}`}">
  <meta property="og:image" content="${ogImage}">
  <meta property="og:url" content="${finalUrl}">
  <meta property="og:site_name" content="${brand.name}">
  
  <!-- Twitter Card Tags -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${brand.name}">
  <meta name="twitter:description" content="${brand.tagline || `Visit ${brand.name}${location ? ` in ${location}` : ''}`}">
  <meta name="twitter:image" content="${ogImage}">
  
  <!-- Theme Color -->
  <meta name="theme-color" content="${brand.color || '#000000'}">
  
  <!-- Redirect for non-crawlers -->
  <meta http-equiv="refresh" content="0;url=${finalUrl}">
</head>
<body>
  <p>Redirecting to <a href="${finalUrl}">${brand.name}</a>...</p>
</body>
</html>`;

      return new Response(html, {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/html; charset=utf-8',
        },
      });
    }

    // For regular users, do a 302 redirect
    console.log('Regular user, redirecting to:', finalUrl);
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': finalUrl,
      },
    });

  } catch (error) {
    console.error('Error in redirect function:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(`Server error: ${message}`, { 
      status: 500,
      headers: corsHeaders,
    });
  }
});
