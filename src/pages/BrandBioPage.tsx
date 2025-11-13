import { useParams } from "react-router-dom";
import { useBrand } from "@/hooks/useBrands";
import { useBrandLinks, useTrackLinkClick } from "@/hooks/useBrandLinks";
import { Phone, MapPin, Gift, Calendar, Facebook, Instagram, MessageCircle } from "lucide-react";
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Skeleton className="h-64 w-full max-w-md" />
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Gym Not Found</h1>
        </div>
      </div>
    );
  }

  // Get featured links
  const featuredLinks = links?.filter((link: any) => link.is_featured) || [];
  
  // Group non-featured links by category
  const regularLinks = links?.filter((link: any) => !link.is_featured) || [];
  const groupedLinks = regularLinks.reduce((acc, link: any) => {
    const categoryName = link.category?.name || "Other";
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(link);
    return acc;
  }, {} as Record<string, any[]>);

  const getIconForLink = (title: string, icon?: string) => {
    if (icon) return icon;
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('call') || lowerTitle.includes('phone')) return <Phone className="w-5 h-5" />;
    if (lowerTitle.includes('direction') || lowerTitle.includes('map')) return <MapPin className="w-5 h-5" />;
    if (lowerTitle.includes('trial') || lowerTitle.includes('book')) return <Calendar className="w-5 h-5" />;
    if (lowerTitle.includes('gift') || lowerTitle.includes('certificate')) return <Gift className="w-5 h-5" />;
    return null;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Gradient */}
      <div 
        className="relative py-12 px-4"
        style={{ 
          background: `linear-gradient(135deg, ${brand.color}, ${brand.color}dd)`,
        }}
      >
        <div className="max-w-md mx-auto text-center">
          {/* Logo Circle */}
          {brand.logo_url && (
            <div className="w-32 h-32 mx-auto mb-4 bg-white rounded-full flex items-center justify-center p-4 shadow-lg">
              <img 
                src={brand.logo_url} 
                alt={brand.name}
                className="w-full h-full object-contain"
              />
            </div>
          )}
          
          {/* Gym Name */}
          <h1 className="text-3xl font-bold text-white mb-1">{brand.name}</h1>
          
          {/* Location */}
          {(brand.city || brand.state) && (
            <p className="text-white/90 text-sm">
              {brand.city}{brand.city && brand.state ? ', ' : ''}{brand.state}
            </p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 pb-8">
        {linksLoading ? (
          <div className="space-y-4 mt-6">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : (
          <>
            {/* Featured Action Buttons */}
            {featuredLinks.length > 0 && (
              <div className="space-y-3 mt-6 mb-8">
                {featuredLinks.map((link: any) => (
                  <button
                    key={link.id}
                    onClick={() => handleLinkClick(link.id, link.url)}
                    className="w-full py-4 px-6 rounded-lg font-semibold text-white shadow-md transition-all hover:shadow-lg active:scale-[0.98]"
                    style={{
                      background: `linear-gradient(135deg, ${brand.color}, ${brand.color}dd)`,
                    }}
                  >
                    <span className="flex items-center justify-center gap-2">
                      {getIconForLink(link.title, link.icon)}
                      {link.title}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Divider */}
            {featuredLinks.length > 0 && Object.keys(groupedLinks).length > 0 && (
              <div className="border-t border-border my-6" />
            )}

            {/* Regular Links by Category */}
            {Object.entries(groupedLinks).map(([categoryName, categoryLinks]) => (
              <div key={categoryName} className="mb-6">
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">
                  {categoryName}
                </h2>
                <div className="space-y-2">
                  {categoryLinks.map((link: any) => (
                    <button
                      key={link.id}
                      onClick={() => handleLinkClick(link.id, link.url)}
                      className="w-full py-3 px-4 bg-muted/50 hover:bg-muted rounded-lg text-left transition-colors flex items-center gap-3"
                    >
                      {link.icon ? (
                        <span className="text-xl">{link.icon}</span>
                      ) : (
                        getIconForLink(link.title)
                      )}
                      <span className="font-medium text-foreground">{link.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Social Media Buttons */}
            {(brand.facebook_url || brand.instagram_url) && (
              <>
                <div className="border-t border-border my-8" />
                <div className="flex justify-center gap-4">
                  {brand.facebook_url && (
                    <a
                      href={brand.facebook_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-14 h-14 rounded-full border-2 flex items-center justify-center hover:bg-muted transition-colors"
                      style={{ borderColor: brand.color }}
                    >
                      <Facebook className="w-6 h-6" style={{ color: brand.color }} />
                    </a>
                  )}
                  {brand.instagram_url && (
                    <a
                      href={brand.instagram_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-14 h-14 rounded-full border-2 flex items-center justify-center hover:bg-muted transition-colors"
                      style={{ borderColor: brand.color }}
                    >
                      <Instagram className="w-6 h-6" style={{ color: brand.color }} />
                    </a>
                  )}
                  {brand.facebook_url && (
                    <a
                      href={`https://m.me/${brand.facebook_url.split('/').pop()}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-14 h-14 rounded-full border-2 flex items-center justify-center hover:bg-muted transition-colors"
                      style={{ borderColor: brand.color }}
                    >
                      <MessageCircle className="w-6 h-6" style={{ color: brand.color }} />
                    </a>
                  )}
                </div>
              </>
            )}

            {/* Footer */}
            <div className="text-center mt-8 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} {brand.name}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BrandBioPage;