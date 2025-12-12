import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Copy, Check, Plus, Trash2, Instagram, Facebook, Mail, MessageCircle, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useCampaigns, useCreateCampaign, useDeleteCampaign, generateShareableUrl } from "@/hooks/useCampaigns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ICON_OPTIONS = [
  { value: 'instagram', label: 'Instagram', icon: Instagram },
  { value: 'facebook', label: 'Facebook', icon: Facebook },
  { value: 'mail', label: 'Email', icon: Mail },
  { value: 'message-circle', label: 'Messenger', icon: MessageCircle },
  { value: 'globe', label: 'Website', icon: Globe },
];

const AdminLinkGenerator = () => {
  const navigate = useNavigate();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    source: '',
    medium: '',
    campaign: '',
    icon: 'globe',
    short_code: '',
  });
  const [expandedCampaign, setExpandedCampaign] = useState<string | null>(null);

  const { data: campaigns, isLoading: campaignsLoading } = useCampaigns();
  const createCampaign = useCreateCampaign();
  const deleteCampaign = useDeleteCampaign();

  const { data: brands } = useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('brands')
        .select('id, name, handle, short_code')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  const getIconComponent = (iconName: string | null) => {
    const found = ICON_OPTIONS.find(o => o.value === iconName);
    return found ? found.icon : Globe;
  };

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Link copied!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const copyAllLinks = async (campaign: typeof campaigns extends (infer T)[] | undefined ? T : never) => {
    if (!brands || !campaign.short_code) return;
    const links = brands
      .filter(brand => brand.short_code)
      .map(brand => 
        `${brand.name}: ${generateShareableUrl(brand.short_code!, campaign.short_code!)}`
      ).join('\n\n');
    await navigator.clipboard.writeText(links);
    setCopiedId(`all-${campaign.id}`);
    toast.success("All links copied!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddCampaign = async () => {
    if (!newCampaign.name || !newCampaign.source) {
      toast.error("Name and source are required");
      return;
    }
    await createCampaign.mutateAsync(newCampaign);
    setNewCampaign({ name: '', source: '', medium: '', campaign: '', icon: 'globe', short_code: '' });
    setIsAddOpen(false);
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/biopage/admin/dashboard-settings')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Campaign Manager</h1>
              <p className="text-muted-foreground">Create and manage shareable links</p>
            </div>
          </div>
          
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Campaign
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Campaign</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label>Campaign Name</Label>
                  <Input 
                    placeholder="e.g., Holiday Email Blast"
                    value={newCampaign.name}
                    onChange={(e) => setNewCampaign(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Icon</Label>
                  <Select 
                    value={newCampaign.icon} 
                    onValueChange={(v) => setNewCampaign(prev => ({ ...prev, icon: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ICON_OPTIONS.map(opt => {
                        const Icon = opt.icon;
                        return (
                          <SelectItem key={opt.value} value={opt.value}>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              {opt.label}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Source</Label>
                    <Input 
                      placeholder="instagram"
                      value={newCampaign.source}
                      onChange={(e) => setNewCampaign(prev => ({ ...prev, source: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Short Code</Label>
                    <Input 
                      placeholder="ig"
                      value={newCampaign.short_code}
                      onChange={(e) => setNewCampaign(prev => ({ ...prev, short_code: e.target.value.toLowerCase() }))}
                    />
                    <p className="text-xs text-muted-foreground mt-1">Used in short URLs</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Medium</Label>
                    <Input 
                      placeholder="social"
                      value={newCampaign.medium}
                      onChange={(e) => setNewCampaign(prev => ({ ...prev, medium: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Campaign</Label>
                    <Input 
                      placeholder="bio_link"
                      value={newCampaign.campaign}
                      onChange={(e) => setNewCampaign(prev => ({ ...prev, campaign: e.target.value }))}
                    />
                  </div>
                </div>
                <Button 
                  className="w-full" 
                  onClick={handleAddCampaign}
                  disabled={createCampaign.isPending}
                >
                  {createCampaign.isPending ? "Creating..." : "Create Campaign"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Campaigns List */}
        {campaignsLoading ? (
          <Card className="p-8 text-center text-muted-foreground">Loading campaigns...</Card>
        ) : campaigns?.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            No campaigns yet. Click "Add Campaign" to create one.
          </Card>
        ) : (
          <div className="space-y-4">
            {campaigns?.map((campaign) => {
              const Icon = getIconComponent(campaign.icon);
              const isExpanded = expandedCampaign === campaign.id;
              
              return (
                <Card key={campaign.id} className="overflow-hidden">
                  <div 
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => setExpandedCampaign(isExpanded ? null : campaign.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">{campaign.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {campaign.source} / {campaign.medium} / {campaign.campaign}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyAllLinks(campaign);
                        }}
                      >
                        {copiedId === `all-${campaign.id}` ? (
                          <><Check className="h-4 w-4 text-green-500 mr-1" /> Copied</>
                        ) : (
                          <><Copy className="h-4 w-4 mr-1" /> Copy All</>
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete "${campaign.name}"?`)) {
                            deleteCampaign.mutate(campaign.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  
                  {isExpanded && brands && (
                    <div className="border-t border-border bg-muted/30 p-4 space-y-2">
                      {brands.filter(b => b.short_code).map((brand) => {
                        const url = brand.short_code && campaign.short_code 
                          ? generateShareableUrl(brand.short_code, campaign.short_code)
                          : `Missing short code`;
                        const copyId = `${campaign.id}-${brand.id}`;
                        return (
                          <div 
                            key={brand.id}
                            className="flex items-center gap-3 p-3 rounded-lg bg-background hover:bg-muted/50 transition-colors"
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
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLinkGenerator;
