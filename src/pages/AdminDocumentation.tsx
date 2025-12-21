import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Download, RefreshCw, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface DocFile {
  name: string;
  description: string;
  size?: number;
  updated_at?: string;
}

const DOCUMENTATION_FILES: DocFile[] = [
  { name: 'README.md', description: 'Documentation index & overview' },
  { name: 'USER-GUIDE.md', description: 'Step-by-step guide for gym managers' },
  { name: 'DEVELOPER-GUIDE.md', description: 'Technical documentation for developers' },
  { name: 'DATABASE-SCHEMA.md', description: 'Database tables & relationships' },
  { name: 'API-REFERENCE.md', description: 'Edge function endpoints & usage' },
  { name: 'SHORT-LINKS.md', description: 'URL shortener & tracking guide' },
  { name: 'TROUBLESHOOTING.md', description: 'Common issues & solutions' },
];

const AdminDocumentation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [availableFiles, setAvailableFiles] = useState<string[]>([]);
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);

  useEffect(() => {
    fetchAvailableFiles();
  }, []);

  const fetchAvailableFiles = async () => {
    try {
      const { data, error } = await supabase.storage
        .from('documentation')
        .list();

      if (error) {
        console.error('Error fetching files:', error);
        setAvailableFiles([]);
      } else {
        setAvailableFiles(data?.map(f => f.name) || []);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeedDocumentation = async () => {
    setIsSeeding(true);
    try {
      const { data, error } = await supabase.functions.invoke('seed-documentation');

      if (error) throw error;

      toast({
        title: "Documentation created!",
        description: `Successfully created ${data.files?.length || 0} documentation files.`,
      });

      await fetchAvailableFiles();
    } catch (err: any) {
      console.error('Seed error:', err);
      toast({
        title: "Error creating documentation",
        description: err.message || "Failed to create documentation files.",
        variant: "destructive",
      });
    } finally {
      setIsSeeding(false);
    }
  };

  const handleDownload = async (fileName: string) => {
    setDownloadingFile(fileName);
    try {
      const { data, error } = await supabase.storage
        .from('documentation')
        .download(fileName);

      if (error) throw error;

      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Downloaded!",
        description: `${fileName} has been downloaded.`,
      });
    } catch (err: any) {
      console.error('Download error:', err);
      toast({
        title: "Download failed",
        description: err.message || `Failed to download ${fileName}`,
        variant: "destructive",
      });
    } finally {
      setDownloadingFile(null);
    }
  };

  const handleDownloadAll = async () => {
    for (const file of DOCUMENTATION_FILES) {
      if (availableFiles.includes(file.name)) {
        await handleDownload(file.name);
        // Small delay between downloads
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#d6c5bf] via-[#e6e6e6] to-[#c3a5a5] p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/biopage/admin/dashboard-settings')}
            className="bg-white/80 hover:bg-white shadow-md"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-[#737373]">Documentation</h1>
            <p className="text-sm text-[#737373]/70">Download system documentation files</p>
          </div>
        </div>

        {/* Actions Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-[#737373] text-lg">Actions</h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleSeedDocumentation}
                disabled={isSeeding}
              >
                {isSeeding ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    {availableFiles.length > 0 ? 'Refresh Docs' : 'Create Docs'}
                  </>
                )}
              </Button>
              {availableFiles.length > 0 && (
                <Button
                  onClick={handleDownloadAll}
                  className="bg-[#b48f8f] hover:bg-[#a07e7e] text-white"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download All
                </Button>
              )}
            </div>
          </div>

          {availableFiles.length === 0 && !isLoading && (
            <div className="text-center py-8 text-[#737373]/70">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No documentation files found.</p>
              <p className="text-sm">Click "Create Docs" to generate documentation.</p>
            </div>
          )}
        </div>

        {/* Documentation Files */}
        {isLoading ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#b48f8f]" />
            <p className="mt-2 text-[#737373]/70">Loading documentation...</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl p-6 space-y-4">
            <h2 className="font-semibold text-[#737373] text-lg">Documentation Files</h2>
            
            <div className="space-y-3">
              {DOCUMENTATION_FILES.map((doc) => {
                const isAvailable = availableFiles.includes(doc.name);
                const isDownloading = downloadingFile === doc.name;
                
                return (
                  <div
                    key={doc.name}
                    className={`flex items-center justify-between p-4 rounded-xl border ${
                      isAvailable 
                        ? 'border-[#b48f8f]/30 bg-[#b48f8f]/5' 
                        : 'border-gray-200 bg-gray-50 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        isAvailable ? 'bg-[#b48f8f]/20' : 'bg-gray-200'
                      }`}>
                        <FileText className={`h-5 w-5 ${
                          isAvailable ? 'text-[#b48f8f]' : 'text-gray-400'
                        }`} />
                      </div>
                      <div>
                        <h3 className={`font-medium ${
                          isAvailable ? 'text-[#737373]' : 'text-gray-400'
                        }`}>
                          {doc.name}
                        </h3>
                        <p className={`text-sm ${
                          isAvailable ? 'text-[#737373]/70' : 'text-gray-400'
                        }`}>
                          {doc.description}
                        </p>
                      </div>
                    </div>
                    
                    {isAvailable ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(doc.name)}
                        disabled={isDownloading}
                        className="text-[#b48f8f] hover:text-[#a07e7e] hover:bg-[#b48f8f]/10"
                      >
                        {isDownloading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                      </Button>
                    ) : (
                      <span className="text-xs text-gray-400">Not created</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Info Card */}
        <div className="bg-[#b48f8f]/10 rounded-2xl p-4 border border-[#b48f8f]/20">
          <div className="flex gap-3">
            <CheckCircle className="h-5 w-5 text-[#b48f8f] shrink-0 mt-0.5" />
            <div className="text-sm text-[#737373]">
              <p className="font-medium">About Documentation</p>
              <p className="mt-1 opacity-80">
                These markdown files contain comprehensive documentation about the GymBio Hub platform.
                Click "Create Docs" to generate fresh documentation, or download individual files as needed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDocumentation;
