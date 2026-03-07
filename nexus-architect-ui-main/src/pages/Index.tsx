import { AppSidebar } from '@/components/AppSidebar';
import { CommandCenter } from '@/components/CommandCenter';
import { Dashboard } from '@/components/Dashboard';
import { SimulationPanel } from '@/components/SimulationPanel';
import { CognitivePanel } from '@/components/CognitivePanel';
import { KnowledgeGraph } from '@/components/KnowledgeGraph';
import { PatternInsights } from '@/components/PatternInsights';
import { SettingsPanel } from '@/components/SettingsPanel';
import { LoginPage } from '@/components/LoginPage';
import { useAppStore } from '@/store/useAppStore';
import { useAuthStore } from '@/store/useAuthStore';

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

  if (!isAuthenticated) return <LoginPage />;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background transition-colors duration-300">
      <AppSidebar />
      <main className="flex-1 overflow-hidden relative">
        {/* Background Ambient Glow */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0 opacity-20 dark:opacity-100">
          <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-primary/5 rounded-full blur-[120px]" />
          <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-blue-500/5 rounded-full blur-[120px]" />
        </div>
        
        <div className="relative z-10 h-full">
          <Panel />
        </div>
      </main>
    </div>
  );
};

export default Index;
