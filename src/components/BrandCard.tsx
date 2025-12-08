import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Eye, MousePointerClick, TrendingUp, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

  return (
    <Card className="group relative overflow-hidden bg-card border-border rounded-2xl shadow-card hover:shadow-elevated transition-all duration-500 hover:-translate-y-2 animate-fade-in">
      {/* Colored top bar */}
      <div 
        className="absolute top-0 left-0 w-full h-1.5 transition-all duration-300 group-hover:h-2"
        style={{ background: color }}
      />
      
      {/* Subtle gradient overlay on hover */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500"
        style={{ background: `linear-gradient(135deg, ${color} 0%, transparent 50%)` }}
      />
      
      <div className="p-6 relative">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors duration-300">{name}</h3>
            <p className="text-sm text-muted-foreground font-medium">@{handle}</p>
          </div>
          <div 
            className="w-14 h-14 rounded-xl flex items-center justify-center font-bold text-lg text-primary-foreground shadow-lg group-hover:scale-110 transition-transform duration-300"
            style={{ background: color, boxShadow: `0 8px 25px ${color}40` }}
          >
            {name.charAt(0)}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-muted/50 rounded-xl">
          <div className="space-y-1 text-center">
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 font-medium">
              <MousePointerClick className="w-3 h-3" />
              Links
            </p>
            <p className="text-2xl font-bold text-foreground">{links}</p>
          </div>
          <div className="space-y-1 text-center border-x border-border">
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 font-medium">
              <Eye className="w-3 h-3" />
              Clicks
            </p>
            <p className="text-2xl font-bold text-foreground">{clicks.toLocaleString()}</p>
          </div>
          <div className="space-y-1 text-center">
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 font-medium">
              <TrendingUp className="w-3 h-3" />
              Conv.
            </p>
            <p className="text-2xl font-bold text-primary">{conversionRate}%</p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" size="sm" className="flex-1 rounded-xl border-2 hover:border-primary hover:bg-primary/5 transition-all duration-300">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </Button>
          <Button 
            size="sm" 
            className="flex-1 rounded-xl bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-glow"
            onClick={() => navigate(`/${handle}`)}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View Page
          </Button>
        </div>
      </div>
    </Card>
  );
};