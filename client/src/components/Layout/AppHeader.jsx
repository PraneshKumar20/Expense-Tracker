import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Command, 
  Plus, 
  ChevronDown, 
  LogOut 
} from "lucide-react"

export default function AppHeader({
  activeTab,
  onOpenAddModal,
  onOpenQuickAdd,
  currentUser,
  onLogout
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const titles = {
    overview: {
      title: "Financial Overview",
      subtitle: "Your complete financial picture, at a glance."
    },
    transactions: {
      title: "Transaction Ledger",
      subtitle: "Comprehensive journal of income, expenses, and recurring outflows"
    },
    analytics: {
      title: "Analytics & Insights",
      subtitle: "Financial health audit, spend distribution, and trend patterns"
    },
    budgets: {
      title: "Budgets & Milestones",
      subtitle: "Category envelope limits, monthly quotas, and milestone savings goals"
    },
    subscriptions: {
      title: "Recurring Subscriptions",
      subtitle: "Proactive tracking of active subscriptions and cycle renewals"
    }
  }

  const current = titles[activeTab] || titles.overview

  return (
    <header className="hidden lg:flex items-center justify-between pb-5 border-b border-slate-800 mb-6">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-[32px] sm:text-[36px] font-bold text-white tracking-[-0.035em] leading-tight">
            {current.title}
          </h1>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono-nums font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            LIVE
          </div>
        </div>
        <p className="text-[13px] sm:text-sm text-slate-400 mt-1 font-medium leading-relaxed">{current.subtitle}</p>
      </div>

      <div className="flex items-center gap-2.5">


        {/* New Transaction Button */}
        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold tracking-wide transition-colors cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Transaction</span>
        </button>

        {/* User Session Menu */}
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="flex items-center gap-2 p-1.5 pr-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer"
          >
            <div className="h-6 w-6 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-300 uppercase">
              {currentUser?.name ? currentUser.name.slice(0, 2).toUpperCase() : "PL"}
            </div>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>

          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 4, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.98 }}
                transition={{ duration: 0.1 }}
                className="absolute right-0 mt-2 w-52 rounded-lg bg-slate-900 border border-slate-800 shadow-xl p-1.5 z-50 space-y-1"
              >
                <div className="px-2.5 py-1.5 border-b border-slate-800">
                  <p className="text-xs font-semibold text-white truncate">{currentUser?.name || "Explorer"}</p>
                  <p className="text-[10px] text-slate-400 truncate">{currentUser?.email || "guest@ledgerflow.app"}</p>
                  {currentUser?.isGuest && (
                    <span className="inline-block mt-1 px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[9px] font-medium">
                      Demo Mode
                    </span>
                  )}
                </div>
                <button
                  onClick={onLogout}
                  className="w-full px-2.5 py-1.5 rounded text-left text-xs font-medium text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
