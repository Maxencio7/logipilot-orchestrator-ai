import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom"; // Outlet removed as it's used in MainLayout

// Layout
import MainLayout from "./pages/MainLayout";

// Page Components
import Dashboard from "@/components/Dashboard";
import AIAssistant from "@/components/AIAssistant";
import ShipmentsPage from "./pages/ShipmentsPage";
import ClientsPage from "./pages/ClientsPage";
import ReportsPage from "./pages/ReportsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import FleetPage from "./pages/FleetPage";
import TrackingPage from "./pages/TrackingPage";
import FinancialsPage from "./pages/FinancialsPage";
import SettingsPage from "./pages/SettingsPage";
import LoginPage from "./pages/LoginPage";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./hooks/useAuth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Routes with MainLayout */}
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="shipments" element={<ShipmentsPage />} />
              <Route path="clients" element={<ClientsPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="fleet" element={<FleetPage />} />
              <Route path="tracking" element={<TrackingPage />} />
              <Route path="financials" element={<FinancialsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="ai-assistant" element={<AIAssistant />} />
            </Route>

            {/* Routes without MainLayout */}
            <Route path="/login" element={<LoginPage />} />

            {/* Catch-all Not Found Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
