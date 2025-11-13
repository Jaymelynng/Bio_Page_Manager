import { useState } from "react";
import { useBrands } from "@/hooks/useBrands";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Upload, CheckCircle2, Loader2 } from "lucide-react";

export default function AdminVideoUpload() {
  const { data: brands, isLoading } = useBrands();
  const { toast } = useToast();
  const [uploadingIds, setUploadingIds] = useState<Set<string>>(new Set());
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  const handleVideoUpload = async (brandId: string, brandHandle: string, file: File) => {
    if (!file.type.startsWith('video/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a video file (MP4, MOV, WebM)",
        variant: "destructive",
      });
      return;
    }

    setUploadingIds(prev => new Set(prev).add(brandId));

    try {
      // Upload to storage bucket with handle-based filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${brandHandle}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('gym-videos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true, // Replace if exists
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('gym-videos')
        .getPublicUrl(fileName);

      // Update brand with video URL
      const { error: updateError } = await supabase
        .from('brands')
        .update({ hero_video_url: publicUrl })
        .eq('id', brandId);

      if (updateError) throw updateError;

      setCompletedIds(prev => new Set(prev).add(brandId));
      
      toast({
        title: "Video uploaded successfully!",
        description: `Video for ${brandHandle} is now live.`,
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploadingIds(prev => {
        const next = new Set(prev);
        next.delete(brandId);
        return next;
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-foreground">Upload Gym Drone Videos</h1>
          <p className="text-muted-foreground">
            Upload hero videos for each gym location. Videos will appear on their bio pages.
          </p>
        </div>

        <div className="grid gap-4">
          {brands?.map((brand) => {
            const isUploading = uploadingIds.has(brand.id);
            const isCompleted = completedIds.has(brand.id);

            return (
              <Card key={brand.id} className="p-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-foreground">{brand.name}</h3>
                    <p className="text-sm text-muted-foreground">Handle: {brand.handle}</p>
                    {brand.hero_video_url && (
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        ✓ Video already uploaded
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <Input
                      type="file"
                      accept="video/mp4,video/quicktime,video/webm"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleVideoUpload(brand.id, brand.handle, file);
                        }
                      }}
                      disabled={isUploading}
                      className="max-w-xs"
                      id={`video-${brand.id}`}
                    />
                    
                    {isUploading && (
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    )}
                    
                    {isCompleted && !isUploading && (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    )}
                    
                    {!isUploading && !isCompleted && (
                      <Upload className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="text-center text-sm text-muted-foreground">
          <p>Supported formats: MP4, MOV, WebM</p>
          <p>Videos will be automatically named based on gym handle</p>
        </div>
      </div>
    </div>
  );
}
