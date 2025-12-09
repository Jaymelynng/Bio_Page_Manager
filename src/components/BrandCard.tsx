import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Eye, MousePointerClick, TrendingUp, ExternalLink, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BrandCardProps {
  name: string;
  handle: string;
  color: string;
  colorSecondary?: string;
  links: number;
  clicks: number;
  conversionRate: number;
  logoUrl?: string;
}

export const BrandCard = ({ 
  name, 
  handle, 
  color, 
  colorSecondary,
  links, 
  clicks, 
  conversionRate,
  logoUrl
}: BrandCardProps) => {
  const navigate = useNavigate();
  const secondaryColor = colorSecondary || color;

  return (
    <Card className="group relative overflow-hidden bg-white/95 backdrop-blur-sm border-border/50 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 animate-fade-in">
      {/* Gradient top bar using gym's brand colors */}
      <div 
        className="absolute top-0 left-0 w-full h-1.5 transition-all duration-300 group-hover:h-2"
        style={{ background: `linear-gradient(90deg, ${color} 0%, ${secondaryColor} 100%)` }}
      />
      
      {/* Subtle gradient overlay on hover using brand colors */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500"
        style={{ background: `linear-gradient(135deg, ${color} 0%, ${secondaryColor} 100%)` }}
      />
      
      <div className="p-6 relative">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-foreground mb-1 group-hover:text-foreground transition-colors duration-300">{name}</h3>
            <p className="text-sm text-muted-foreground font-medium">@{handle}</p>
          </div>
          {/* Logo or initial with brand color gradient */}
          <div 
            className="w-14 h-14 rounded-xl flex items-center justify-center overflow-hidden shadow-lg group-hover:scale-110 transition-transform duration-300"
            style={{ 
              background: `linear-gradient(135deg, ${color} 0%, ${secondaryColor} 100%)`,
              boxShadow: `0 8px 25px ${color}40` 
            }}
          >
            {logoUrl ? (
              <img 
                src={logoUrl} 
                alt={`${name} logo`} 
                className="w-full h-full object-contain p-1.5 bg-white rounded-lg"
              />
            ) : (
              <span className="font-bold text-lg text-white">{name.charAt(0)}</span>
            )}
          </div>
        </div>

        {/* Stats section with brand color accent */}
        <div 
          className="grid grid-cols-3 gap-4 mb-6 p-4 rounded-xl"
          style={{ backgroundColor: `${color}08` }}
        >
          <div className="space-y-1 text-center">
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 font-medium">
              <MousePointerClick className="w-3 h-3" />
              Links
            </p>
            <p className="text-2xl font-bold text-foreground">{links}</p>
          </div>
          <div className="space-y-1 text-center border-x border-border/50">
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
            <p className="text-2xl font-bold" style={{ color }}>{conversionRate}%</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 min-w-[70px] rounded-xl border-2 transition-all duration-300"
            style={{ 
              borderColor: `${color}30`,
            }}
            onClick={() => navigate(`/admin/edit/${handle}`)}
          >
            <Pencil className="w-4 h-4 mr-1" />
            Edit
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 min-w-[90px] rounded-xl border-2 transition-all duration-300"
            style={{ 
              borderColor: `${color}30`,
            }}
            onClick={() => navigate(`/admin/analytics/${handle}`)}
          >
            <BarChart3 className="w-4 h-4 mr-1" />
            Stats
          </Button>
          <Button 
            size="sm" 
            className="flex-1 min-w-[70px] rounded-xl text-white hover:opacity-90 transition-all duration-300 shadow-lg"
            style={{ 
              background: `linear-gradient(135deg, ${color} 0%, ${secondaryColor} 100%)`,
              boxShadow: `0 4px 15px ${color}40`
            }}
            onClick={() => navigate(`/biopage/${handle}`)}
          >
            <ExternalLink className="w-4 h-4 mr-1" />
            View
          </Button>
        </div>
      </div>
    </Card>
  );
};