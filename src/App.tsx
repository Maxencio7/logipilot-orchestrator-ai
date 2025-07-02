import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";

// Layout
import MainLayout from "./pages/MainLayout"; // Will be refactored Index.tsx

// Page Components
import Dashboard from "@/components/Dashboard"; // Assuming Dashboard component is the main content for /
import AIAssistant from "@/components/AIAssistant";
import ShipmentsPage from "./pages/ShipmentsPage";
import ClientsPage from "./pages/ClientsPage";
import ReportsPage from "./pages/ReportsPage";
import AnalyticsPage from "./pages/AnalyticsPage"; // Import AnalyticsPage
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} /> {/* Default route for MainLayout */}
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="shipments" element={<ShipmentsPage />} />
            <Route path="clients" element={<ClientsPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="analytics" element={<AnalyticsPage />} /> {/* Add AnalyticsPage route */}
            <Route path="ai-assistant" element={<AIAssistant />} />
            {/* Add other main feature routes here as children of MainLayout */}
          </Route>

          {/* Routes without MainLayout (e.g., login, standalone pages) would go here */}

          {/* Catch-all Not Found Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
