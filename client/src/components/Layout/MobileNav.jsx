import { 
  LayoutDashboard, 
  Receipt, 
  BarChart3, 
  Layers, 
  Plus, 
  Command, 
  Wallet
} from "lucide-react"

export default function MobileNav({
  activeTab,
  setActiveTab,
  onOpenAddModal,
  onOpenQuickAdd,
  currency,
  setCurrency
}) {
  return (
    <>
      {/* Mobile Top App Bar */}
      <header className="lg:hidden sticky top-0 z-40 bg-[#0b101b] border-b border-slate-800 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded bg-indigo-600 flex items-center justify-center text-white">
            <Wallet className="h-3.5 w-3.5" />
          </div>
          <span className="font-bold text-sm tracking-tight text-white">LedgerFlow</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Currency Switcher */}
          <div className="flex bg-slate-900 p-0.5 rounded border border-slate-800">
            {["USD", "INR"].map((c) => {
              const active = currency === c
              return (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  className={`px-2 py-0.5 text-[11px] font-mono-nums font-semibold rounded cursor-pointer transition-colors ${
                    active ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {c}
                </button>
              )
            })}
          </div>

          {/* Quick Add Cmd+K Button */}
          <button
            onClick={onOpenQuickAdd}
            className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-white cursor-pointer transition-colors"
            title="Quick Add"
          >
            <Command className="h-3.5 w-3.5" />
          </button>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0b101b] border-t border-slate-800 px-2 py-1.5 pb-safe shadow-lg">
        <div className="flex items-center justify-around relative">
          {/* Overview */}
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex flex-col items-center justify-center py-1 px-3 transition-colors cursor-pointer ${
              activeTab === "overview" ? "text-indigo-400 font-semibold" : "text-slate-400 hover:text-slate-200 font-medium"
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span className="text-[11px] mt-1">Overview</span>
          </button>

          {/* Transactions */}
          <button
            onClick={() => setActiveTab("transactions")}
            className={`flex flex-col items-center justify-center py-1 px-3 transition-colors cursor-pointer ${
              activeTab === "transactions" ? "text-indigo-400 font-semibold" : "text-slate-400 hover:text-slate-200 font-medium"
            }`}
          >
            <Receipt className="h-4 w-4" />
            <span className="text-[11px] mt-1">Ledger</span>
          </button>

          {/* Center (+) New Transaction Action */}
          <div className="relative -top-2">
            <button
              onClick={onOpenAddModal}
              className="h-10 w-10 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-md border-2 border-[#0b101b] active:scale-95 transition-transform cursor-pointer"
              title="Add Transaction"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>

          {/* Analytics */}
          <button
            onClick={() => setActiveTab("analytics")}
            className={`flex flex-col items-center justify-center py-1 px-3 transition-colors cursor-pointer ${
              activeTab === "analytics" ? "text-indigo-400 font-semibold" : "text-slate-400 hover:text-slate-200 font-medium"
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span className="text-[11px] mt-1">Analytics</span>
          </button>

          {/* Budgets & Radar */}
          <button
            onClick={() => setActiveTab("budgets")}
            className={`flex flex-col items-center justify-center py-1 px-3 transition-colors cursor-pointer ${
              activeTab === "budgets" || activeTab === "subscriptions" ? "text-indigo-400 font-semibold" : "text-slate-400 hover:text-slate-200 font-medium"
            }`}
          >
            <Layers className="h-4 w-4" />
            <span className="text-[11px] mt-1">Budgets</span>
          </button>
        </div>
      </nav>
    </>
  )
}
