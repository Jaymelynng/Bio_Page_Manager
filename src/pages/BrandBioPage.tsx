import { useParams, Link } from "react-router-dom";
import { useBrand } from "@/hooks/useBrands";
import { useBrandLinks } from "@/hooks/useBrandLinks";
import { useTrackClick } from "@/hooks/useTrackClick";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ExternalLink } from "lucide-react";

export default function BrandBioPage() {
  const { handle } = useParams<{ handle: string }>();
  const { data: brand, isLoading: brandLoading } = useBrand(handle || "");
  const { data: links, isLoading: linksLoading } = useBrandLinks(brand?.id || "");
  const trackClick = useTrackClick();

  const handleLinkClick = (linkId: string, url: string) => {
    trackClick.mutate(linkId);
    window.open(url, "_blank");
  };

  if (brandLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <Skeleton className="h-32 w-32 rounded-full mx-auto" />
          <Skeleton className="h-8 w-64 mx-auto" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Brand Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The brand you're looking for doesn't exist or has been deactivated.
          </p>
          <Link to="/">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  // Group links by category
  const linksByCategory = links?.reduce((acc, link) => {
    const categoryName = link.link_categories?.name || "Other";
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(link);
    return acc;
  }, {} as Record<string, typeof links>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <div className="pt-12 pb-8 px-6">
        <Link to="/">
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>

        <div className="max-w-2xl mx-auto text-center">
          {/* Brand Logo/Icon */}
          <div 
            className="w-32 h-32 rounded-full mx-auto mb-6 flex items-center justify-center text-4xl font-bold shadow-2xl"
            style={{ background: brand.color }}
          >
            {brand.name.charAt(0)}
          </div>

          {/* Brand Name & Description */}
          <h1 className="text-4xl font-bold mb-3">{brand.name}</h1>
          {brand.description && (
            <p className="text-lg text-muted-foreground mb-6">{brand.description}</p>
          )}
          
          {/* Stats */}
          {brand.brand_stats?.[0] && (
            <div className="flex gap-6 justify-center text-sm">
              <div>
                <p className="text-2xl font-bold text-primary">
                  {brand.brand_stats[0].total_clicks.toLocaleString()}
                </p>
                <p className="text-muted-foreground">Total Clicks</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">
                  {brand.brand_stats[0].total_links}
                </p>
                <p className="text-muted-foreground">Active Links</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Links */}
      <div className="max-w-2xl mx-auto px-6 pb-12">
        {linksLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(linksByCategory || {}).map(([categoryName, categoryLinks]) => (
              <div key={categoryName} className="space-y-3">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  {categoryName}
                </h2>
                <div className="space-y-3">
                  {categoryLinks?.map((link) => (
                    <Button
                      key={link.id}
                      variant={link.is_featured ? "premium" : "outline"}
                      className="w-full h-auto py-4 px-6 justify-between group"
                      onClick={() => handleLinkClick(link.id, link.url)}
                    >
                      <div className="flex items-center gap-3">
                        {link.icon && <span className="text-xl">{link.icon}</span>}
                        <span className="font-medium">{link.title}</span>
                      </div>
                      <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
