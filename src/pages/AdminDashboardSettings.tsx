import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, Image, Loader2, RefreshCw, LinkIcon, Trash2, Key, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const AdminDashboardSettings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isClearing, setIsClearing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchCurrentImage();
  }, []);

  const fetchCurrentImage = async () => {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'dashboard_hero_image')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching setting:', error);
      }

      setCurrentImageUrl(data?.value || null);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please select a PNG, JPG, WebP, or GIF image.",
          variant: "destructive",
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image under 5MB.",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);

    try {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `dashboard-hero-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('dashboard-assets')
        .upload(fileName, selectedFile, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      const { data: urlData } = supabase.storage
        .from('dashboard-assets')
        .getPublicUrl(fileName);

      const publicUrl = urlData.publicUrl;

      const { error: updateError } = await supabase.functions.invoke('update-app-setting', {
        body: { key: 'dashboard_hero_image', value: publicUrl }
      });

      if (updateError) {
        throw new Error(`Failed to save setting: ${updateError.message}`);
      }

      setCurrentImageUrl(publicUrl);
      setSelectedFile(null);
      setPreviewUrl(null);

      toast({
        title: "Success!",
        description: "Dashboard hero image updated successfully.",
      });

    } catch (err: any) {
      console.error('Upload error:', err);
      toast({
        title: "Upload failed",
        description: err.message || "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRefreshStats = async () => {
    setIsRefreshing(true);
    queryClient.invalidateQueries({ queryKey: ["brands"] });
    queryClient.invalidateQueries({ queryKey: ["brand-top-sources"] });
    setTimeout(() => {
      setIsRefreshing(false);
      toast({
        title: "Stats refreshed",
        description: "Dashboard data has been updated.",
      });
    }, 1000);
  };

  const handleClearAllStats = async () => {
    setIsClearing(true);
    try {
      const { error } = await supabase.functions.invoke('clear-analytics');
      
      if (error) throw error;
      
      toast({
        title: 'Stats cleared',
        description: 'All analytics have been reset to zero.',
      });
      
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      queryClient.invalidateQueries({ queryKey: ["brand-top-sources"] });
    } catch (error: any) {
      toast({
        title: 'Error clearing stats',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#d6c5bf] via-[#e6e6e6] to-[#c3a5a5] p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/biopage')}
            className="bg-white/80 hover:bg-white shadow-md"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-[#737373]">Dashboard Settings</h1>
            <p className="text-sm text-[#737373]/70">Customize your BioHub dashboard</p>
          </div>
        </div>

        {/* Tools Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 space-y-4">
          <h2 className="font-semibold text-[#737373] text-lg">Tools</h2>
          
          <div className="grid gap-3">
            <Button
              variant="outline"
              onClick={handleRefreshStats}
              disabled={isRefreshing}
              className="w-full justify-start h-12"
            >
              <RefreshCw className={`h-4 w-4 mr-3 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh Stats'}
              <span className="ml-auto text-xs text-muted-foreground">Update dashboard data</span>
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate('/biopage/admin/link-generator')}
              className="w-full justify-start h-12"
            >
              <LinkIcon className="h-4 w-4 mr-3" />
              Link Generator
              <span className="ml-auto text-xs text-muted-foreground">Create UTM-tagged URLs</span>
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate('/biopage/admin/documentation')}
              className="w-full justify-start h-12"
            >
              <FileText className="h-4 w-4 mr-3" />
              Documentation
              <span className="ml-auto text-xs text-muted-foreground">Download system docs</span>
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate('/biopage/admin/pin-management')}
              className="w-full justify-start h-12"
            >
              <Key className="h-4 w-4 mr-3" />
              PIN Management
              <span className="ml-auto text-xs text-muted-foreground">View & reset user PINs</span>
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-12 border-destructive/50 text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4 mr-3" />
                  Clear All Stats
                  <span className="ml-auto text-xs">Reset analytics to zero</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear All Analytics?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all click analytics for all gyms. Stats will be reset to zero. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleClearAllStats}
                    disabled={isClearing}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isClearing ? 'Clearing...' : 'Yes, Clear All Stats'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Hero Image Setting */}
        <div className="bg-white rounded-2xl shadow-xl p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#b48f8f]/20 rounded-lg">
              <Image className="h-5 w-5 text-[#b48f8f]" />
            </div>
            <div>
              <h2 className="font-semibold text-[#737373]">Hero Image</h2>
              <p className="text-sm text-[#737373]/70">The main image displayed on your dashboard</p>
            </div>
          </div>

          {/* Current Image Preview */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#737373]">Current Image</label>
            <div className="relative w-full h-48 bg-gradient-to-b from-[#d6c5bf] to-[#e6e6e6] rounded-xl overflow-hidden border-2 border-dashed border-[#b48f8f]/30">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-[#b48f8f]" />
                </div>
              ) : currentImageUrl ? (
                <img 
                  src={currentImageUrl} 
                  alt="Current hero" 
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-[#737373]/50">
                  <Image className="h-12 w-12 mb-2" />
                  <span className="text-sm">No image set</span>
                </div>
              )}
            </div>
          </div>

          {/* New Image Preview */}
          {previewUrl && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#737373]">New Image Preview</label>
              <div className="relative w-full h-48 bg-gradient-to-b from-[#d6c5bf] to-[#e6e6e6] rounded-xl overflow-hidden border-2 border-[#b48f8f]">
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          )}

          {/* Upload Controls */}
          <div className="space-y-4">
            <div>
              <input
                type="file"
                id="hero-image"
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={handleFileSelect}
                className="hidden"
              />
              <label
                htmlFor="hero-image"
                className="flex items-center justify-center gap-2 w-full py-3 px-4 border-2 border-dashed border-[#b48f8f]/50 rounded-xl cursor-pointer hover:border-[#b48f8f] hover:bg-[#b48f8f]/5 transition-colors"
              >
                <Upload className="h-5 w-5 text-[#b48f8f]" />
                <span className="text-[#737373]">
                  {selectedFile ? selectedFile.name : 'Select new image'}
                </span>
              </label>
              <p className="text-xs text-[#737373]/50 mt-2">
                Supported: PNG, JPG, WebP, GIF (max 5MB)
              </p>
            </div>

            <Button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="w-full bg-[#b48f8f] hover:bg-[#a07e7e] text-white"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload & Save
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardSettings;
