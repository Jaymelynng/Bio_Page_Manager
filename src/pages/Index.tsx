import { BrandCard } from "@/components/BrandCard";
import { StatsCard } from "@/components/StatsCard";
import { Button } from "@/components/ui/button";
import { Brain, BarChart3, Users, TrendingUp, Sparkles, Plus } from "lucide-react";
import gymHero from "@/assets/gym-hero.jpg";

const Index = () => {
  const brands = [
    { 
      name: "PowerFit Studio", 
      handle: "powerfitstudio", 
      color: "linear-gradient(135deg, #FF6B6B, #FF4757)",
      links: 8,
      clicks: 12847,
      conversionRate: 24.3
    },
    { 
      name: "Iron Temple", 
      handle: "irontemplegym", 
      color: "linear-gradient(135deg, #4ECDC4, #44A08D)",
      links: 12,
      clicks: 18392,
      conversionRate: 31.7
    },
    { 
      name: "Velocity Fitness", 
      handle: "velocityfit", 
      color: "linear-gradient(135deg, #F9CA24, #F0932B)",
      links: 6,
      clicks: 9283,
      conversionRate: 19.8
    },
    { 
      name: "Apex Training", 
      handle: "apextraining", 
      color: "linear-gradient(135deg, #A29BFE, #6C5CE7)",
      links: 10,
      clicks: 15627,
      conversionRate: 28.5
    },
    { 
      name: "Elite Performance", 
      handle: "eliteperformance", 
      color: "linear-gradient(135deg, #FD79A8, #E84393)",
      links: 9,
      clicks: 11492,
      conversionRate: 22.1
    },
    { 
      name: "CoreStrength Lab", 
      handle: "corestrengthlabs", 
      color: "linear-gradient(135deg, #00B894, #00BF9D)",
      links: 7,
      clicks: 8834,
      conversionRate: 26.9
    },
  ];

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
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="container mx-auto px-4 -mt-12 relative z-10 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Clicks"
            value="76.5K"
            change="+12.3% from last month"
            icon={BarChart3}
            trend="up"
          />
          <StatsCard
            title="Avg Conversion"
            value="25.5%"
            change="+4.2% from last month"
            icon={TrendingUp}
            trend="up"
          />
          <StatsCard
            title="Active Brands"
            value="10"
            change="All brands optimized"
            icon={Users}
            trend="up"
          />
          <StatsCard
            title="AI Suggestions"
            value="47"
            change="New optimizations ready"
            icon={Brain}
            trend="up"
          />
        </div>
      </div>

      {/* Brands Grid */}
      <div className="container mx-auto px-4 pb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Your Brands</h2>
            <p className="text-muted-foreground">Manage and optimize all your fitness brand bio links</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {brands.map((brand) => (
            <BrandCard key={brand.handle} {...brand} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
