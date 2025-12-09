import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, MousePointerClick, TrendingUp, Link2, Calendar, Globe, Smartphone, Tag } from "lucide-react";

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
      
      // Get analytics for these links
      const { data: clickData, error: clickError } = await supabase
        .from('link_analytics')
        .select('*')
        .in('brand_link_id', linkIds)
        .order('clicked_at', { ascending: false })
        .limit(100);
      
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

  // Calculate traffic sources from referrer
  const trafficSources = analytics?.reduce((acc: Record<string, number>, click: any) => {
    let source = 'Direct';
    const ref = click.referrer?.toLowerCase() || '';
    
    if (ref.includes('instagram')) source = 'Instagram';
    else if (ref.includes('facebook') || ref.includes('fb.com')) source = 'Facebook';
    else if (ref.includes('google')) source = 'Google';
    else if (ref.includes('tiktok')) source = 'TikTok';
    else if (ref.includes('twitter') || ref.includes('x.com')) source = 'X/Twitter';
    else if (ref.includes('linktr.ee')) source = 'Linktree';
    else if (ref && ref !== '') source = 'Other';
    
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {}) || {};

  const topSources = Object.entries(trafficSources)
    .map(([source, count]) => ({ source, count: count as number }))
    .sort((a, b) => b.count - a.count);

  // Calculate UTM campaign sources
  const campaignSources = analytics?.reduce((acc: Record<string, number>, click: any) => {
    const source = click.utm_source || 'No UTM';
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {}) || {};

  const topCampaigns = Object.entries(campaignSources)
    .map(([source, count]) => ({ source, count: count as number }))
    .sort((a, b) => b.count - a.count);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div 
      className="min-h-screen py-8 px-4"
      style={{ 
        background: brand ? `linear-gradient(135deg, ${brand.color}15 0%, ${brand.color_secondary || brand.color}10 100%)` : undefined 
      }}
    >
      <div className="container mx-auto max-w-6xl">
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
            <p className="text-muted-foreground">Track clicks and engagement</p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Skeleton className="h-32 rounded-xl" />
              <Skeleton className="h-32 rounded-xl" />
              <Skeleton className="h-32 rounded-xl" />
            </div>
            <Skeleton className="h-64 rounded-xl" />
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card className="p-6 bg-background/95 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${brand?.color}20` }}
                  >
                    <MousePointerClick className="w-6 h-6" style={{ color: brand?.color }} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Clicks</p>
                    <p className="text-3xl font-bold">{stats?.total_clicks || 0}</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6 bg-background/95 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${brand?.color}20` }}
                  >
                    <Link2 className="w-6 h-6" style={{ color: brand?.color }} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active Links</p>
                    <p className="text-3xl font-bold">{stats?.total_links || 0}</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6 bg-background/95 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${brand?.color}20` }}
                  >
                    <TrendingUp className="w-6 h-6" style={{ color: brand?.color }} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Conversion Rate</p>
                    <p className="text-3xl font-bold">{stats?.conversion_rate || 0}%</p>
                  </div>
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
              {/* Top Links */}
              <Card className="p-6 bg-background/95 backdrop-blur-sm">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Link2 className="w-5 h-5" style={{ color: brand?.color }} />
                  Top Performing Links
                </h3>
                {topLinks.length > 0 ? (
                  <div className="space-y-3">
                    {topLinks.map((link, i) => (
                      <div key={link.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3">
                          <span 
                            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                            style={{ backgroundColor: brand?.color }}
                          >
                            {i + 1}
                          </span>
                          <span className="font-medium text-sm">{link.title}</span>
                        </div>
                        <span className="text-muted-foreground text-sm">{link.count}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No click data yet</p>
                )}
              </Card>

              {/* Traffic Sources */}
              <Card className="p-6 bg-background/95 backdrop-blur-sm">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5" style={{ color: brand?.color }} />
                  Traffic Sources
                </h3>
                {topSources.length > 0 ? (
                  <div className="space-y-3">
                    {topSources.map((src, i) => (
                      <div key={src.source} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3">
                          <span 
                            className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
                            style={{ backgroundColor: `${brand?.color}20`, color: brand?.color }}
                          >
                            {src.source === 'Instagram' ? '📸' : 
                             src.source === 'Facebook' ? '📘' : 
                             src.source === 'Direct' ? '🔗' : 
                             src.source === 'Google' ? '🔍' : 
                             src.source === 'TikTok' ? '🎵' : '🌐'}
                          </span>
                          <span className="font-medium text-sm">{src.source}</span>
                        </div>
                        <span className="text-muted-foreground text-sm">{src.count}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No source data yet</p>
                )}
              </Card>

              {/* Campaign Sources (UTM) */}
              <Card className="p-6 bg-background/95 backdrop-blur-sm">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Tag className="w-5 h-5" style={{ color: brand?.color }} />
                  Campaign Sources
                </h3>
                {topCampaigns.length > 0 ? (
                  <div className="space-y-3">
                    {topCampaigns.map((src) => (
                      <div key={src.source} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3">
                          <span 
                            className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
                            style={{ backgroundColor: `${brand?.color}20`, color: brand?.color }}
                          >
                            {src.source === 'instagram' ? '📸' : 
                             src.source === 'facebook' ? '📘' : 
                             src.source === 'email' ? '📧' : 
                             src.source === 'messenger' ? '💬' : 
                             src.source === 'No UTM' ? '❓' : '🏷️'}
                          </span>
                          <span className="font-medium text-sm capitalize">{src.source}</span>
                        </div>
                        <span className="text-muted-foreground text-sm">{src.count}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No campaign data yet</p>
                )}
              </Card>

              {/* Device Breakdown */}
              <Card className="p-6 bg-background/95 backdrop-blur-sm">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Smartphone className="w-5 h-5" style={{ color: brand?.color }} />
                  Device Breakdown
                </h3>
                {(deviceBreakdown.mobile + deviceBreakdown.desktop) > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-muted-foreground" />
                        <span>Mobile</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 rounded-full bg-muted overflow-hidden">
                          <div 
                            className="h-full rounded-full"
                            style={{ 
                              width: `${(deviceBreakdown.mobile / (deviceBreakdown.mobile + deviceBreakdown.desktop)) * 100}%`,
                              backgroundColor: brand?.color 
                            }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-8 text-right">
                          {deviceBreakdown.mobile}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-muted-foreground" />
                        <span>Desktop</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 rounded-full bg-muted overflow-hidden">
                          <div 
                            className="h-full rounded-full"
                            style={{ 
                              width: `${(deviceBreakdown.desktop / (deviceBreakdown.mobile + deviceBreakdown.desktop)) * 100}%`,
                              backgroundColor: brand?.color_secondary || brand?.color 
                            }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-8 text-right">
                          {deviceBreakdown.desktop}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No click data yet</p>
                )}
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="p-6 bg-background/95 backdrop-blur-sm mt-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" style={{ color: brand?.color }} />
                Recent Activity
              </h3>
              {analytics && analytics.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {analytics.slice(0, 20).map((click: any) => (
                    <div 
                      key={click.id} 
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <MousePointerClick className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{click.link_title}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(click.clicked_at)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No clicks recorded yet. Share your gym's bio link to start tracking!
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
