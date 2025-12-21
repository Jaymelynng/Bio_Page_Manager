import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import BrandBioPage from "./pages/BrandBioPage";
import NotFound from "./pages/NotFound";
import AdminVideoUpload from "./pages/AdminVideoUpload";
import AdminEditGym from "./pages/AdminEditGym";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminLinkGenerator from "./pages/AdminLinkGenerator";
import AdminDashboardSettings from "./pages/AdminDashboardSettings";
import AdminPinManagement from "./pages/AdminPinManagement";
import AdminDocumentation from "./pages/AdminDocumentation";
import AuthPage from "./pages/AuthPage";
import ProtectedRoute from "./components/ProtectedRoute";
import ShortLinkRedirect from "./pages/ShortLinkRedirect";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Redirect root to /biopage */}
          <Route path="/" element={<Navigate to="/biopage" replace />} />
          
          {/* Protected admin routes - all under /biopage */}
          <Route 
            path="/biopage" 
            element={
              <ProtectedRoute requireAdmin>
                <Index />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/biopage/admin/upload-videos" 
            element={
              <ProtectedRoute requireAdmin>
                <AdminVideoUpload />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/biopage/admin/edit/:handle" 
            element={
              <ProtectedRoute requireAdmin>
                <AdminEditGym />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/biopage/admin/analytics/:handle" 
            element={
              <ProtectedRoute requireAdmin>
                <AdminAnalytics />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/biopage/admin/link-generator" 
            element={
              <ProtectedRoute requireAdmin>
                <AdminLinkGenerator />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/biopage/admin/dashboard-settings" 
            element={
              <ProtectedRoute requireAdmin>
                <AdminDashboardSettings />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/biopage/admin/pin-management" 
            element={
              <ProtectedRoute requireAdmin>
                <AdminPinManagement />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/biopage/admin/documentation" 
            element={
              <ProtectedRoute requireAdmin>
                <AdminDocumentation />
              </ProtectedRoute>
            } 
          />
          
          {/* Auth page */}
          <Route path="/biopage/auth" element={<AuthPage />} />
          
          {/* Short link redirect */}
          <Route path="/go/:shortCode" element={<ShortLinkRedirect />} />
          
          {/* Public gym pages */}
          <Route path="/biopage/:handle" element={<BrandBioPage />} />
          <Route path="*" element={<NotFound />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
