import Dashboard from "./components/Dashboard/Dashboard";
import BackgroundEffects from "./components/ui/BackgroundEffects";
import { ToastProvider } from "./components/ui/Toast";

const App = () => {
  return (
    <ToastProvider>
      <div className="relative min-h-screen bg-[#070b12] text-slate-100 selection:bg-indigo-500/30 selection:text-white">
        <BackgroundEffects />
        <Dashboard />
      </div>
    </ToastProvider>
  );
};

export default App;