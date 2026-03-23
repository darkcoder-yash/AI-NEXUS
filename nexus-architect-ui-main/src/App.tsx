import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";

// Standardized Auth Components
import { Login } from "./auth/Login";
import { Callback } from "./auth/Callback";

// Route Guards
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { AdminRoute } from "./routes/AdminRoute";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AiNexusLanding from "./components/AiNexusLanding";
import { NexusAI } from "./nexus-ai/NexusAI";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <Toaster />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<AiNexusLanding />} />
          <Route path="/login" element={<Login />} />
          <Route path="/auth/callback" element={<Callback />} />
          
          {/* Protected Application Routes */}
          <Route 
            path="/nexus" 
            element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/nexus-ai" 
            element={
              <ProtectedRoute>
                <NexusAI />
              </ProtectedRoute>
            } 
          />

          {/* Admin Protected Routes */}
          <Route 
            path="/admin/*" 
            element={
              <AdminRoute>
                <div className="p-8 text-white">Admin Dashboard Module</div>
              </AdminRoute>
            } 
          />
          
          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
