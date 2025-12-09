import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import BrandBioPage from "./pages/BrandBioPage";
import NotFound from "./pages/NotFound";
import AdminVideoUpload from "./pages/AdminVideoUpload";
import AdminEditGym from "./pages/AdminEditGym";
import AdminAnalytics from "./pages/AdminAnalytics";
import AuthPage from "./pages/AuthPage";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Protected admin routes */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute requireAdmin>
                <Index />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/upload-videos" 
            element={
              <ProtectedRoute requireAdmin>
                <AdminVideoUpload />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/edit/:handle" 
            element={
              <ProtectedRoute requireAdmin>
                <AdminEditGym />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/analytics/:handle" 
            element={
              <ProtectedRoute requireAdmin>
                <AdminAnalytics />
              </ProtectedRoute>
            } 
          />
          
          {/* Auth page */}
          <Route path="/auth" element={<AuthPage />} />
          
          {/* Public gym pages */}
          <Route path="/biopage/:handle" element={<BrandBioPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
