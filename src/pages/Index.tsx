import { BrandCard } from "@/components/BrandCard";
import { StatsCard } from "@/components/StatsCard";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, Users, TrendingUp, Link2, Layout } from "lucide-react";
import { useBrands } from "@/hooks/useBrands";

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
      {/* Decorative mesh gradient background */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-60"
        style={{
          background: `
            radial-gradient(ellipse at 20% 30%, hsl(175 65% 40% / 0.08) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 70%, hsl(260 55% 50% / 0.08) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 100%, hsl(175 65% 40% / 0.05) 0%, transparent 40%)
          `
        }}
      />

      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-border bg-gradient-to-br from-foreground via-foreground to-secondary">
        {/* Animated gradient orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div 
            className="absolute -top-1/2 -left-1/4 w-[800px] h-[800px] rounded-full opacity-20 blur-3xl animate-pulse"
            style={{ background: 'radial-gradient(circle, hsl(175 65% 50%) 0%, transparent 70%)' }}
          />
          <div 
            className="absolute -bottom-1/2 -right-1/4 w-[600px] h-[600px] rounded-full opacity-20 blur-3xl animate-pulse"
            style={{ background: 'radial-gradient(circle, hsl(260 55% 60%) 0%, transparent 70%)', animationDelay: '1s' }}
          />
        </div>
        
        <div className="relative container mx-auto px-4 py-16 md:py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 mb-6 animate-fade-in backdrop-blur-sm">
              <Layout className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Admin Dashboard</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-primary-foreground mb-4 animate-fade-in tracking-tight">
              BioHub
            </h1>
            
            <p className="text-xl md:text-2xl text-primary-foreground/70 mb-2 animate-fade-in font-medium">
              Gym Bio Link Manager
            </p>
            
            <p className="text-lg text-primary-foreground/50 max-w-xl animate-fade-in">
              Manage all {activeBrands} gym bio link pages from one place
            </p>
          </div>
        </div>
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
                color={brand.color || "#667eea"}
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