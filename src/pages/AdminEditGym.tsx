import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Save, Loader2, ExternalLink, Trash2, Plus } from 'lucide-react';
import { z } from 'zod';

const brandSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  tagline: z.string().max(200).optional().nullable(),
  description: z.string().max(500).optional().nullable(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color"),
  color_secondary: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color").optional().nullable(),
  color_tertiary: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color").optional().nullable(),
  logo_url: z.string().url("Invalid URL").optional().nullable().or(z.literal('')),
  primary_cta_text: z.string().max(50).optional().nullable(),
  primary_cta_url: z.string().url("Invalid URL").optional().nullable().or(z.literal('')),
  phone: z.string().max(20).optional().nullable(),
  email: z.string().email("Invalid email").optional().nullable().or(z.literal('')),
  address: z.string().max(200).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  state: z.string().max(50).optional().nullable(),
  website_url: z.string().url("Invalid URL").optional().nullable().or(z.literal('')),
  instagram_url: z.string().url("Invalid URL").optional().nullable().or(z.literal('')),
  facebook_url: z.string().url("Invalid URL").optional().nullable().or(z.literal('')),
  directions_url: z.string().url("Invalid URL").optional().nullable().or(z.literal('')),
  parent_portal_url: z.string().url("Invalid URL").optional().nullable().or(z.literal('')),
});

type Brand = z.infer<typeof brandSchema> & { id: string; handle: string };

interface BrandLink {
  id: string;
  title: string;
  url: string;
  icon: string | null;
  is_featured: boolean;
  display_order: number;
  category_id: string;
}

