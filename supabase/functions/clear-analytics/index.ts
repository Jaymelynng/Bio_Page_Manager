import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Clear analytics request received');

    // Create Supabase client with service role for bypassing RLS
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Delete all link analytics
    const { error: analyticsError } = await supabase
      .from('link_analytics')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows

    if (analyticsError) {
      console.error('Error deleting link_analytics:', analyticsError);
      throw analyticsError;
    }

    console.log('Successfully deleted all link_analytics');

    // Reset all brand_stats to zero
    const { error: statsError } = await supabase
      .from('brand_stats')
      .update({ 
        total_clicks: 0, 
        conversion_rate: 0,
        last_updated: new Date().toISOString()
      })
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Update all rows

    if (statsError) {
      console.error('Error resetting brand_stats:', statsError);
      throw statsError;
    }

    console.log('Successfully reset all brand_stats');

    return new Response(
      JSON.stringify({ success: true, message: 'All analytics cleared successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in clear-analytics:', error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
