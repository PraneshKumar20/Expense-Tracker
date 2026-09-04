import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Radio, Repeat, Clock, Calendar, DollarSign, AlertCircle, CheckCircle2, X, Flame, CreditCard, Plus, Sparkles, ChevronRight, Bell } from "lucide-react"
import AnimatedCounter from "../ui/AnimatedCounter"

export default function SubscriptionRadarModal({
  isOpen,
  onClose,
  expenses = [],
  currencySymbol = "$",
  multiplier = 1,
  onOpenAddModal
}) {
  const [filterCategory, setFilterCategory] = useState("all")

  // Extract all recurring expenses
  const recurringSubscriptions = useMemo(() => {
    if (!Array.isArray(expenses)) return []

    return expenses
      .filter(e => e.isRecurring && e.type === 'expense')
      .map(item => {
        // Calculate estimated next billing date (same day of next month)
        const txDate = new Date(item.date || Date.now())
        const now = new Date()
        const billingDay = txDate.getDate()
        
        let nextBilling = new Date(now.getFullYear(), now.getMonth(), billingDay)
        if (nextBilling < now) {
          nextBilling = new Date(now.getFullYear(), now.getMonth() + 1, billingDay)
        }

        const diffTime = nextBilling.getTime() - now.getTime()
        const diffDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))

        return {
          ...item,
          amount: Number(item.amount) || 0,
          nextBillingDate: nextBilling.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
          daysUntilRenewal: diffDays,
          isImminent: diffDays <= 3
        }
      })
      .sort((a, b) => a.daysUntilRenewal - b.daysUntilRenewal)
  }, [expenses])

  // Summary Metrics
  const { monthlyBurn, annualBurn, upcomingCount, topSubscription } = useMemo(() => {
    const totalMonth = recurringSubscriptions.reduce((sum, item) => sum + item.amount, 0)
    const totalYear = totalMonth * 12
    const upcoming = recurringSubscriptions.filter(item => item.isImminent).length
    const top = recurringSubscriptions.length > 0
      ? [...recurringSubscriptions].sort((a, b) => b.amount - a.amount)[0]
      : null

    return {
      monthlyBurn: totalMonth,
      annualBurn: totalYear,
      upcomingCount: upcoming,
      topSubscription: top
    }
  }, [recurringSubscriptions])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="relative w-full max-w-2xl bg-slate-950/95 border border-white/[0.12] rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.9)] backdrop-blur-2xl overflow-hidden z-10 p-6 space-y-6"
          >
            {/* Top ambient highlight line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500" />

            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30 shadow-inner">
                    <Radio className="h-5 w-5 animate-pulse" />
                  </div>
                  <h2 className="text-xl font-extrabold text-white tracking-tight">
                    Subscription & Bill Radar
                  </h2>
                </div>
                <p className="text-xs text-slate-400 font-medium pl-9">
                  Automated tracking of recurring subscriptions, annual burn rate, and renewal countdowns.
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Key Burn Rate Metrics Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-900/60 border border-white/[0.08]">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  <Flame className="h-3.5 w-3.5 text-rose-400" />
                  <span>Monthly Burn</span>
                </div>
                <p className="text-xl font-extrabold text-white font-mono">
                  {currencySymbol}<AnimatedCounter value={monthlyBurn} decimals={2} />
                  <span className="text-xs font-normal text-slate-400">/mo</span>
                </p>
              </div>

              <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-white/[0.06] pt-2 sm:pt-0 sm:pl-3">
                <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  <Clock className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Annualized Cost</span>
                </div>
                <p className="text-xl font-extrabold text-white font-mono">
                  {currencySymbol}<AnimatedCounter value={annualBurn} decimals={0} />
                  <span className="text-xs font-normal text-slate-400">/yr</span>
                </p>
              </div>

              <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-white/[0.06] pt-2 sm:pt-0 sm:pl-3">
                <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  <Bell className="h-3.5 w-3.5 text-amber-400" />
                  <span>Due Soon</span>
                </div>
                <p className="text-xl font-extrabold text-white font-mono flex items-center gap-1.5">
                  <span>{upcomingCount}</span>
                  <span className="text-xs font-medium text-slate-400 font-sans">
                    {upcomingCount === 1 ? "renews this week" : "renewing soon"}
                  </span>
                </p>
              </div>
            </div>

            {/* Subscriptions List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Repeat className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Active Recurring Subscriptions ({recurringSubscriptions.length})</span>
                </h3>
                <button
                  onClick={() => {
                    onClose()
                    onOpenAddModal()
                  }}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add New</span>
                </button>
              </div>

              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {recurringSubscriptions.length === 0 ? (
                  <div className="text-center py-10 rounded-2xl bg-slate-900/40 border border-white/[0.06] text-slate-400 text-xs space-y-2">
                    <Radio className="h-8 w-8 text-slate-600 mx-auto" />
                    <p className="font-semibold text-slate-300">No active recurring commitments detected</p>
                    <p className="text-slate-500 text-[11px]">Mark any transaction as "Recurring" or add a subscription to track renewals here.</p>
                  </div>
                ) : (
                  recurringSubscriptions.map((sub) => (
                    <div
                      key={sub._id}
                      className="p-3.5 rounded-2xl bg-slate-900/50 border border-white/[0.06] hover:border-indigo-500/30 transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-slate-800/80 border border-white/[0.06] text-slate-300 group-hover:text-white group-hover:border-indigo-500/30 transition-colors">
                          <CreditCard className="h-4 w-4" />
                        </div>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                              {sub.title}
                            </span>
                            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-white/[0.05]">
                              {sub.category}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <Calendar className="h-3 w-3 text-slate-500" />
                            <span>Next: {sub.nextBillingDate}</span>
                          </div>
                        </div>
                      </div>

                      {/* Renewal Countdown Badge & Cost */}
                      <div className="text-right space-y-1">
                        <p className="font-mono font-bold text-sm text-white">
                          {currencySymbol}{sub.amount.toFixed(2)}
                          <span className="text-xs text-slate-400 font-normal">/mo</span>
                        </p>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-sm ${
                          sub.isImminent 
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' 
                            : 'bg-slate-800 border-white/[0.05] text-slate-400'
                        }`}>
                          <Clock className="h-2.5 w-2.5" />
                          {sub.daysUntilRenewal === 0 ? "Renews Today" : sub.daysUntilRenewal === 1 ? "Renews Tomorrow" : `In ${sub.daysUntilRenewal} days`}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
              <p className="text-[11px] text-slate-400">
                💡 Tip: Canceling just one $15/mo subscription frees up {currencySymbol}{(15 * multiplier * 12).toFixed(0)} every year.
              </p>
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
