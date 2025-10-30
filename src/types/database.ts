export interface Brand {
  id: string;
  name: string;
  handle: string;
  abbreviation: string;
  phone: string;
  email: string;
  address: string;
  website: string;
  google_maps_url: string;
  directions_url: string;
  color_primary: string;
  color_secondary: string;
  color_tertiary: string;
  color_quaternary: string;
  logo_url?: string;
  instagram_handle: string;
  facebook_url: string;
  messenger_url: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface LinkCategory {
  id: string;
  name: string;
  icon: string;
  display_order: number;
  is_active: boolean;
}

export interface BrandLink {
  id: string;
  brand_id: string;
  category_id: string;
  title: string;
  url: string;
  icon: string;
  display_order: number;
  is_featured: boolean;
  is_active: boolean;
  created_at?: string;
  category?: LinkCategory;
}

// Helper type for seeding data with category name instead of ID
export interface BrandLinkSeed {
  category: string;
  title: string;
  url: string;
  icon: string;
  display_order: number;
  is_featured: boolean;
  is_active: boolean;
}

export interface LinkAnalytics {
  id: string;
  brand_link_id: string;
  clicked_at: string;
  visitor_id: string;
  referrer?: string;
  user_agent?: string;
  location?: string;
}

export interface BrandStats {
  id: string;
  brand_id: string;
  date: string;
  total_clicks: number;
  unique_visitors: number;
  conversion_rate?: number;
}
