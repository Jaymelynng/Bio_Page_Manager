import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, userId, newPin, name, pin, brandId, isAdmin } = await req.json();

    console.log(`[manage-pins] Action: ${action}`);

    if (action === 'update') {
      // Update an existing PIN
      if (!userId || !newPin) {
        return new Response(
          JSON.stringify({ error: 'userId and newPin are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Validate PIN format
      if (!/^\d{4,6}$/.test(newPin)) {
        return new Response(
          JSON.stringify({ error: 'PIN must be 4-6 digits' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check for duplicate PIN
      const { data: existingPin } = await supabase
        .from('login_pins')
        .select('id')
        .eq('pin', newPin)
        .neq('id', userId)
        .maybeSingle();

      if (existingPin) {
        return new Response(
          JSON.stringify({ error: 'This PIN is already in use' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { error } = await supabase
        .from('login_pins')
        .update({ pin: newPin })
        .eq('id', userId);

      if (error) {
        console.error('[manage-pins] Update error:', error);
        throw error;
      }

      console.log(`[manage-pins] PIN updated for user ${userId}`);
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'create') {
      // Create a new PIN user
      if (!name || !pin) {
        return new Response(
          JSON.stringify({ error: 'name and pin are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Validate PIN format
      if (!/^\d{4,6}$/.test(pin)) {
        return new Response(
          JSON.stringify({ error: 'PIN must be 4-6 digits' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check for duplicate PIN
      const { data: existingPin } = await supabase
        .from('login_pins')
        .select('id')
        .eq('pin', pin)
        .maybeSingle();

      if (existingPin) {
        return new Response(
          JSON.stringify({ error: 'This PIN is already in use' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data, error } = await supabase
        .from('login_pins')
        .insert({
          name: name.trim(),
          pin,
          brand_id: brandId || null,
          is_admin: isAdmin || false,
        })
        .select()
        .single();

      if (error) {
        console.error('[manage-pins] Create error:', error);
        throw error;
      }

      console.log(`[manage-pins] New user created: ${name}`);
      return new Response(
        JSON.stringify({ success: true, data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'delete') {
      // Delete a PIN user
      if (!userId) {
        return new Response(
          JSON.stringify({ error: 'userId is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { error } = await supabase
        .from('login_pins')
        .delete()
        .eq('id', userId);

      if (error) {
        console.error('[manage-pins] Delete error:', error);
        throw error;
      }

      console.log(`[manage-pins] User deleted: ${userId}`);
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('[manage-pins] Error:', error);
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});