export default function AdminEditGym() {
  const { handle } = useParams<{ handle: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [brand, setBrand] = useState<Brand | null>(null);
  const [links, setLinks] = useState<BrandLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (handle) {
      fetchBrand();
    }
  }, [handle]);

  const fetchBrand = async () => {
    setLoading(true);
    try {
      const { data: brandData, error: brandError } = await supabase
        .from('brands')
        .select('*')
        .eq('handle', handle)
        .maybeSingle();

      if (brandError) throw brandError;
      if (!brandData) {
        toast({ title: 'Gym not found', variant: 'destructive' });
        navigate('/');
        return;
      }

      setBrand(brandData);

      const { data: linksData, error: linksError } = await supabase
        .from('brand_links')
        .select('*')
        .eq('brand_id', brandData.id)
        .order('display_order');

      if (linksError) throw linksError;
      setLinks(linksData || []);
    } catch (error: any) {
      toast({ title: 'Error loading gym', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleBrandChange = (field: keyof Brand, value: string) => {
    if (brand) {
      setBrand({ ...brand, [field]: value || null });
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handleLinkChange = (linkId: string, field: keyof BrandLink, value: string | boolean | number) => {
    setLinks(links.map(link => 
      link.id === linkId ? { ...link, [field]: value } : link
    ));
  };

  const saveBrand = async () => {
    if (!brand) return;
    
    // Validate
    const result = brandSchema.safeParse(brand);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      toast({ title: 'Validation error', description: 'Please fix the errors below', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('brands')
        .update({
          name: brand.name,
          tagline: brand.tagline,
          description: brand.description,
          color: brand.color,
          color_secondary: brand.color_secondary,
          color_tertiary: brand.color_tertiary,
          logo_url: brand.logo_url || null,
          primary_cta_text: brand.primary_cta_text,
          primary_cta_url: brand.primary_cta_url || null,
          phone: brand.phone,
          email: brand.email || null,
          address: brand.address,
          city: brand.city,
          state: brand.state,
          website_url: brand.website_url || null,
          instagram_url: brand.instagram_url || null,
          facebook_url: brand.facebook_url || null,
          directions_url: brand.directions_url || null,
          parent_portal_url: brand.parent_portal_url || null,
        })
        .eq('id', brand.id);

      if (error) throw error;
      toast({ title: 'Gym details saved!' });
    } catch (error: any) {
      toast({ title: 'Error saving', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const saveLinks = async () => {
    setSaving(true);
    try {
      for (const link of links) {
        const { error } = await supabase
          .from('brand_links')
          .update({
            title: link.title,
            url: link.url,
            icon: link.icon,
            is_featured: link.is_featured,
            display_order: link.display_order,
          })
          .eq('id', link.id);

        if (error) throw error;
      }
      toast({ title: 'Links saved!' });
    } catch (error: any) {
      toast({ title: 'Error saving links', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const deleteLink = async (linkId: string) => {
    if (!confirm('Delete this link?')) return;
    
    try {
      const { error } = await supabase
        .from('brand_links')
        .delete()
        .eq('id', linkId);

      if (error) throw error;
      setLinks(links.filter(l => l.id !== linkId));
      toast({ title: 'Link deleted' });
    } catch (error: any) {
      toast({ title: 'Error deleting link', description: error.message, variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#d6c5bf] via-[#e6e6e6] to-[#c3a5a5]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!brand) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#d6c5bf] via-[#e6e6e6] to-[#c3a5a5] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Edit: {brand.name}</h1>
              <p className="text-muted-foreground">/{brand.handle}</p>
            </div>
          </div>
          <Link to={`/${brand.handle}`} target="_blank">
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4 mr-2" />
              View Page
            </Button>
          </Link>
        </div>

        <Tabs defaultValue="details" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="branding">Branding</TabsTrigger>
            <TabsTrigger value="links">Links ({links.length})</TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>Gym Details</CardTitle>
                <CardDescription>Basic information and contact details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Gym Name *</Label>
                    <Input
                      id="name"
                      value={brand.name}
                      onChange={(e) => handleBrandChange('name', e.target.value)}
                      className={errors.name ? 'border-destructive' : ''}
                    />
                    {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <Label htmlFor="tagline">Tagline</Label>
                    <Input
                      id="tagline"
                      value={brand.tagline || ''}
                      onChange={(e) => handleBrandChange('tagline', e.target.value)}
                      placeholder="Your inspiring tagline"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={brand.description || ''}
                    onChange={(e) => handleBrandChange('description', e.target.value)}
                    placeholder="Brief description of your gym"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={brand.phone || ''}
                      onChange={(e) => handleBrandChange('phone', e.target.value)}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={brand.email || ''}
                      onChange={(e) => handleBrandChange('email', e.target.value)}
                      placeholder="info@gym.com"
                      className={errors.email ? 'border-destructive' : ''}
                    />
                    {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={brand.address || ''}
                    onChange={(e) => handleBrandChange('address', e.target.value)}
                    placeholder="123 Main Street"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={brand.city || ''}
                      onChange={(e) => handleBrandChange('city', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={brand.state || ''}
                      onChange={(e) => handleBrandChange('state', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="primary_cta_text">CTA Button Text</Label>
                    <Input
                      id="primary_cta_text"
                      value={brand.primary_cta_text || ''}
                      onChange={(e) => handleBrandChange('primary_cta_text', e.target.value)}
                      placeholder="Book Your Free Trial"
                    />
                  </div>
                  <div>
                    <Label htmlFor="primary_cta_url">CTA Button URL</Label>
                    <Input
                      id="primary_cta_url"
                      value={brand.primary_cta_url || ''}
                      onChange={(e) => handleBrandChange('primary_cta_url', e.target.value)}
                      placeholder="https://..."
                      className={errors.primary_cta_url ? 'border-destructive' : ''}
                    />
                  </div>
                </div>

                <Button onClick={saveBrand} disabled={saving} className="w-full">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  Save Details
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Branding Tab */}
          <TabsContent value="branding">
            <Card>
              <CardHeader>
                <CardTitle>Branding & Social</CardTitle>
                <CardDescription>Colors, logo, and social media links</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="color">Primary Color *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="color"
                        value={brand.color}
                        onChange={(e) => handleBrandChange('color', e.target.value)}
                        placeholder="#000000"
                        className={errors.color ? 'border-destructive' : ''}
                      />
                      <input
                        type="color"
                        value={brand.color}
                        onChange={(e) => handleBrandChange('color', e.target.value)}
                        className="w-12 h-10 rounded cursor-pointer"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="color_secondary">Secondary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="color_secondary"
                        value={brand.color_secondary || ''}
                        onChange={(e) => handleBrandChange('color_secondary', e.target.value)}
                        placeholder="#000000"
                      />
                      <input
                        type="color"
                        value={brand.color_secondary || '#000000'}
                        onChange={(e) => handleBrandChange('color_secondary', e.target.value)}
                        className="w-12 h-10 rounded cursor-pointer"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="color_tertiary">Tertiary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="color_tertiary"
                        value={brand.color_tertiary || ''}
                        onChange={(e) => handleBrandChange('color_tertiary', e.target.value)}
                        placeholder="#000000"
                      />
                      <input
                        type="color"
                        value={brand.color_tertiary || '#000000'}
                        onChange={(e) => handleBrandChange('color_tertiary', e.target.value)}
                        className="w-12 h-10 rounded cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="logo_url">Logo URL</Label>
                  <Input
                    id="logo_url"
                    value={brand.logo_url || ''}
                    onChange={(e) => handleBrandChange('logo_url', e.target.value)}
                    placeholder="https://..."
                    className={errors.logo_url ? 'border-destructive' : ''}
                  />
                  {brand.logo_url && (
                    <img src={brand.logo_url} alt="Logo preview" className="mt-2 h-16 object-contain" />
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="website_url">Website URL</Label>
                    <Input
                      id="website_url"
                      value={brand.website_url || ''}
                      onChange={(e) => handleBrandChange('website_url', e.target.value)}
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="directions_url">Directions URL (Google Maps)</Label>
                    <Input
                      id="directions_url"
                      value={brand.directions_url || ''}
                      onChange={(e) => handleBrandChange('directions_url', e.target.value)}
                      placeholder="https://maps.google.com/..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="instagram_url">Instagram URL</Label>
                    <Input
                      id="instagram_url"
                      value={brand.instagram_url || ''}
                      onChange={(e) => handleBrandChange('instagram_url', e.target.value)}
                      placeholder="https://instagram.com/..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="facebook_url">Facebook URL</Label>
                    <Input
                      id="facebook_url"
                      value={brand.facebook_url || ''}
                      onChange={(e) => handleBrandChange('facebook_url', e.target.value)}
                      placeholder="https://facebook.com/..."
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="parent_portal_url">Parent Portal URL</Label>
                  <Input
                    id="parent_portal_url"
                    value={brand.parent_portal_url || ''}
                    onChange={(e) => handleBrandChange('parent_portal_url', e.target.value)}
                    placeholder="https://portal.iclasspro.com/..."
                  />
                </div>

                <Button onClick={saveBrand} disabled={saving} className="w-full">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  Save Branding
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Links Tab */}
          <TabsContent value="links">
            <Card>
              <CardHeader>
                <CardTitle>Manage Links</CardTitle>
                <CardDescription>Edit the links displayed on the gym page</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {links.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No links yet</p>
                ) : (
                  <div className="space-y-4">
                    {links.map((link, index) => (
                      <div key={link.id} className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                        <div className="flex-1 space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                              <Label className="text-xs">Title</Label>
                              <Input
                                value={link.title}
                                onChange={(e) => handleLinkChange(link.id, 'title', e.target.value)}
                                placeholder="Link Title"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <Label className="text-xs">URL</Label>
                              <Input
                                value={link.url}
                                onChange={(e) => handleLinkChange(link.id, 'url', e.target.value)}
                                placeholder="https://..."
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div>
                              <Label className="text-xs">Icon (emoji)</Label>
                              <Input
                                value={link.icon || ''}
                                onChange={(e) => handleLinkChange(link.id, 'icon', e.target.value)}
                                placeholder="📚"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Order</Label>
                              <Input
                                type="number"
                                value={link.display_order}
                                onChange={(e) => handleLinkChange(link.id, 'display_order', parseInt(e.target.value) || 0)}
                              />
                            </div>
                            <div className="flex items-end">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={link.is_featured}
                                  onChange={(e) => handleLinkChange(link.id, 'is_featured', e.target.checked)}
                                  className="w-4 h-4"
                                />
                                <span className="text-sm">Featured</span>
                              </label>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteLink(link.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <Button onClick={saveLinks} disabled={saving} className="w-full">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  Save All Links
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
