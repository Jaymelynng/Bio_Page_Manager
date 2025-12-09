import { BrandCard } from "@/components/BrandCard";
import { StatsCard } from "@/components/StatsCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { BarChart3, Users, TrendingUp, Link2, LogOut, RefreshCw } from "lucide-react";
import { useBrands } from "@/hooks/useBrands";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import biohubHero from "@/assets/biohub-hero.png";

const Index = () => {
  const { data: brands, isLoading, refetch, isFetching } = useBrands();
  const { signOut, user } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: 'Error signing out',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  // Helper to get stats - handles both object and array formats from Supabase
  const getStats = (brand: any) => {
    const stats = Array.isArray(brand.brand_stats) ? brand.brand_stats[0] : brand.brand_stats;
    return stats || { total_clicks: 0, total_links: 0, conversion_rate: 0 };
  };

  // Calculate aggregate stats from all brands
  const totalClicks = brands?.reduce((sum, brand) => sum + (getStats(brand).total_clicks || 0), 0) || 0;
  const totalLinks = brands?.reduce((sum, brand) => sum + (getStats(brand).total_links || 0), 0) || 0;
  const avgConversionRate = brands && brands.length > 0
    ? (brands.reduce((sum, brand) => sum + (getStats(brand).conversion_rate || 0), 0) / brands.length).toFixed(1)
    : "0.0";
  const activeBrands = brands?.length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#d6c5bf] via-[#e6e6e6] to-[#c3a5a5]">
      {/* Header with Logout */}
      <div className="absolute top-4 right-4 z-20">
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
      <div className="relative overflow-hidden h-[280px] md:h-[350px]">
        <img 
          src={biohubHero} 
          alt="BioHub - Gym Bio Link Manager"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Total Clicks"
              value={totalClicks.toLocaleString()}
              change="+12.3% from last month"
              icon={BarChart3}
              trend="up"
            />
            <StatsCard
              title="Avg Conversion"
              value={`${avgConversionRate}%`}
              change="+4.2% from last month"
              icon={TrendingUp}
              trend="up"
            />
            <StatsCard
              title="Active Gyms"
              value={activeBrands.toString()}
              change="All pages live"
              icon={Users}
              trend="up"
            />
            <StatsCard
              title="Total Links"
              value={totalLinks.toString()}
              change="Across all gyms"
              icon={Link2}
              trend="up"
            />
          </div>
        )}
      </div>

      {/* Brands Grid */}
      <div className="container mx-auto px-4 pb-16 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Your Gyms</h2>
            <p className="text-muted-foreground">All {activeBrands} gym bio link pages</p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()}
            disabled={isFetching}
            className="bg-background/80 backdrop-blur-sm hover:bg-background"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
            {isFetching ? 'Refreshing...' : 'Refresh Stats'}
          </Button>
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
                  color={brand.color || "#b48f8f"}
                  colorSecondary={brand.color_secondary}
                  logoUrl={brand.logo_url}
                  links={stats.total_links || 0}
                  clicks={stats.total_clicks || 0}
                  conversionRate={Number(stats.conversion_rate || 0)}
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