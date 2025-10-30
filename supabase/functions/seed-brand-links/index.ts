import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Use service role key to bypass RLS for seeding
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Fetch all brands and categories
    const { data: brands, error: brandsError } = await supabaseClient
      .from('brands')
      .select('*');
    
    const { data: categories, error: categoriesError } = await supabaseClient
      .from('link_categories')
      .select('*');

    if (brandsError || categoriesError) {
      throw new Error('Failed to fetch brands or categories');
    }

    // Define links for each gym
    const brandLinks: any = {
      'capgymcpk': [
        { category: "Contact & Info", title: "Call Us", url: "tel:512-259-9995", icon: "📞", display_order: 1, is_featured: false },
        { category: "Contact & Info", title: "Text Us", url: "sms:512-259-9995", icon: "💬", display_order: 2, is_featured: false },
        { category: "Contact & Info", title: "Get Directions", url: "https://maps.app.goo.gl/your-location", icon: "🗺️", display_order: 3, is_featured: false },
        { category: "Social Media", title: "Facebook", url: "https://facebook.com/capgymcpk", icon: "👤", display_order: 1, is_featured: true },
        { category: "Social Media", title: "Instagram", url: "https://instagram.com/capgymcpk", icon: "📸", display_order: 2, is_featured: true },
        { category: "Class Schedules", title: "View Schedule", url: "https://your-schedule-url.com", icon: "📅", display_order: 1, is_featured: true },
        { category: "Membership", title: "Join Now", url: "https://your-membership-url.com", icon: "💪", display_order: 1, is_featured: true },
      ],
      'capgymwlake': [
        { category: "Contact & Info", title: "Call Us", url: "tel:512-555-0001", icon: "📞", display_order: 1, is_featured: false },
        { category: "Social Media", title: "Facebook", url: "https://facebook.com/capgymwlake", icon: "👤", display_order: 1, is_featured: true },
        { category: "Social Media", title: "Instagram", url: "https://instagram.com/capgymwlake", icon: "📸", display_order: 2, is_featured: true },
      ],
      'capgymlakeway': [
        { category: "Contact & Info", title: "Call Us", url: "tel:512-555-0002", icon: "📞", display_order: 1, is_featured: false },
        { category: "Social Media", title: "Facebook", url: "https://facebook.com/capgymlakeway", icon: "👤", display_order: 1, is_featured: true },
        { category: "Social Media", title: "Instagram", url: "https://instagram.com/capgymlakeway", icon: "📸", display_order: 2, is_featured: true },
      ],
      'capgymaveryranch': [
        { category: "Contact & Info", title: "Call Us", url: "tel:512-555-0003", icon: "📞", display_order: 1, is_featured: false },
        { category: "Social Media", title: "Facebook", url: "https://facebook.com/capgymaveryranch", icon: "👤", display_order: 1, is_featured: true },
        { category: "Social Media", title: "Instagram", url: "https://instagram.com/capgymaveryranch", icon: "📸", display_order: 2, is_featured: true },
      ],
      'capgymbeecave': [
        { category: "Contact & Info", title: "Call Us", url: "tel:512-555-0004", icon: "📞", display_order: 1, is_featured: false },
        { category: "Social Media", title: "Facebook", url: "https://facebook.com/capgymbeecave", icon: "👤", display_order: 1, is_featured: true },
        { category: "Social Media", title: "Instagram", url: "https://instagram.com/capgymbeecave", icon: "📸", display_order: 2, is_featured: true },
      ],
      'capgymnaustin': [
        { category: "Contact & Info", title: "Call Us", url: "tel:512-555-0005", icon: "📞", display_order: 1, is_featured: false },
        { category: "Social Media", title: "Facebook", url: "https://facebook.com/capgymnaustin", icon: "👤", display_order: 1, is_featured: true },
        { category: "Social Media", title: "Instagram", url: "https://instagram.com/capgymnaustin", icon: "📸", display_order: 2, is_featured: true },
      ],
      'capgymleander': [
        { category: "Contact & Info", title: "Call Us", url: "tel:512-555-0006", icon: "📞", display_order: 1, is_featured: false },
        { category: "Social Media", title: "Facebook", url: "https://facebook.com/capgymleander", icon: "👤", display_order: 1, is_featured: true },
        { category: "Social Media", title: "Instagram", url: "https://instagram.com/capgymleander", icon: "📸", display_order: 2, is_featured: true },
      ],
      'capgymrrock': [
        { category: "Contact & Info", title: "Call Us", url: "tel:512-555-0007", icon: "📞", display_order: 1, is_featured: false },
        { category: "Social Media", title: "Facebook", url: "https://facebook.com/capgymrrock", icon: "👤", display_order: 1, is_featured: true },
        { category: "Social Media", title: "Instagram", url: "https://instagram.com/capgymrrock", icon: "📸", display_order: 2, is_featured: true },
      ],
      'capgympville': [
        { category: "Contact & Info", title: "Call Us", url: "tel:512-555-0008", icon: "📞", display_order: 1, is_featured: false },
        { category: "Social Media", title: "Facebook", url: "https://facebook.com/capgympville", icon: "👤", display_order: 1, is_featured: true },
        { category: "Social Media", title: "Instagram", url: "https://instagram.com/capgympville", icon: "📸", display_order: 2, is_featured: true },
      ],
      'capgymhutto': [
        { category: "Contact & Info", title: "Call Us", url: "tel:512-555-0009", icon: "📞", display_order: 1, is_featured: false },
        { category: "Social Media", title: "Facebook", url: "https://facebook.com/capgymhutto", icon: "👤", display_order: 1, is_featured: true },
        { category: "Social Media", title: "Instagram", url: "https://instagram.com/capgymhutto", icon: "📸", display_order: 2, is_featured: true },
      ],
    };

    // Create category lookup map
    const categoryMap = new Map(categories.map(c => [c.name, c.id]));

    // Insert links for each brand
    for (const brand of brands) {
      const links = brandLinks[brand.handle] || [];
      
      for (const link of links) {
        const categoryId = categoryMap.get(link.category);
        if (!categoryId) continue;

        await supabaseClient.from('brand_links').insert({
          brand_id: brand.id,
          category_id: categoryId,
          title: link.title,
          url: link.url,
          icon: link.icon,
          display_order: link.display_order,
          is_featured: link.is_featured,
          is_active: true,
        });
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Brand links seeded successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});