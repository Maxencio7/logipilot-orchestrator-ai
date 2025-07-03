
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
import AlertsPage from "./pages/AlertsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import FleetPage from "./pages/FleetPage";
import TrackingPage from "./pages/TrackingPage";
import SettingsPage from "./pages/SettingsPage";
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
            <Route path="alerts" element={<AlertsPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="fleet" element={<FleetPage />} />
            <Route path="tracking" element={<TrackingPage />} />
            <Route path="ai-assistant" element={<AIAssistant />} />
            <Route path="settings" element={<SettingsPage />} />
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
