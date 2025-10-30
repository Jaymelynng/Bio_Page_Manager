import { supabase } from "@/integrations/supabase/client";

export const seedDatabase = async () => {
  try {
    // Call the edge function to seed brand links
    const { error } = await supabase.functions.invoke('seed-brand-links');
    
    if (error) {
      console.error('Error seeding database:', error);
      throw error;
    }
    
    return { success: true };
  } catch (error) {
    console.error('Failed to seed database:', error);
    throw error;
  }
};