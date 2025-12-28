import { useParams, useNavigate, useSearchParams, Link } from "react-router-dom";
import { useBrand } from "@/hooks/useBrands";
import { useBrandLinks, useTrackLinkClick } from "@/hooks/useBrandLinks";
import { usePinAuth } from "@/hooks/usePinAuth";
import { Phone, MapPin, Gift, Calendar, Facebook, Instagram, MessageCircle, Mail, BookOpen, Target, Moon, Star, PartyPopper, User, Settings, BarChart3, LayoutDashboard } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState, useMemo } from "react";

const BrandBioPage = () => {
  const { handle } = useParams<{ handle: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = usePinAuth();
  const { data: brand, isLoading: brandLoading } = useBrand(handle || "");
  const { data: links, isLoading: linksLoading } = useBrandLinks(brand?.id || "");
  const trackClick = useTrackLinkClick();
  const [isShiftStarActive, setIsShiftStarActive] = useState(false);

  // Capture UTM parameters from URL
  const utmParams = useMemo(() => ({
    source: searchParams.get('utm_source'),
    medium: searchParams.get('utm_medium'),
    campaign: searchParams.get('utm_campaign'),
  }), [searchParams]);

  // Set dynamic page title and OG meta tags for link previews
  useEffect(() => {
    if (brand?.name) {
      document.title = `${brand.name} | BioHub`;
      
      // Update OG meta tags for social media previews
      const updateMetaTag = (property: string, content: string) => {
        let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
        if (!meta) {
          meta = document.createElement('meta');
          meta.setAttribute('property', property);
          document.head.appendChild(meta);
        }
        meta.setAttribute('content', content);
      };
      
      const updateNameMetaTag = (name: string, content: string) => {
        let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
        if (!meta) {
          meta = document.createElement('meta');
          meta.setAttribute('name', name);
          document.head.appendChild(meta);
        }
        meta.setAttribute('content', content);
      };
      
      const description = brand.tagline || `${brand.name} - Classes, schedules, and more.`;
      const imageUrl = brand.logo_url || '';
      
      // Open Graph tags
      updateMetaTag('og:title', brand.name);
      updateMetaTag('og:description', description);
      updateMetaTag('og:image', imageUrl);
      updateMetaTag('og:type', 'website');
      
      // Twitter tags
      updateNameMetaTag('twitter:card', 'summary');
      updateNameMetaTag('twitter:title', brand.name);
      updateNameMetaTag('twitter:description', description);
      updateNameMetaTag('twitter:image', imageUrl);
    }
    
    return () => {
      document.title = 'BioHub - Gym Bio Links';
    };
  }, [brand?.name, brand?.logo_url, brand?.tagline]);

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
    
    trackClick.mutate({
      brandLinkId: linkId,
      utmSource: utmParams.source,
      utmMedium: utmParams.medium,
      utmCampaign: utmParams.campaign,
    });
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
      'BookOpen': <BookOpen className="w-5 h-5" />,
      'Target': <Target className="w-5 h-5" />,
      'Moon': <Moon className="w-5 h-5" />,
      'Star': <Star className="w-5 h-5" />,
      'PartyPopper': <PartyPopper className="w-5 h-5" />,
      'User': <User className="w-5 h-5" />,
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
      {/* Admin Toolbar - only visible when authenticated */}
      {isAuthenticated && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm text-white py-2 px-4">
          <div className="max-w-md mx-auto flex items-center justify-between">
            <span className="text-sm font-medium">Admin Mode</span>
            <div className="flex items-center gap-2">
              <Link 
                to="/biopage"
                className="flex items-center gap-1 px-3 py-1 text-xs bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              >
                <LayoutDashboard className="w-3 h-3" />
                Dashboard
              </Link>
              <Link 
                to={`/biopage/admin/edit/${handle}`}
                className="flex items-center gap-1 px-3 py-1 text-xs bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              >
                <Settings className="w-3 h-3" />
                Edit
              </Link>
              <Link 
                to={`/biopage/admin/analytics`}
                className="flex items-center gap-1 px-3 py-1 text-xs bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              >
                <BarChart3 className="w-3 h-3" />
                Analytics
              </Link>
            </div>
          </div>
        </div>
      )}
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
            {/* Hero CTA Banner */}
            <div 
              className="mt-6 mb-8 rounded-2xl p-8 text-center"
              style={{ 
                background: `linear-gradient(135deg, ${brand.color}, ${secondaryColor})` 
              }}
            >
              <h2 className="text-2xl font-bold text-white mb-2">
                Start Your Journey Today!
              </h2>
              <p className="text-white/90 text-sm mb-4">
                Experience the excitement with a FREE trial class
              </p>
              <button
                onClick={() => {
                  if (brand.primary_cta_url) {
                    trackClick.mutate({
                      brandLinkId: brand.id,
                      utmSource: utmParams.source,
                      utmMedium: utmParams.medium,
                      utmCampaign: utmParams.campaign,
                    });
                    window.open(brand.primary_cta_url, "_blank");
                  }
                }}
                className="px-8 py-3 bg-white rounded-xl font-semibold hover:shadow-lg transition-all active:scale-[0.98]"
                style={{ color: brand.color }}
              >
                Request Your Free Trial
              </button>
            </div>

            {/* Quick Actions Section */}
            {featuredLinks.length > 0 && (
              <div className="mb-8">
                <h2 className="text-sm font-bold uppercase tracking-wider mb-3 px-2 flex items-center gap-2 pb-2 border-b-2" style={{ color: brand.color, borderColor: brand.color }}>
                  Quick Actions
                </h2>
                
                {/* 2x2 Grid for first 4 featured links (excluding trial) */}
                {featuredLinks.filter(link => !link.title.toLowerCase().includes('trial')).slice(0, 4).length > 0 && (
                  <div className="grid grid-cols-2 gap-3">
                    {featuredLinks.filter(link => !link.title.toLowerCase().includes('trial')).slice(0, 4).map((link: any) => (
                  <button
                    key={link.id}
                    onClick={() => handleLinkClick(link.id, link.url, link.title)}
                    className="py-6 px-4 rounded-xl font-semibold text-white shadow-md hover:shadow-lg transition-all active:scale-[0.98] flex flex-col items-center justify-center gap-2"
                    style={{ background: `linear-gradient(135deg, ${brand.color}, ${secondaryColor})` }}
                  >
                        <span className="text-3xl">{getIconForLink(link.title, link.icon)}</span>
                        <span className="text-sm text-center">{link.title}</span>
                      </button>
                    ))}
                  </div>
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
                <h2 className="text-sm font-bold uppercase tracking-wider mb-3 px-2 pb-2 border-b-2" style={{ color: brand.color, borderColor: brand.color }}>
                  {categoryName}
                </h2>
                <div className="space-y-2">
                  {categoryLinks.map((link: any) => (
                  <button
                    key={link.id}
                    onClick={() => handleLinkClick(link.id, link.url, link.title)}
                    className="w-full py-3 px-4 rounded-lg text-left transition-all flex items-center justify-between border-2 hover:scale-[1.02] hover:shadow-md"
                    style={{
                      background: `linear-gradient(135deg, ${brand.color}08, ${secondaryColor}05)`,
                      borderColor: `${brand.color}30`,
                    }}
                  >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {getIconForLink(link.title, link.icon)}
                        </span>
                        <span className="font-medium text-foreground">{link.title}</span>
                      </div>
                      <span className="text-xl text-muted-foreground">→</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Social Media Buttons */}
            {(brand.facebook_url || brand.instagram_url) && (
              <>
                <div className="border-t border-border my-8" />
                <h2 className="text-sm font-bold uppercase tracking-wider mb-4 text-center pb-2 border-b-2 inline-block w-full" style={{ color: brand.color, borderColor: brand.color }}>
                  Connect With Us
                </h2>
                <div className="flex justify-center gap-4">
                  {brand.facebook_url && (
            <a
              href={brand.facebook_url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-14 h-14 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform shadow-md"
            >
              <Facebook className="w-6 h-6" style={{ color: brand.color }} />
            </a>
                  )}
                  {brand.instagram_url && (
            <a
              href={brand.instagram_url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-14 h-14 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform shadow-md"
            >
              <Instagram className="w-6 h-6" style={{ color: brand.color }} />
            </a>
                  )}
                  {brand.facebook_url && (
            <a
              href={`https://m.me/${brand.facebook_url.split('/').pop()}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-14 h-14 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform shadow-md"
            >
              <MessageCircle className="w-6 h-6" style={{ color: brand.color }} />
            </a>
                  )}
                </div>
              </>
            )}

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-border">
              {/* Gym Details Box */}
              <div className="bg-muted/30 rounded-xl p-4 mb-4 text-center">
                <p className="font-bold text-foreground mb-2">{brand.name}</p>
                {brand.address && (
                  <p className="text-sm text-muted-foreground mb-1">
                    {brand.address}
                    {brand.city && brand.state && `, ${brand.city}, ${brand.state}`}
                  </p>
                )}
                {brand.phone && (
                  <p className="text-sm font-medium mt-2 flex items-center justify-center gap-2">
                    <span>📞</span>
                    <span style={{ color: brand.color }}>{brand.phone}</span>
                  </p>
                )}
              </div>
              
              {/* Copyright */}
              <p className="text-xs text-center text-muted-foreground">
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