import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const [selectedGym, setSelectedGym] = useState<string>("");
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

  const generateUrl = (handle: string, source: string, medium: string, campaign: string) => {
    const params = new URLSearchParams();
    if (source) params.set('utm_source', source);
    if (medium) params.set('utm_medium', medium);
    if (campaign) params.set('utm_campaign', campaign);
    const queryString = params.toString();
    return `${baseUrl}/biopage/${handle}${queryString ? `?${queryString}` : ''}`;
  };

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Link copied!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const selectedBrand = brands?.find(b => b.id === selectedGym);

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

        {/* Gym Selector */}
        <Card className="p-6 mb-6">
          <Label className="text-base font-semibold mb-3 block">Select Gym</Label>
          <Select value={selectedGym} onValueChange={setSelectedGym}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose a gym..." />
            </SelectTrigger>
            <SelectContent>
              {brands?.map((brand) => (
                <SelectItem key={brand.id} value={brand.id}>
                  {brand.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Card>

        {selectedBrand && (
          <>
            {/* Preset Channel Links */}
            <Card className="p-6 mb-6">
              <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Link2 className="w-5 h-5 text-primary" />
                Quick Links by Channel
              </h2>
              <div className="space-y-3">
                {PRESET_CHANNELS.map((channel) => {
                  const url = generateUrl(selectedBrand.handle, channel.source, channel.medium, channel.campaign);
                  const Icon = channel.icon;
                  return (
                    <div 
                      key={channel.id}
                      className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{channel.label}</p>
                        <p className="text-sm text-muted-foreground truncate">{url}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(url, channel.id)}
                        className="flex-shrink-0"
                      >
                        {copiedId === channel.id ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>
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
                <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-muted-foreground truncate">
                      {generateUrl(selectedBrand.handle, customSource, customMedium, customCampaign)}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(
                      generateUrl(selectedBrand.handle, customSource, customMedium, customCampaign),
                      'custom'
                    )}
                  >
                    {copiedId === 'custom' ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
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
