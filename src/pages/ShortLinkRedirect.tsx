import { useEffect } from "react";
import { useParams } from "react-router-dom";

const EDGE_FUNCTION_URL = "https://qfffsgiopzpwcijdkvcv.supabase.co/functions/v1/redirect";

const ShortLinkRedirect = () => {
  const { shortCode } = useParams<{ shortCode: string }>();

  useEffect(() => {
    if (shortCode) {
      // Redirect to the edge function which handles OG tags and final redirect
      window.location.href = `${EDGE_FUNCTION_URL}/${shortCode}`;
    }
  }, [shortCode]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
};

export default ShortLinkRedirect;
