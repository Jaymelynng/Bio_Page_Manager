import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import BrandBioPage from "./pages/BrandBioPage";
import NotFound from "./pages/NotFound";
import AdminVideoUpload from "./pages/AdminVideoUpload";
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
          
          {/* Auth page */}
          <Route path="/auth" element={<AuthPage />} />
          
          {/* Public gym pages - ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "/:handle" ROUTE */}
          <Route path="/:handle" element={<BrandBioPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
