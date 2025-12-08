import { BrandCard } from "@/components/BrandCard";
import { StatsCard } from "@/components/StatsCard";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, Users, TrendingUp, Link2, Layout } from "lucide-react";
import { useBrands } from "@/hooks/useBrands";
import biohubBg from "@/assets/biohub-bg.gif";

const Index = () => {
  const { data: brands, isLoading } = useBrands();

  // Calculate aggregate stats from all brands
  const totalClicks = brands?.reduce((sum, brand) => sum + (brand.brand_stats?.[0]?.total_clicks || 0), 0) || 0;
  const totalLinks = brands?.reduce((sum, brand) => sum + (brand.brand_stats?.[0]?.total_links || 0), 0) || 0;
  const avgConversionRate = brands && brands.length > 0
    ? (brands.reduce((sum, brand) => sum + (brand.brand_stats?.[0]?.conversion_rate || 0), 0) / brands.length).toFixed(1)
    : "0.0";
  const activeBrands = brands?.length || 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Subtle warm mesh gradient background */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-50"
        style={{
          background: `
            radial-gradient(ellipse at 20% 30%, hsl(0 20% 63% / 0.06) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 70%, hsl(225 15% 73% / 0.06) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 100%, hsl(20 20% 80% / 0.05) 0%, transparent 40%)
          `
        }}
      />

      {/* Hero Section - warm neutral gradient */}
      <div className="relative overflow-hidden border-b border-border bg-gradient-to-br from-[#737373] via-[#737373] to-[#adb2c6]">
        {/* Animated background GIF */}
        <img 
          src={biohubBg} 
          alt="BioHub - Gym Bio Link Manager"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />
      </div>

      {/* Stats Overview */}
      <div className="container mx-auto px-4 -mt-10 relative z-10 mb-12">
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
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Skeleton className="h-72 rounded-2xl" />
            <Skeleton className="h-72 rounded-2xl" />
            <Skeleton className="h-72 rounded-2xl" />
          </div>
        ) : brands && brands.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {brands.map((brand: any) => (
              <BrandCard 
                key={brand.id} 
                name={brand.name}
                handle={brand.handle}
                color={brand.color || "#b48f8f"}
                colorSecondary={brand.color_secondary}
                logoUrl={brand.logo_url}
                links={brand.brand_stats?.[0]?.total_links || 0}
                clicks={brand.brand_stats?.[0]?.total_clicks || 0}
                conversionRate={Number(brand.brand_stats?.[0]?.conversion_rate || 0)}
              />
            ))}
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