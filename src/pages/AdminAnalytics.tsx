import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, MousePointerClick, Link2, Calendar, Smartphone, Monitor, Target } from "lucide-react";
import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

const AdminAnalytics = () => {
  const { handle } = useParams();
  const navigate = useNavigate();

  // Fetch brand details
  const { data: brand, isLoading: brandLoading } = useQuery({
    queryKey: ['brand', handle],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('brands')
        .select('*, brand_stats(*)')
        .eq('handle', handle)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  // Fetch link analytics for this brand
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['link-analytics', brand?.id],
    queryFn: async () => {
      if (!brand?.id) return [];
      
      // Get all brand links first
      const { data: links, error: linksError } = await supabase
        .from('brand_links')
        .select('id, title')
        .eq('brand_id', brand.id);
      
      if (linksError) throw linksError;
      if (!links || links.length === 0) return [];

      const linkIds = links.map(l => l.id);
      
      // Get analytics for these links (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: clickData, error: clickError } = await supabase
        .from('link_analytics')
        .select('*')
        .in('brand_link_id', linkIds)
        .gte('clicked_at', thirtyDaysAgo.toISOString())
        .order('clicked_at', { ascending: false });
      
      if (clickError) throw clickError;
      
      // Map link titles to analytics
      const linkMap = Object.fromEntries(links.map(l => [l.id, l.title]));
      return (clickData || []).map(click => ({
        ...click,
        link_title: linkMap[click.brand_link_id] || 'Unknown Link'
      }));
    },
    enabled: !!brand?.id,
  });

  // Fetch CTA clicks (tracked with brand.id as brand_link_id)
  const { data: ctaClicks } = useQuery({
    queryKey: ['cta-clicks', brand?.id],
    queryFn: async () => {
      if (!brand?.id) return 0;
      
      const { count, error } = await supabase
        .from('link_analytics')
        .select('*', { count: 'exact', head: true })
        .eq('brand_link_id', brand.id);
      
      if (error) return 0;
      return count || 0;
    },
    enabled: !!brand?.id,
  });

  const stats = Array.isArray(brand?.brand_stats) ? brand?.brand_stats[0] : brand?.brand_stats;
  const isLoading = brandLoading || analyticsLoading;

  // Calculate top links
  const linkCounts = analytics?.reduce((acc: Record<string, { count: number; title: string }>, click: any) => {
    const key = click.brand_link_id;
    if (!acc[key]) acc[key] = { count: 0, title: click.link_title };
    acc[key].count++;
    return acc;
  }, {}) || {};

  const topLinks = Object.entries(linkCounts)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Calculate device breakdown
  const deviceBreakdown = analytics?.reduce((acc: { mobile: number; desktop: number }, click: any) => {
    const isMobile = click.user_agent?.toLowerCase().includes('mobile') || 
                     click.user_agent?.toLowerCase().includes('android') ||
                     click.user_agent?.toLowerCase().includes('iphone');
    if (isMobile) acc.mobile++;
    else acc.desktop++;
    return acc;
  }, { mobile: 0, desktop: 0 }) || { mobile: 0, desktop: 0 };

  // Calculate traffic sources from UTM (the only reliable source)
  const trafficSources = analytics?.reduce((acc: Record<string, number>, click: any) => {
    const source = click.utm_source ? click.utm_source.toLowerCase() : 'direct';
    const displaySource = source === 'direct' ? 'Direct' : 
                          source.charAt(0).toUpperCase() + source.slice(1);
    acc[displaySource] = (acc[displaySource] || 0) + 1;
    return acc;
  }, {}) || {};

  const topSources = Object.entries(trafficSources)
    .map(([source, count]) => ({ source, count: count as number }))
    .sort((a, b) => b.count - a.count);

  // Calculate 7-day chart data
  const chartData = useMemo(() => {
    const days: { date: string; clicks: number; label: string }[] = [];
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      const clicksOnDay = analytics?.filter((click: any) => {
        const clickDate = new Date(click.clicked_at).toISOString().split('T')[0];
        return clickDate === dateStr;
      }).length || 0;
      
      days.push({ date: dateStr, clicks: clicksOnDay, label: dayLabel });
    }
    
    return days;
  }, [analytics]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const totalDeviceClicks = deviceBreakdown.mobile + deviceBreakdown.desktop;

  return (
    <div 
      className="min-h-screen py-8 px-4"
      style={{ 
        background: brand ? `linear-gradient(135deg, ${brand.color}15 0%, ${brand.color_secondary || brand.color}10 100%)` : undefined 
      }}
    >
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/biopage')}
            className="bg-background/80"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {brand?.name || 'Loading...'} Analytics
            </h1>
            <p className="text-muted-foreground text-sm">Link clicks & engagement</p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Skeleton className="h-24 rounded-xl" />
              <Skeleton className="h-24 rounded-xl" />
              <Skeleton className="h-24 rounded-xl" />
              <Skeleton className="h-24 rounded-xl" />
            </div>
            <Skeleton className="h-48 rounded-xl" />
          </div>
        ) : (
          <>
            {/* Stats Cards - 4 columns */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card className="p-4 bg-background/95 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${brand?.color}20` }}
                  >
                    <MousePointerClick className="w-5 h-5" style={{ color: brand?.color }} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Clicks</p>
                    <p className="text-2xl font-bold">{stats?.total_clicks || 0}</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4 bg-background/95 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${brand?.color}20` }}
                  >
                    <Link2 className="w-5 h-5" style={{ color: brand?.color }} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Active Links</p>
                    <p className="text-2xl font-bold">{stats?.total_links || 0}</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4 bg-background/95 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${brand?.color_secondary || brand?.color}20` }}
                  >
                    <Target className="w-5 h-5" style={{ color: brand?.color_secondary || brand?.color }} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Free Trial CTAs</p>
                    <p className="text-2xl font-bold">{ctaClicks || 0}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-background/95 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Smartphone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-lg font-bold">{deviceBreakdown.mobile}</span>
                  </div>
                  <span className="text-muted-foreground">/</span>
                  <div className="flex items-center gap-1">
                    <Monitor className="w-4 h-4 text-muted-foreground" />
                    <span className="text-lg font-bold">{deviceBreakdown.desktop}</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Mobile / Desktop</p>
              </Card>
            </div>

            {/* 7-Day Chart */}
            <Card className="p-4 bg-background/95 backdrop-blur-sm mb-6">
              <h3 className="font-semibold text-sm mb-3">Last 7 Days</h3>
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis 
                      dataKey="label" 
                      axisLine={false} 
                      tickLine={false}
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false}
                      tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                      allowDecimals={false}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                      formatter={(value: number) => [`${value} clicks`, 'Clicks']}
                    />
                    <Bar 
                      dataKey="clicks" 
                      fill={brand?.color || 'hsl(var(--primary))'} 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Two columns: Link Clicks & Traffic Sources */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Top Links */}
              <Card className="p-4 bg-background/95 backdrop-blur-sm">
                <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <Link2 className="w-4 h-4" style={{ color: brand?.color }} />
                  Link Clicks
                </h3>
                {topLinks.length > 0 ? (
                  <div className="space-y-2">
                    {topLinks.map((link, i) => (
                      <div key={link.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2">
                          <span 
                            className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
                            style={{ backgroundColor: brand?.color }}
                          >
                            {i + 1}
                          </span>
                          <span className="font-medium text-sm truncate max-w-[180px]">{link.title}</span>
                        </div>
                        <span className="text-muted-foreground text-sm font-medium">{link.count}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-6 text-sm">No clicks yet</p>
                )}
              </Card>

              {/* Traffic Sources (UTM-based only) */}
              <Card className="p-4 bg-background/95 backdrop-blur-sm">
                <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <MousePointerClick className="w-4 h-4" style={{ color: brand?.color }} />
                  Traffic Sources
                </h3>
                {topSources.length > 0 ? (
                  <div className="space-y-2">
                    {topSources.map((src) => (
                      <div key={src.source} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">
                            {src.source === 'Instagram' ? '📸' : 
                             src.source === 'Facebook' ? '📘' : 
                             src.source === 'Email' ? '📧' : 
                             src.source === 'Messenger' ? '💬' : 
                             src.source === 'Direct' ? '🔗' : '🏷️'}
                          </span>
                          <span className="font-medium text-sm">{src.source}</span>
                        </div>
                        <span className="text-muted-foreground text-sm font-medium">{src.count}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-6 text-sm">No traffic data yet</p>
                )}
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="p-4 bg-background/95 backdrop-blur-sm">
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" style={{ color: brand?.color }} />
                Recent Activity
              </h3>
              {analytics && analytics.length > 0 ? (
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {analytics.slice(0, 15).map((click: any) => (
                    <div 
                      key={click.id} 
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <MousePointerClick className="w-3 h-3 text-muted-foreground" />
                        <span className="text-sm">{click.link_title}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(click.clicked_at)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-6 text-sm">
                  No clicks yet. Share your gym's bio link to start tracking!
                </p>
              )}
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminAnalytics;
