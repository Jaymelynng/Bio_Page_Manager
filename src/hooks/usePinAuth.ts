import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PinUser {
  id: string;
  name: string;
  isAdmin: boolean;
  brandId: string | null;
}

const SESSION_KEY = 'biohub_pin_session';

export function usePinAuth() {
  const [user, setUser] = useState<PinUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const stored = localStorage.getItem(SESSION_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed);
      } catch {
        localStorage.removeItem(SESSION_KEY);
      }
    }
    setLoading(false);
  }, []);

  const verifyPin = async (pin: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase
        .from('login_pins')
        .select('id, name, is_admin, brand_id')
        .eq('pin', pin)
        .maybeSingle();

      if (error) {
        return { success: false, error: 'Failed to verify PIN' };
      }

      if (!data) {
        return { success: false, error: 'Invalid PIN' };
      }

      // Update last login time
      await supabase
        .from('login_pins')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', data.id);

      const pinUser: PinUser = {
        id: data.id,
        name: data.name,
        isAdmin: data.is_admin || false,
        brandId: data.brand_id,
      };

      setUser(pinUser);
      localStorage.setItem(SESSION_KEY, JSON.stringify(pinUser));

      return { success: true };
    } catch {
      return { success: false, error: 'An error occurred' };
    }
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  };

  return {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.isAdmin || false,
    verifyPin,
    signOut,
  };
}
