import { useMemo } from "react"
import { 
  Radio, 
  Clock, 
  Calendar, 
  Plus, 
  AlertTriangle, 
  CreditCard, 
  Bell
} from "lucide-react"
import AnimatedCounter from "../ui/AnimatedCounter"

const CATEGORY_BADGES = {
  Subscriptions: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  Bills: "bg-slate-800 text-slate-300 border-slate-700",
  Food: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Travel: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  Other: "bg-slate-800 text-slate-400 border-slate-700"
}

export default function SubscriptionsView({
  displayExpenses = [],
  currencySymbol = "₹",
  multiplier = 1,
  openAddModal
}) {
  const recurringSubscriptions = useMemo(() => {
    if (!Array.isArray(displayExpenses)) return []

    return displayExpenses
      .filter(e => e.isRecurring && e.type === 'expense')
      .map(item => {
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
          billingDay
        }
      })
      .sort((a, b) => a.daysUntilRenewal - b.daysUntilRenewal)
  }, [displayExpenses])

  const { monthlyBurn, annualBurn, imminentRenewals } = useMemo(() => {
    const monthly = recurringSubscriptions.reduce((acc, curr) => acc + curr.amount, 0)
    const imminent = recurringSubscriptions.filter(s => s.daysUntilRenewal <= 3)
    return {
      monthlyBurn: monthly,
      annualBurn: monthly * 12,
      imminentRenewals: imminent
    }
  }, [recurringSubscriptions])

  return (
    <div className="space-y-5">
      {/* Top Recurring Radar KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* Monthly Recurring Burn */}
        <div className="finance-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500">Monthly Subscription Costs</span>
            <div className="p-1 rounded bg-slate-800 text-indigo-400">
              <Radio className="h-4 w-4" />
            </div>
          </div>
          <p className="text-[20px] sm:text-[26px] font-semibold text-white font-mono-nums mt-2 leading-tight">
            <AnimatedCounter value={monthlyBurn} prefix={currencySymbol} />
          </p>
          <p className="text-xs text-slate-400 font-normal mt-0.5">Recurring commitments / month</p>
        </div>

        {/* Projected Annual Burn */}
        <div className="finance-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500">Annual Projected Costs</span>
            <div className="p-1 rounded bg-slate-800 text-slate-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="text-[20px] sm:text-[26px] font-semibold text-slate-200 font-mono-nums mt-2 leading-tight">
            <AnimatedCounter value={annualBurn} prefix={currencySymbol} />
          </p>
          <p className="text-xs text-slate-400 font-normal mt-0.5">12-month recurring projection</p>
        </div>

        {/* Imminent Renewals Alert */}
        <div className="finance-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500">Renewals in &le; 3 Days</span>
            <div className={`p-1 rounded ${imminentRenewals.length > 0 ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-800 text-slate-400'}`}>
              <Bell className="h-4 w-4" />
            </div>
          </div>
          <p className={`text-[20px] sm:text-[26px] font-semibold font-mono-nums mt-2 leading-tight ${imminentRenewals.length > 0 ? 'text-amber-400' : 'text-slate-200'}`}>
            {imminentRenewals.length}
          </p>
          <p className="text-xs text-slate-400 font-normal mt-0.5">
            {imminentRenewals.length > 0 ? "Upcoming renewals requiring funds" : "No renewals in next 72 hours"}
          </p>
        </div>
      </div>

      {/* Imminent Alert Notice */}
      {imminentRenewals.length > 0 && (
        <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-amber-300">
                Notice: {imminentRenewals.length} subscription{imminentRenewals.length > 1 ? 's' : ''} renew within 3 days
              </p>
              <p className="text-xs text-amber-300/80 font-normal">
                Total debit: {currencySymbol}{imminentRenewals.reduce((a, b) => a + b.amount, 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Subscriptions List */}
      <div className="finance-card p-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div>
            <h2 className="text-[19px] font-bold text-white tracking-tight flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-slate-400" />
              <span>Active Subscriptions ({recurringSubscriptions.length})</span>
            </h2>
            <p className="text-[13px] text-slate-400 font-medium mt-1">
              Automated renewal detection and cycle countdown
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Recurring Bill</span>
          </button>
        </div>

        {recurringSubscriptions.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs space-y-1.5">
            <Radio className="h-6 w-6 text-slate-600 mx-auto" />
            <p className="font-semibold text-slate-400">No recurring subscriptions tracked</p>
            <p className="text-slate-500 max-w-sm mx-auto">
              When adding transactions, mark "Recurring" or type e.g. "Netflix monthly 15.99 subscription" in Quick Add to track them here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {recurringSubscriptions.map((sub) => {
              const isUrgent = sub.daysUntilRenewal <= 3
              const badgeClass = CATEGORY_BADGES[sub.category] || CATEGORY_BADGES.Other

              return (
                <div
                  key={sub._id}
                  className={`p-3.5 rounded-lg border transition-colors ${
                    isUrgent 
                      ? 'bg-amber-500/5 border-amber-500/30' 
                      : 'bg-slate-900/60 border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xs font-semibold text-white truncate">{sub.title}</h3>
                      <span className={`inline-block mt-1 px-1.5 py-0.2 rounded text-[10px] font-medium border ${badgeClass}`}>
                        {sub.category}
                      </span>
                    </div>

                    <span className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded border ${
                      isUrgent 
                        ? 'bg-amber-500/10 text-amber-300 border-amber-500/30' 
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}>
                      {sub.daysUntilRenewal === 0 ? "Today" : `In ${sub.daysUntilRenewal}d`}
                    </span>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-slate-400">Next cycle</p>
                      <p className="text-xs font-medium text-slate-200 mt-0.5 flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        <span>{sub.nextBillingDate}</span>
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-[10px] text-slate-400">Rate</p>
                      <p className="text-xs font-bold text-white font-mono-nums mt-0.5">
                        {currencySymbol}{sub.amount.toFixed(2)}/mo
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
