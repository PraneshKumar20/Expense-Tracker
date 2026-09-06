import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Radio, Repeat, Clock, Calendar, DollarSign, AlertCircle, CheckCircle2, X, Flame, CreditCard, Plus, Sparkles, ChevronRight, Bell } from "lucide-react"
import AnimatedCounter from "../ui/AnimatedCounter"

export default function SubscriptionRadarModal({
  isOpen,
  onClose,
  expenses = [],
  currencySymbol = "₹",
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
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 10 }}
            transition={{ duration: 0.15 }}
            className="relative w-full max-w-2xl bg-[#0f1523] border border-slate-800 rounded-lg shadow-2xl overflow-hidden z-10 p-5 space-y-4"
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded bg-slate-800 text-slate-300">
                    <Radio className="h-4 w-4" />
                  </div>
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    Subscription & Bill Radar
                  </h2>
                </div>
                <p className="text-xs text-slate-400 font-normal mt-0.5">
                  Tracking of recurring commitments, annual burn, and renewal cycles.
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Key Burn Rate Metrics Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-lg bg-slate-900 border border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] uppercase font-semibold tracking-[0.06em] text-slate-500">
                  <Flame className="h-3.5 w-3.5 text-rose-400" />
                  <span>Monthly Burn</span>
                </div>
                <p className="text-xl font-semibold text-white font-mono-nums">
                  {currencySymbol}<AnimatedCounter value={monthlyBurn} decimals={2} />
                  <span className="text-xs font-normal text-slate-400">/mo</span>
                </p>
              </div>

              <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-slate-800 pt-2 sm:pt-0 sm:pl-3">
                <div className="flex items-center gap-1.5 text-[11px] uppercase font-semibold tracking-[0.06em] text-slate-500">
                  <Clock className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Annualized Cost</span>
                </div>
                <p className="text-xl font-semibold text-white font-mono-nums">
                  {currencySymbol}<AnimatedCounter value={annualBurn} decimals={0} />
                  <span className="text-xs font-normal text-slate-400">/yr</span>
                </p>
              </div>

              <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-slate-800 pt-2 sm:pt-0 sm:pl-3">
                <div className="flex items-center gap-1.5 text-[11px] uppercase font-semibold tracking-[0.06em] text-slate-500">
                  <Bell className="h-3.5 w-3.5 text-amber-400" />
                  <span>Due Soon</span>
                </div>
                <p className="text-xl font-semibold text-white font-mono-nums flex items-center gap-1.5">
                  <span>{upcomingCount}</span>
                  <span className="text-xs font-normal text-slate-400 font-sans">
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
                  <div className="text-center py-10 rounded-lg bg-[#0b101b] border border-slate-800 text-slate-400 text-xs space-y-2">
                    <Radio className="h-6 w-6 text-slate-600 mx-auto" />
                    <p className="font-semibold text-slate-300">No active recurring commitments detected</p>
                    <p className="text-slate-500 text-[11px]">Mark any transaction as "Recurring" or add a subscription to track renewals here.</p>
                  </div>
                ) : (
                  recurringSubscriptions.map((sub) => (
                    <div
                      key={sub._id}
                      className="p-3 rounded-lg bg-[#0b101b] border border-slate-800 hover:border-slate-700 transition-colors flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-md bg-slate-900 border border-slate-800 text-slate-300 group-hover:text-white transition-colors">
                          <CreditCard className="h-4 w-4" />
                        </div>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-white">
                              {sub.title}
                            </span>
                            <span className="text-[10px] uppercase font-medium px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
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
                        <p className="font-mono-nums font-semibold text-sm text-white">
                          {currencySymbol}{sub.amount.toFixed(2)}
                          <span className="text-xs text-slate-400 font-normal">/mo</span>
                        </p>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded border ${
                          sub.isImminent 
                            ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' 
                            : 'bg-slate-800 border-slate-700 text-slate-400'
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
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <p className="text-[11px] text-slate-400">
                Canceling just one $15/mo subscription frees up {currencySymbol}{(15 * multiplier * 12).toFixed(0)} every year.
              </p>
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors cursor-pointer"
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
