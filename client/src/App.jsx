import Dashboard from "./components/Dashboard/Dashboard";
import BackgroundEffects from "./components/ui/BackgroundEffects";

const App = () => {
  return (
    <div className="relative min-h-screen bg-[#030712] text-foreground selection:bg-indigo-500/30 selection:text-white">
      <BackgroundEffects />
      <main className="pt-6 pb-20">
        <Dashboard />
      </main>
    </div>
  );
};

export default App;