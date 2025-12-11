import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Copy, Check, Link2, Instagram, Facebook, Mail, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const PRESET_CHANNELS = [
  { id: 'instagram', label: 'Instagram Bio', icon: Instagram, source: 'instagram', medium: 'social', campaign: 'bio_link' },
  { id: 'facebook', label: 'Facebook Page', icon: Facebook, source: 'facebook', medium: 'social', campaign: 'page_link' },
  { id: 'email', label: 'Email Signature', icon: Mail, source: 'email', medium: 'email', campaign: 'signature' },
  { id: 'messenger', label: 'Messenger', icon: MessageCircle, source: 'messenger', medium: 'social', campaign: 'dm_link' },
];

const AdminLinkGenerator = () => {
  const navigate = useNavigate();
  const [selectedGyms, setSelectedGyms] = useState<string[]>([]);
  const [customSource, setCustomSource] = useState("");
  const [customMedium, setCustomMedium] = useState("");
  const [customCampaign, setCustomCampaign] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { data: brands } = useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('brands')
        .select('id, name, handle')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  const baseUrl = window.location.origin;
  const ogFunctionUrl = 'https://qfffsgiopzpwcijdkvcv.supabase.co/functions/v1/og-image';

  // Generate OG-friendly URL that shows gym branding in link previews
  const generateUrl = (handle: string, source: string, medium: string, campaign: string) => {
    const redirectParams = new URLSearchParams();
    if (source) redirectParams.set('utm_source', source);
    if (medium) redirectParams.set('utm_medium', medium);
    if (campaign) redirectParams.set('utm_campaign', campaign);
    const redirectQueryString = redirectParams.toString();
    const redirectUrl = `${baseUrl}/biopage/${handle}${redirectQueryString ? `?${redirectQueryString}` : ''}`;
    
    // Use edge function URL for proper OG tags, with redirect to actual page
    const ogParams = new URLSearchParams();
    ogParams.set('handle', handle);
    ogParams.set('redirect', redirectUrl);
    return `${ogFunctionUrl}?${ogParams.toString()}`;
  };

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Link copied!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const copyAllLinks = async (channel: typeof PRESET_CHANNELS[0]) => {
    const links = selectedBrands.map(brand => 
      `${brand.name}: ${generateUrl(brand.handle, channel.source, channel.medium, channel.campaign)}`
    ).join('\n\n');
    await navigator.clipboard.writeText(links);
    setCopiedId(`all-${channel.id}`);
    toast.success(`All ${channel.label} links copied!`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked && brands) {
      setSelectedGyms(brands.map(b => b.id));
    } else {
      setSelectedGyms([]);
    }
  };

  const handleGymToggle = (gymId: string, checked: boolean) => {
    if (checked) {
      setSelectedGyms(prev => [...prev, gymId]);
    } else {
      setSelectedGyms(prev => prev.filter(id => id !== gymId));
    }
  };

  const selectedBrands = brands?.filter(b => selectedGyms.includes(b.id)) || [];
  const allSelected = brands && brands.length > 0 && selectedGyms.length === brands.length;

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Link Generator</h1>
            <p className="text-muted-foreground">Generate trackable links for each channel</p>
          </div>
        </div>

        {/* Gym Selector with Checkboxes */}
        <Card className="p-6 mb-6">
          <Label className="text-base font-semibold mb-4 block">Select Gyms</Label>
          
          {/* Select All */}
          <div className="flex items-center gap-3 pb-3 mb-3 border-b border-border">
            <Checkbox 
              id="select-all"
              checked={allSelected}
              onCheckedChange={handleSelectAll}
            />
            <label 
              htmlFor="select-all" 
              className="text-sm font-medium cursor-pointer"
            >
              Select All Gyms
            </label>
            <span className="text-xs text-muted-foreground ml-auto">
              {selectedGyms.length} of {brands?.length || 0} selected
            </span>
          </div>

          {/* Individual Gyms */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {brands?.map((brand) => (
              <div key={brand.id} className="flex items-center gap-3 p-2 rounded hover:bg-muted/50">
                <Checkbox 
                  id={brand.id}
                  checked={selectedGyms.includes(brand.id)}
                  onCheckedChange={(checked) => handleGymToggle(brand.id, checked as boolean)}
                />
                <label 
                  htmlFor={brand.id} 
                  className="text-sm cursor-pointer flex-1"
                >
                  {brand.name}
                </label>
              </div>
            ))}
          </div>
        </Card>

        {selectedBrands.length > 0 && (
          <>
            {/* Preset Channel Links */}
            <Card className="p-6 mb-6">
              <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Link2 className="w-5 h-5 text-primary" />
                Quick Links by Channel
              </h2>
              
              {PRESET_CHANNELS.map((channel) => {
                const Icon = channel.icon;
                return (
                  <div key={channel.id} className="mb-6 last:mb-0">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Icon className="w-4 h-4 text-primary" />
                        </div>
                        <span className="font-medium">{channel.label}</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyAllLinks(channel)}
                      >
                        {copiedId === `all-${channel.id}` ? (
                          <><Check className="h-4 w-4 text-green-500 mr-1" /> Copied!</>
                        ) : (
                          <><Copy className="h-4 w-4 mr-1" /> Copy All</>
                        )}
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {selectedBrands.map((brand) => {
                        const url = generateUrl(brand.handle, channel.source, channel.medium, channel.campaign);
                        const copyId = `${channel.id}-${brand.id}`;
                        return (
                          <div 
                            key={brand.id}
                            className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium">{brand.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{url}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(url, copyId)}
                              className="flex-shrink-0"
                            >
                              {copiedId === copyId ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </Card>

            {/* Custom Link Generator */}
            <Card className="p-6">
              <h2 className="font-semibold text-lg mb-4">Custom Campaign Link</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <Label htmlFor="source" className="text-sm">Source</Label>
                  <Input
                    id="source"
                    placeholder="e.g., newsletter"
                    value={customSource}
                    onChange={(e) => setCustomSource(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="medium" className="text-sm">Medium</Label>
                  <Input
                    id="medium"
                    placeholder="e.g., email"
                    value={customMedium}
                    onChange={(e) => setCustomMedium(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="campaign" className="text-sm">Campaign</Label>
                  <Input
                    id="campaign"
                    placeholder="e.g., holiday_promo"
                    value={customCampaign}
                    onChange={(e) => setCustomCampaign(e.target.value)}
                  />
                </div>
              </div>
              
              {(customSource || customMedium || customCampaign) && (
                <div className="space-y-2">
                  {selectedBrands.map((brand) => {
                    const url = generateUrl(brand.handle, customSource, customMedium, customCampaign);
                    const copyId = `custom-${brand.id}`;
                    return (
                      <div 
                        key={brand.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{brand.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{url}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(url, copyId)}
                        >
                          {copiedId === copyId ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminLinkGenerator;
