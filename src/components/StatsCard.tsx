import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  change: string;
  icon: LucideIcon;
  trend: "up" | "down";
}

export const StatsCard = ({ title, value, change, icon: Icon, trend }: StatsCardProps) => {
  return (
    <Card className="relative overflow-hidden bg-card border-border p-6 rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 animate-fade-in group">
      {/* Gradient accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-secondary opacity-80" />
      
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
          <p className="text-4xl font-bold text-foreground">{value}</p>
          <p className={`text-sm font-medium ${trend === 'up' ? 'text-primary' : 'text-destructive'}`}>
            {change}
          </p>
        </div>
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform duration-300">
          <Icon className="w-8 h-8 text-primary-foreground" />
        </div>
      </div>
    </Card>
  );
};