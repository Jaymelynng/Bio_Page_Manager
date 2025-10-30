import { useParams, Link } from "react-router-dom";
import { useBrand } from "@/hooks/useBrands";
import { useBrandLinks, useTrackLinkClick } from "@/hooks/useBrandLinks";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const BrandBioPage = () => {
  const { handle } = useParams<{ handle: string }>();
  const { data: brand, isLoading: brandLoading } = useBrand(handle || "");
  const { data: links, isLoading: linksLoading } = useBrandLinks(brand?.id || "");
  const trackClick = useTrackLinkClick();

  const handleLinkClick = (linkId: string, url: string) => {
    trackClick.mutate(linkId);
    window.open(url, "_blank");
  };

  if (brandLoading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <Skeleton className="h-12 w-48" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">Brand Not Found</h1>
          <p className="text-muted-foreground">The brand you're looking for doesn't exist.</p>
          <Link to="/">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Group links by category
  const groupedLinks = links?.reduce((acc, link: any) => {
    const categoryName = link.category?.name || "Other";
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(link);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div 
        className="relative h-64 flex items-center justify-center overflow-hidden"
        style={{ background: brand.color }}
      >
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 text-center text-white p-8">
          <h1 className="text-5xl font-bold mb-2">{brand.name}</h1>
          {brand.description && (
            <p className="text-xl opacity-90">{brand.description}</p>
          )}
        </div>
        <Link to="/" className="absolute top-4 left-4 z-20">
          <Button variant="secondary" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>
      </div>

      {/* Links Section */}
      <div className="max-w-2xl mx-auto p-8 -mt-12">
        <Card className="bg-card p-8 space-y-8">
          {linksLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            Object.entries(groupedLinks || {}).map(([categoryName, categoryLinks]) => (
              <div key={categoryName} className="space-y-3">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  {categoryName}
                </h2>
                <div className="space-y-2">
                  {categoryLinks.map((link: any) => (
                    <Button
                      key={link.id}
                      variant="outline"
                      className="w-full justify-between h-auto py-4 px-6 hover:border-primary/50 transition-all"
                      onClick={() => handleLinkClick(link.id, link.url)}
                    >
                      <span className="flex items-center gap-3">
                        {link.icon && <span className="text-2xl">{link.icon}</span>}
                        <span className="font-medium">{link.title}</span>
                      </span>
                      <ExternalLink className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  ))}
                </div>
              </div>
            ))
          )}
        </Card>
      </div>
    </div>
  );
};

export default BrandBioPage;