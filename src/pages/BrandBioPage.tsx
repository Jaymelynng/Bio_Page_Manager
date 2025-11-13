import { useParams, useNavigate } from "react-router-dom";
import { useBrand } from "@/hooks/useBrands";
import { useBrandLinks, useTrackLinkClick } from "@/hooks/useBrandLinks";
import { Phone, MapPin, Gift, Calendar, Facebook, Instagram, MessageCircle, Mail } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";

const BrandBioPage = () => {
  const { handle } = useParams<{ handle: string }>();
  const navigate = useNavigate();
  const { data: brand, isLoading: brandLoading } = useBrand(handle || "");
  const { data: links, isLoading: linksLoading } = useBrandLinks(brand?.id || "");
  const trackClick = useTrackLinkClick();
  const [isShiftStarActive, setIsShiftStarActive] = useState(false);

  // Secret combo: Shift + * (8)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key === '*') {
        setIsShiftStarActive(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!e.shiftKey || e.key === 'Shift') {
        setIsShiftStarActive(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handleLinkClick = (linkId: string, url: string, linkTitle: string) => {
    // Secret combo: Shift + * + click gift certificate
    if (isShiftStarActive && linkTitle.toLowerCase().includes('gift')) {
      navigate('/');
      return;
    }
    
    trackClick.mutate(linkId);
    window.open(url, "_blank");
  };

  // Get secondary color or fallback (with safe access)
  const secondaryColor = brand?.color_secondary || brand?.color || '#1f53a3';
  const tertiaryColor = brand?.color_tertiary || '#ffffff';
  
  // Conditional hero height for Capital Cedar Park (narrower video)
  const heroHeight = brand?.handle === 'capital-gym-cedar-park' 
    ? 'h-[280px] md:h-[380px]' 
    : 'h-[300px] md:h-[400px]';

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

  const getIconForLink = (title: string, iconName?: string): JSX.Element | string | null => {
    // Map database icon text to Lucide React components
    const iconMap: Record<string, JSX.Element> = {
      'Phone': <Phone className="w-5 h-5" />,
      'Mail': <Mail className="w-5 h-5" />,
      'MapPin': <MapPin className="w-5 h-5" />,
      'Calendar': <Calendar className="w-5 h-5" />,
      'Gift': <Gift className="w-5 h-5" />,
      'Instagram': <Instagram className="w-5 h-5" />,
      'Facebook': <Facebook className="w-5 h-5" />,
      'MessageCircle': <MessageCircle className="w-5 h-5" />,
    };
    
    // If it's an emoji (not a Lucide component name), return it directly
    if (iconName && !iconMap[iconName]) {
      return iconName;
    }
    
    // If database has a Lucide icon name, use it
    if (iconName && iconMap[iconName]) {
      return iconMap[iconName];
    }
    
    // Otherwise detect from title
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('call') || lowerTitle.includes('phone')) return <Phone className="w-5 h-5" />;
    if (lowerTitle.includes('email') || lowerTitle.includes('mail')) return <Mail className="w-5 h-5" />;
    if (lowerTitle.includes('direction') || lowerTitle.includes('map')) return <MapPin className="w-5 h-5" />;
    if (lowerTitle.includes('trial') || lowerTitle.includes('book')) return <Calendar className="w-5 h-5" />;
    if (lowerTitle.includes('gift') || lowerTitle.includes('certificate')) return <Gift className="w-5 h-5" />;
    if (lowerTitle.includes('facebook')) return <Facebook className="w-5 h-5" />;
    if (lowerTitle.includes('instagram')) return <Instagram className="w-5 h-5" />;
    if (lowerTitle.includes('messenger')) return <MessageCircle className="w-5 h-5" />;
    
    return null;
  };

  return (
    <div 
      className="min-h-screen relative overflow-hidden px-4"
      style={{
        background: `linear-gradient(135deg, ${brand.color} 0%, ${secondaryColor} 100%)`
      }}
    >
      {/* Animated background pattern */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255,255,255,0.08) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(255,255,255,0.05) 0%, transparent 50%)
          `,
          animation: 'float 20s ease-in-out infinite',
          zIndex: 0
        }}
      />

      {/* White content container */}
      <div 
        className="max-w-md mx-auto bg-white rounded-3xl overflow-hidden shadow-2xl relative z-10"
        style={{ animation: 'slideUp 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }}
      >
        {/* Hero Section with Video Background */}
        <div className={`relative ${heroHeight} overflow-hidden`}>
          {brand.hero_video_url ? (
            <>
              {/* Blurred background for narrow videos */}
              <video 
                autoPlay 
                loop 
                muted 
                playsInline
                preload="metadata"
                className="absolute inset-0 w-full h-full object-cover blur-2xl scale-110 opacity-40"
                src={brand.hero_video_url}
              />
              
              {/* Main video */}
              <video 
                autoPlay 
                loop 
                muted 
                playsInline
                preload="metadata"
                className="absolute inset-0 w-full h-full object-contain"
                src={brand.hero_video_url}
              />
              
              {/* Gradient overlay with brand colors */}
              <div 
                className="absolute inset-0 z-10"
                style={{
                  background: `linear-gradient(180deg, 
                    ${brand.color}b3 0%, 
                    ${brand.color}d9 50%, 
                    ${secondaryColor}e6 100%)`
                }}
              />
            </>
          ) : (
            /* Fallback gradient if no video */
            <div 
              className="absolute inset-0"
              style={{ 
                background: `linear-gradient(180deg, 
                  ${brand.color}b3 0%, 
                  ${brand.color}d9 50%, 
                  ${secondaryColor}e6 100%)`
              }}
            />
          )}
          
          {/* Content overlay (logo, name, location) */}
          <div className="relative z-20 h-full flex flex-col items-center justify-center px-4">
            {brand.logo_url && (
              <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center p-4 shadow-2xl mb-4">
                <img 
                  src={brand.logo_url} 
                  alt={brand.name}
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            
            <h1 className="text-3xl font-bold text-white mb-1 drop-shadow-lg">
              {brand.name}
            </h1>
            
            {(brand.city || brand.state) && (
              <p className="text-white/95 text-sm drop-shadow-md">
                {brand.city}{brand.city && brand.state ? ', ' : ''}{brand.state}
              </p>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="px-5 pb-8 pt-4">
        {linksLoading ? (
          <div className="space-y-4 mt-6">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : (
          <>
            {/* Quick Actions Section */}
            {featuredLinks.length > 0 && (
              <div className="mt-6 mb-8">
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2 flex items-center gap-2">
                  ⚡ Quick Actions
                </h2>
                
                {/* 2x2 Grid for first 4 featured links (excluding trial) */}
                {featuredLinks.filter(link => !link.title.toLowerCase().includes('trial')).slice(0, 4).length > 0 && (
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    {featuredLinks.filter(link => !link.title.toLowerCase().includes('trial')).slice(0, 4).map((link: any) => (
                  <button
                    key={link.id}
                    onClick={() => handleLinkClick(link.id, link.url, link.title)}
                    className="py-6 px-4 rounded-xl font-semibold text-white shadow-md hover:shadow-lg transition-all active:scale-[0.98] flex flex-col items-center justify-center gap-2"
                    style={{ background: `linear-gradient(135deg, ${brand.color}, ${secondaryColor})` }}
                  >
                        <span className="text-2xl">{getIconForLink(link.title, link.icon)}</span>
                        <span className="text-sm text-center">{link.title}</span>
                      </button>
                    ))}
                  </div>
                )}
                
                {/* Full-width Free Trial Button */}
                {featuredLinks.find(link => link.title.toLowerCase().includes('trial')) && (
                <button
                  onClick={() => {
                    const trialLink = featuredLinks.find((link: any) => link.title.toLowerCase().includes('trial'))!;
                    handleLinkClick(trialLink.id, trialLink.url, trialLink.title);
                  }}
                  className="w-full py-4 px-6 rounded-xl font-semibold text-white shadow-md hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  style={{ background: `linear-gradient(135deg, ${brand.color}, ${secondaryColor})` }}
                >
                    <span className="text-xl">
                      {getIconForLink(
                        featuredLinks.find((link: any) => link.title.toLowerCase().includes('trial'))!.title,
                        featuredLinks.find((link: any) => link.title.toLowerCase().includes('trial'))!.icon
                      )}
                    </span>
                    {featuredLinks.find((link: any) => link.title.toLowerCase().includes('trial'))!.title}
                  </button>
                )}
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
                    onClick={() => handleLinkClick(link.id, link.url, link.title)}
                    className="w-full py-3 px-4 bg-background border border-border hover:bg-muted/50 rounded-lg text-left transition-colors flex items-center gap-3"
                  >
                      <span className="text-xl">
                        {getIconForLink(link.title, link.icon)}
                      </span>
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
    </div>
  );
};

export default BrandBioPage;