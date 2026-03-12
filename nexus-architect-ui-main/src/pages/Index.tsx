import { AppSidebar } from '@/components/AppSidebar';
import { CommandCenter } from '@/components/CommandCenter';
import { Dashboard } from '@/components/Dashboard';
import { SimulationPanel } from '@/components/SimulationPanel';
import { CognitivePanel } from '@/components/CognitivePanel';
import { KnowledgeGraph } from '@/components/KnowledgeGraph';
import { PatternInsights } from '@/components/PatternInsights';
import { SettingsPanel } from '@/components/SettingsPanel';
import { useAppStore } from '@/store/useAppStore';
import { useAuthStore } from '@/store/useAuthStore';
import { Navigate } from 'react-router-dom';

const panels: Record<string, React.ComponentType> = {
  dashboard: Dashboard,
  simulation: SimulationPanel,
  cognitive: CognitivePanel,
  graph: KnowledgeGraph,
  command: CommandCenter,
  patterns: PatternInsights,
  settings: SettingsPanel,
};

const Index = () => {
  const activePanel = useAppStore((s) => s.activePanel);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const Panel = panels[activePanel] || Dashboard;

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#000407] transition-colors duration-500 relative">
      <div className="nu-scanlines opacity-[0.03]" />
      <div className="nu-vignette" />
      
      <AppSidebar />
      
      <main className="flex-1 overflow-hidden relative">
        {/* Cinematic Background Atmosphere */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute -top-[10%] -left-[5%] w-[50%] h-[50%] bg-[#00E6FF]/5 rounded-full blur-[150px] animate-pulse" />
          <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-[#2AF6FF]/3 rounded-full blur-[120px]" />
          <div className="absolute -bottom-[15%] left-[20%] w-[60%] h-[40%] bg-[#00E6FF]/2 rounded-full blur-[180px]" />
        </div>
        
        <div className="relative z-10 h-full">
          <Panel />
        </div>
      </main>
    </div>
  );
};

export default Index;
