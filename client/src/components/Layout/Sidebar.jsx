import { useState } from "react"
import { 
  LayoutDashboard, 
  Receipt, 
  BarChart3, 
  Layers, 
  Radio, 
  Plus, 
  Command, 
  Database, 
  LogOut, 
  Wallet,
  CheckCircle2,
  ArrowRight
} from "lucide-react"
import { parseQuickAdd } from "../../utils/quickAddParser"

const SAMPLE_PROMPTS = [
  "Spent ₹45 on groceries yesterday",
  "Uber ride to airport ₹28 travel",
  "Freelance client design ₹850 salary",
  "Netflix monthly ₹15.99 subscription",
  "Electricity bill ₹115 bills"
]

export default function Sidebar({
  activeTab,
  setActiveTab,
  onOpenAddModal,
  onOpenQuickAdd,
  onSeedDemo,
  transactionCount = 0,
  recurringCount = 0,
  healthGrade = "A",
  goalsCount = 0,
  currency,
  setCurrency,
  currentUser,
  onLogout,
  onSaveTransaction
}) {
  const [quickAddQuery, setQuickAddQuery] = useState("")
  const [isQuickAddFocused, setIsQuickAddFocused] = useState(false)
  const [quickAddSuccess, setQuickAddSuccess] = useState(false)

  const handleQuickAddKeyDown = (e) => {
    if (e.key === "Enter") {
      if (!quickAddQuery.trim()) return
      const parsed = parseQuickAdd(quickAddQuery)
      if (parsed && parsed.isValid) {
        onSaveTransaction(parsed)
        setQuickAddQuery("")
        setQuickAddSuccess(true)
        setTimeout(() => setQuickAddSuccess(false), 2000)
      }
    }
  }

  const handlePromptClick = (promptStr) => {
    setQuickAddQuery(promptStr)
    // Optional: auto-submit? Let's just fill it so they can press Enter or see it parsed.
    // For now we just fill it.
  }
  const navItems = [
    {
      id: "overview",
      label: "Overview",
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: "transactions",
      label: "Transactions",
      icon: Receipt,
      badge: transactionCount > 0 ? transactionCount : null
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: BarChart3,
      badge: healthGrade ? `Grade ${healthGrade}` : null,
      badgeColor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
    },
    {
      id: "budgets",
      label: "Budgets & Goals",
      icon: Layers,
      badge: goalsCount > 0 ? `${goalsCount} Goals` : null,
      badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
    },
    {
      id: "subscriptions",
      label: "Bill Radar",
      icon: Radio,
      badge: recurringCount > 0 ? recurringCount : null,
      badgeColor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
    }
  ]

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-[#0b101b] border-r border-slate-800/80 h-screen sticky top-0 z-40 select-none">
      {/* Brand Header */}
      <div className="p-5 pb-4 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
            <Wallet className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-white">LedgerFlow</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold font-mono-nums uppercase bg-slate-800 text-slate-300 border border-slate-700">
                PRO
              </span>
            </div>
            <p className="text-xs text-slate-400 font-normal">Personal Financial Command</p>
          </div>
        </div>
      </div>
      {/* Navigation Section */}
      <div className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        <p className="px-2.5 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500">
          Navigation
        </p>

        {navItems.map((item) => {
          const isActive = activeTab === item.id
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[13.5px] transition-colors cursor-pointer ${
                isActive
                  ? "text-white font-semibold bg-slate-800/90 border border-slate-700/80 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 font-medium"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`h-4 w-4 ${isActive ? "text-indigo-400" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`text-[10px] font-mono-nums font-medium px-2 py-0.5 rounded border ${
                    item.badgeColor || "bg-slate-800 text-slate-300 border-slate-700"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          )
        })}

        <div className="pt-4 px-2.5 pb-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500">
            Quick Add
          </p>
        </div>

        <div className="px-2.5 pb-2">
          <div className={`relative flex items-center rounded-lg border transition-colors ${isQuickAddFocused ? 'border-indigo-500/50 bg-slate-900/80' : 'border-slate-800/80 bg-slate-900/40'}`}>
            <Command className="h-3.5 w-3.5 text-slate-500 absolute left-2.5" />
            <input
              type="text"
              value={quickAddQuery}
              onChange={(e) => setQuickAddQuery(e.target.value)}
              onFocus={() => setIsQuickAddFocused(true)}
              onBlur={() => setTimeout(() => setIsQuickAddFocused(false), 200)}
              onKeyDown={handleQuickAddKeyDown}
              placeholder="Type naturally..."
              className="w-full bg-transparent text-[13px] text-white placeholder:text-slate-600 outline-none py-2 pl-8 pr-8"
            />
            {quickAddSuccess ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 absolute right-2.5" />
            ) : (
              <div className="absolute right-2 text-[9px] font-mono-nums font-semibold text-slate-500 bg-slate-800 px-1 py-0.5 rounded border border-slate-700">
                ↵
              </div>
            )}
          </div>
          
          {/* Contextual Suggestions */}
          {isQuickAddFocused && !quickAddQuery && (
            <div className="mt-1.5 space-y-1">
              {SAMPLE_PROMPTS.slice(0, 3).map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePromptClick(prompt)}
                  className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded hover:bg-slate-900/60 text-left cursor-pointer group"
                >
                  <ArrowRight className="h-3 w-3 text-slate-600 group-hover:text-indigo-400 transition-colors shrink-0" />
                  <span className="text-[11px] text-slate-500 group-hover:text-slate-300 truncate">{prompt}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="pt-2 px-2.5 pb-1 border-t border-slate-800/60">
          <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500">
            Settings & Data
          </p>
        </div>

        {/* Currency Selector */}
        <div className="px-2.5 py-2 bg-slate-900/60 rounded-lg border border-slate-800/80 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium">Currency</span>
          <div className="flex bg-slate-950 p-0.5 rounded border border-slate-800">
            {["INR", "USD"].map((c) => {
              const active = currency === c
              return (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  className={`px-2 py-0.5 text-[11px] font-semibold rounded cursor-pointer ${
                    active
                      ? "bg-indigo-600 text-white"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {c === "USD" ? "$ USD" : "₹ INR"}
                </button>
              )
            })}
          </div>
        </div>

        {/* Seed Demo button */}
        <button
          onClick={onSeedDemo}
          className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 transition-colors cursor-pointer"
        >
          <Database className="h-3.5 w-3.5 text-slate-400" />
          <span>Reset Demo Data</span>
        </button>
      </div>

      {/* User Profile & Sign Out Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
        <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-7 w-7 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-200 shrink-0">
              {currentUser?.name ? currentUser.name.slice(0, 2).toUpperCase() : "PL"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                {currentUser?.name || "Personal Ledger"}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                {currentUser?.isGuest ? "Guest Mode" : currentUser?.email || "Active User"}
              </p>
            </div>
          </div>
          <button
            onClick={onLogout}
            title="Sign Out"
            className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors cursor-pointer shrink-0"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
