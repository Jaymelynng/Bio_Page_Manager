import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PinUser {
  id: string;
  name: string;
  isAdmin: boolean;
  brandId: string | null;
}

const SESSION_KEY = 'biohub_pin_session';
const ATTEMPTS_KEY = 'biohub_pin_attempts';
const LOCKOUT_KEY = 'biohub_pin_lockout_until';
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

export function usePinAuth() {
  const [user, setUser] = useState<PinUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(SESSION_KEY);
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem(SESSION_KEY);
      }
    }
    setLoading(false);
  }, []);

  const getLockoutRemaining = (): number => {
    const until = parseInt(localStorage.getItem(LOCKOUT_KEY) || '0', 10);
    if (!until) return 0;
    const remaining = until - Date.now();
    if (remaining <= 0) {
      localStorage.removeItem(LOCKOUT_KEY);
      localStorage.removeItem(ATTEMPTS_KEY);
      return 0;
    }
    return remaining;
  };

  const verifyPin = async (
    pin: string
  ): Promise<{ success: boolean; error?: string; lockoutMs?: number }> => {
    const lockoutRemaining = getLockoutRemaining();
    if (lockoutRemaining > 0) {
      const minutes = Math.ceil(lockoutRemaining / 60000);
      return {
        success: false,
        error: `Too many failed attempts. Try again in ${minutes} minute${minutes > 1 ? 's' : ''}.`,
        lockoutMs: lockoutRemaining,
      };
    }

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
        // Failed attempt — increment counter
        const attempts = parseInt(localStorage.getItem(ATTEMPTS_KEY) || '0', 10) + 1;
        localStorage.setItem(ATTEMPTS_KEY, String(attempts));

        if (attempts >= MAX_ATTEMPTS) {
          const until = Date.now() + LOCKOUT_MS;
          localStorage.setItem(LOCKOUT_KEY, String(until));
          return {
            success: false,
            error: 'Too many failed attempts. Locked for 15 minutes.',
            lockoutMs: LOCKOUT_MS,
          };
        }

        const remaining = MAX_ATTEMPTS - attempts;
        return {
          success: false,
          error: `Invalid PIN. ${remaining} attempt${remaining > 1 ? 's' : ''} remaining.`,
        };
      }

      // Successful login — clear attempt counter
      localStorage.removeItem(ATTEMPTS_KEY);
      localStorage.removeItem(LOCKOUT_KEY);

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
    getLockoutRemaining,
  };
}
