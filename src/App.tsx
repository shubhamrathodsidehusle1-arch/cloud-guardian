import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/Layout/Sidebar";
import { TopBar } from "@/components/Layout/TopBar";
import Index from "./pages/Index.tsx";
import Scans from "./pages/Scans.tsx";
import Instances from "./pages/Instances.tsx";
import Metrics from "./pages/Metrics.tsx";
import CostAnalysis from "./pages/CostAnalysis.tsx";
import Recommendations from "./pages/Recommendations.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

function AppLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar />
          <main className="flex-1 overflow-auto">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/scans" element={<Scans />} />
              <Route path="/instances" element={<Instances />} />
              <Route path="/metrics" element={<Metrics />} />
              <Route path="/cost-analysis" element={<CostAnalysis />} />
              <Route path="/recommendations" element={<Recommendations />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
