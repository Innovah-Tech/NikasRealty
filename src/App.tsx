import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/admin/ProtectedRoute";
import ScrollToTop from "@/components/ScrollToTop";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Blog from "./pages/Blog";
import BlogDetailsPage from "./pages/BlogDetails";
import PropertiesPage from "./pages/Properties";
import PropertyDetailsPage from "./pages/PropertyDetails";
import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminProperties from "./pages/admin/Properties";
import AdminAddProperty from "./pages/admin/AddProperty";
import AdminBlogs from "./pages/admin/Blogs";
import AdminAddBlog from "./pages/admin/AddBlog";
import AdminEditBlog from "./pages/admin/EditBlog";
import AdminEditProperty from "./pages/admin/EditProperty";
import AdminRequests from "./pages/admin/Requests";
import AdminTeam from "./pages/admin/Team";
import AdminAddTeamMember from "./pages/admin/AddTeamMember";
import AdminEditTeamMember from "./pages/admin/EditTeamMember";
import AdminSettings from "./pages/admin/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ScrollToTop />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:id" element={<BlogDetailsPage />} />
            <Route path="/properties" element={<PropertiesPage />} />
            <Route path="/properties/:id" element={<PropertyDetailsPage />} />
            
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/properties"
              element={
                <ProtectedRoute>
                  <AdminProperties />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/add-property"
              element={
                <ProtectedRoute>
                  <AdminAddProperty />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/edit-property/:id"
              element={
                <ProtectedRoute>
                  <AdminEditProperty />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/blogs"
              element={
                <ProtectedRoute>
                  <AdminBlogs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/add-blog"
              element={
                <ProtectedRoute>
                  <AdminAddBlog />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/edit-blog/:id"
              element={
                <ProtectedRoute>
                  <AdminEditBlog />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/requests"
              element={
                <ProtectedRoute>
                  <AdminRequests />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/team"
              element={
                <ProtectedRoute>
                  <AdminTeam />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/add-team-member"
              element={
                <ProtectedRoute>
                  <AdminAddTeamMember />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/edit-team-member/:id"
              element={
                <ProtectedRoute>
                  <AdminEditTeamMember />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute>
                  <AdminSettings />
                </ProtectedRoute>
              }
            />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
