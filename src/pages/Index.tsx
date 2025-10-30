import { BrandCard } from "@/components/BrandCard";
import { StatsCard } from "@/components/StatsCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Brain, BarChart3, Users, TrendingUp, Sparkles, Plus } from "lucide-react";
import gymHero from "@/assets/gym-hero.jpg";
import { useBrands } from "@/hooks/useBrands";
import { seedDatabase } from "@/utils/seedDatabase";
import { useState } from "react";

const Index = () => {
  const { data: brands, isLoading } = useBrands();
  const [isSeeding, setIsSeeding] = useState(false);

  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    await seedDatabase();
    setIsSeeding(false);
    window.location.reload();
  };

  // Calculate aggregate stats from all brands
  const totalClicks = brands?.reduce((sum, brand) => sum + (brand.brand_stats?.[0]?.total_clicks || 0), 0) || 0;
  const totalLinks = brands?.reduce((sum, brand) => sum + (brand.brand_stats?.[0]?.total_links || 0), 0) || 0;
  const avgConversionRate = brands && brands.length > 0
    ? (brands.reduce((sum, brand) => sum + (brand.brand_stats?.[0]?.conversion_rate || 0), 0) / brands.length).toFixed(1)
    : "0.0";
  const activeBrands = brands?.length || 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-hero border-b border-border">
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url(${gymHero})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />
        
        <div className="relative container mx-auto px-4 py-16">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 animate-fade-in">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">AI-Powered Multi-Brand Hub</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 animate-fade-in">
              Smart Bio Links
              <span className="block text-primary mt-2">That Convert</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl animate-fade-in">
              Manage 10 fitness brands with AI-optimized link pages. Increase conversions with intelligent insights and personalized CTAs.
            </p>
            
            <div className="flex flex-wrap gap-4 animate-fade-in">
              <Button size="lg" variant="premium" className="gap-2">
                <Brain className="w-5 h-5" />
                View AI Insights
              </Button>
              <Button size="lg" variant="outline" className="gap-2">
                <Plus className="w-5 h-5" />
                Add New Brand
              </Button>
              {brands?.length === 0 && (
                <Button 
                  size="lg" 
                  onClick={handleSeedDatabase}
                  disabled={isSeeding}
                  className="gap-2"
                >
                  {isSeeding ? "Seeding..." : "🌱 Seed Database"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="container mx-auto px-4 -mt-12 relative z-10 mb-12">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
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
              title="Active Brands"
              value={activeBrands.toString()}
              change="All brands optimized"
              icon={Users}
              trend="up"
            />
            <StatsCard
              title="Total Links"
              value={totalLinks.toString()}
              change="Across all brands"
              icon={Brain}
              trend="up"
            />
          </div>
        )}
      </div>

      {/* Brands Grid */}
      <div className="container mx-auto px-4 pb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Your Brands</h2>
            <p className="text-muted-foreground">Manage and optimize all your fitness brand bio links</p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        ) : brands && brands.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {brands.map((brand) => (
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
            <p className="text-muted-foreground mb-4">No brands found. Click "Seed Database" above to populate with your gym data.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
