import { BrandCard } from "@/components/BrandCard";
import { StatsCard } from "@/components/StatsCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { BarChart3, Users, Link2, LogOut, MousePointerClick, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useBrands, useBrandTopSources } from "@/hooks/useBrands";
import { usePinAuth } from "@/hooks/usePinAuth";
import { useToast } from "@/hooks/use-toast";
import biohubHeroFallback from "@/assets/biohub-hero.png";

const Index = () => {
  const { data: brands, isLoading } = useBrands();
  const brandIds = brands?.map(b => b.id) || [];
  const { data: topSources } = useBrandTopSources(brandIds);
  const { signOut } = usePinAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [heroImageUrl, setHeroImageUrl] = useState<string | null>(null);

  // Real month-over-month click change
  const { data: clickTrend } = useQuery({
    queryKey: ["click-trend"],
    queryFn: async () => {
      const now = new Date();
      const startThisMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const startLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();

      const [{ count: thisMonth }, { count: lastMonth }] = await Promise.all([
        supabase.from("link_analytics").select("*", { count: "exact", head: true }).gte("clicked_at", startThisMonth),
        supabase.from("link_analytics").select("*", { count: "exact", head: true }).gte("clicked_at", startLastMonth).lt("clicked_at", startThisMonth),
      ]);
      return { thisMonth: thisMonth || 0, lastMonth: lastMonth || 0 };
    },
    staleTime: 60 * 1000,
  });

  useEffect(() => {
    const fetchHeroImage = async () => {
      const { data } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'dashboard_hero_image')
        .single();
      
      if (data?.value) {
        setHeroImageUrl(data.value);
      }
    };
    fetchHeroImage();
  }, []);


  const handleLogout = () => {
    signOut();
    navigate('/biopage/auth');
  };

  // Helper to get stats - handles both object and array formats from Supabase
  const getStats = (brand: any) => {
    const stats = Array.isArray(brand.brand_stats) ? brand.brand_stats[0] : brand.brand_stats;
    return stats || { total_clicks: 0, total_links: 0, conversion_rate: 0 };
  };

  // Calculate aggregate stats from all brands
  const totalClicks = brands?.reduce((sum, brand) => sum + (getStats(brand).total_clicks || 0), 0) || 0;
  const totalLinks = brands?.reduce((sum, brand) => sum + (getStats(brand).total_links || 0), 0) || 0;
  const activeBrands = brands?.length || 0;
  const clicksPerLink = totalLinks > 0 ? (totalClicks / totalLinks).toFixed(1) : "0";

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#d6c5bf] via-[#e6e6e6] to-[#c3a5a5]">
      {/* Header with Settings and Logout */}
      <div className="absolute top-4 right-4 z-20 flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate('/biopage/admin/dashboard-settings')}
          className="bg-background/80 backdrop-blur-sm hover:bg-background"
        >
          <Shield className="h-4 w-4 mr-2" />
          Admin Panel
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleLogout}
          className="bg-background/80 backdrop-blur-sm hover:bg-background"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>

      {/* Hero Section - Full GIF Background */}
      <div className="relative w-full bg-gradient-to-b from-[#d6c5bf] to-[#e6e6e6]">
        <img 
          src={heroImageUrl || biohubHeroFallback} 
          alt="BioHub - Gym Bio Link Manager"
          className="w-full h-auto max-h-[400px] object-contain pointer-events-none"
        />
      </div>

      {/* Stats Overview */}
      <div className="container mx-auto px-4 mt-6 relative z-10 mb-12">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Skeleton className="h-36 rounded-2xl" />
            <Skeleton className="h-36 rounded-2xl" />
            <Skeleton className="h-36 rounded-2xl" />
            <Skeleton className="h-36 rounded-2xl" />
          </div>
        ) : (
          (() => {
            const thisMonth = clickTrend?.thisMonth ?? 0;
            const lastMonth = clickTrend?.lastMonth ?? 0;
            let changeText = "No prior data";
            let trend: "up" | "down" = "up";
            if (lastMonth > 0) {
              const pct = ((thisMonth - lastMonth) / lastMonth) * 100;
              trend = pct >= 0 ? "up" : "down";
              changeText = `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}% from last month`;
            } else if (thisMonth > 0) {
              changeText = `${thisMonth} clicks this month`;
            }
            const topBrand = brands?.slice().sort((a: any, b: any) => (getStats(b).total_clicks || 0) - (getStats(a).total_clicks || 0))[0];
            return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                  title="Total Clicks"
                  value={totalClicks.toLocaleString()}
                  change={changeText}
                  icon={MousePointerClick}
                  trend={trend}
                />
                <StatsCard
                  title="Clicks/Link"
                  value={clicksPerLink}
                  change={totalLinks > 0 ? `Across ${totalLinks} links` : "No links yet"}
                  icon={BarChart3}
                  trend="up"
                />
                <StatsCard
                  title="Active Gyms"
                  value={activeBrands.toString()}
                  change={topBrand ? `Top: ${topBrand.name}` : "No gyms yet"}
                  icon={Users}
                  trend="up"
                />
                <StatsCard
                  title="Total Links"
                  value={totalLinks.toString()}
                  change={activeBrands > 0 ? `${(totalLinks / activeBrands).toFixed(1)} avg per gym` : "No gyms yet"}
                  icon={Link2}
                  trend="up"
                />
              </div>
            );
          })()
        )}
      </div>

      {/* Brands Grid */}
      <div className="container mx-auto px-4 pb-16 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Your Gyms</h2>
          <p className="text-muted-foreground">Bio Link Page Manager — create, track all 10 gyms' bio pages from one place</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Skeleton className="h-72 rounded-2xl" />
            <Skeleton className="h-72 rounded-2xl" />
            <Skeleton className="h-72 rounded-2xl" />
          </div>
        ) : brands && brands.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {brands.map((brand: any) => {
              const stats = getStats(brand);
              return (
                <BrandCard 
                  key={brand.id} 
                  name={brand.name}
                  handle={brand.handle}
                  shortCode={brand.short_code}
                  color={brand.color || "#b48f8f"}
                  colorSecondary={brand.color_secondary}
                  logoUrl={brand.logo_url}
                  links={stats.total_links || 0}
                  clicks={stats.total_clicks || 0}
                  topSource={topSources?.[brand.id] || null}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No gyms found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;