import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Eye, MousePointerClick, TrendingUp } from "lucide-react";

interface BrandCardProps {
  name: string;
  handle: string;
  color: string;
  links: number;
  clicks: number;
  conversionRate: number;
  logoUrl?: string;
}

export const BrandCard = ({ 
  name, 
  handle, 
  color, 
  links, 
  clicks, 
  conversionRate 
}: BrandCardProps) => {
  return (
    <Card className="group relative overflow-hidden bg-gradient-card border-border hover:border-primary/50 transition-all duration-500 hover:shadow-[0_0_30px_hsl(var(--primary)/0.2)] animate-fade-in">
      <div 
        className="absolute top-0 left-0 w-full h-1 transition-all duration-300 group-hover:h-2"
        style={{ background: color }}
      />
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-foreground mb-1">{name}</h3>
            <p className="text-sm text-muted-foreground">@{handle}</p>
          </div>
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-lg"
            style={{ background: color }}
          >
            {name.charAt(0)}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <MousePointerClick className="w-3 h-3" />
              Links
            </p>
            <p className="text-2xl font-bold text-foreground">{links}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Eye className="w-3 h-3" />
              Clicks
            </p>
            <p className="text-2xl font-bold text-foreground">{clicks.toLocaleString()}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Conv.
            </p>
            <p className="text-2xl font-bold text-primary">{conversionRate}%</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </Button>
          <Button variant="premium" size="sm" className="flex-1">
            Edit Page
          </Button>
        </div>
      </div>
    </Card>
  );
};
