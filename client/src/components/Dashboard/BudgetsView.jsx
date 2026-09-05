import { useState, useMemo } from "react"
import confetti from "canvas-confetti"
import { 
  Layers, 
  Target, 
  Plus, 
  AlertTriangle, 
  Calendar, 
  Sliders
} from "lucide-react"
import AnimatedCounter from "../ui/AnimatedCounter"

const CATEGORY_COLORS = {
  Food: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', bar: 'bg-amber-500' },
  Travel: { bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500/20', bar: 'bg-sky-500' },
  Bills: { bg: 'bg-slate-800', text: 'text-slate-300', border: 'border-slate-700', bar: 'bg-slate-600' },
  Subscriptions: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20', bar: 'bg-indigo-500' },
  Entertainment: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20', bar: 'bg-purple-500' },
  Shopping: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20', bar: 'bg-rose-500' },
  Other: { bg: 'bg-slate-800', text: 'text-slate-400', border: 'border-slate-700', bar: 'bg-slate-600' }
}

export default function BudgetsView({
  budgetLimit,
  setBudgetLimit,
  budgetPercent,
  totalExpense,
  currSym = "$",
  multiplier = 1,
  categoryBudgets = {},
  handleUpdateCategoryBudget,
  setIsEnvelopeModalOpen,
  savingsGoals = [],
  handleUpdateSavingsGoals,
  setIsSavingsGoalsOpen,
  displayExpenses = []
}) {
  const [editingCategory, setEditingCategory] = useState(null)
  const [tempLimit, setTempLimit] = useState("")

  // Calculate actual spend per category
  const categorySpending = useMemo(() => {
    const map = {}
    if (Array.isArray(displayExpenses)) {
      displayExpenses.forEach(tx => {
        if (tx.type === 'expense') {
          map[tx.category] = (map[tx.category] || 0) + (Number(tx.amount) || 0)
        }
      })
    }
    return map
  }, [displayExpenses])

  const categories = Object.keys(categoryBudgets)

  const handleStartEdit = (category, currentLimit) => {
    setEditingCategory(category)
    setTempLimit(String(currentLimit))
  }

  const handleSaveCategoryLimit = (category) => {
    const val = parseFloat(tempLimit)
    if (!isNaN(val) && val >= 0) {
      handleUpdateCategoryBudget(category, val)
    }
    setEditingCategory(null)
  }

  // Quick Deposit Handler with Confetti on reaching target
  const handleQuickDeposit = (goalId, depositVal = 50) => {
    const updated = savingsGoals.map(g => {
      if (g.id === goalId) {
        const baseDepositVal = depositVal / multiplier
        const nextAmount = Math.min(g.targetAmount, (g.currentAmount || 0) + baseDepositVal)
        if (nextAmount >= g.targetAmount && (g.currentAmount || 0) < g.targetAmount) {
          try {
            confetti({
              particleCount: 80,
              spread: 60,
              origin: { y: 0.6 }
            })
          } catch (e) {}
        }
        return { ...g, currentAmount: nextAmount }
      }
      return g
    })
    handleUpdateSavingsGoals(updated)
  }

  return (
    <div className="space-y-5">
      {/* Top Section: Overall Monthly Budget Status */}
      <div className="finance-card p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-[19px] font-bold text-white tracking-tight flex items-center gap-2">
              <Layers className="h-4 w-4 text-indigo-400" />
              <span>Overall Monthly Budget</span>
            </h2>
            <p className="text-[13px] text-slate-400 font-medium mt-1">
              Target monthly spending ceiling across all categories
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-800">
              <span className="text-xs text-slate-400 font-medium">Limit:</span>
              <span className="text-xs font-semibold text-slate-400 font-mono-nums">{currSym}</span>
              <input
                type="number"
                value={Number((budgetLimit * multiplier).toFixed(0))}
                onChange={(e) => setBudgetLimit((Number(e.target.value) || 0) / multiplier)}
                className="w-20 bg-transparent text-xs font-mono-nums font-semibold text-white text-right outline-none"
              />
            </div>
            <button
              onClick={() => setIsEnvelopeModalOpen(true)}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <Sliders className="h-3.5 w-3.5" />
              <span>Envelope Manager</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-[0.06em]">Total Spent</span>
            <p className="text-[20px] sm:text-[26px] font-semibold text-white font-mono-nums mt-1 leading-tight">
              <AnimatedCounter value={totalExpense} prefix={currSym} />
            </p>
            <p className="text-xs text-slate-400 font-normal mt-0.5">Active month outlays</p>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-[0.06em]">Remaining Buffer</span>
            <p className={`text-[20px] sm:text-[26px] font-semibold font-mono-nums mt-1 leading-tight ${(budgetLimit * multiplier - totalExpense) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              <AnimatedCounter value={Math.max(0, (budgetLimit * multiplier) - totalExpense)} prefix={currSym} />
            </p>
            <p className="text-xs text-slate-400 font-normal mt-0.5">Remaining before limit</p>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-[0.06em]">Quota Utilized</span>
            <p className="text-[20px] sm:text-[26px] font-semibold text-slate-200 font-mono-nums mt-1 leading-tight">
              <AnimatedCounter value={budgetPercent} decimals={0} suffix="%" />
            </p>
            <p className="text-xs text-slate-400 font-normal mt-0.5">Of monthly limit</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 space-y-1">
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              style={{ width: `${budgetPercent}%` }}
              className={`h-full rounded-full transition-all duration-300 ${
                budgetPercent > 90
                  ? "bg-rose-500"
                  : budgetPercent > 75
                  ? "bg-amber-500"
                  : "bg-emerald-500"
              }`}
            />
          </div>
          {budgetPercent > 90 && (
            <p className="text-xs text-rose-400 font-medium flex items-center gap-1.5 pt-0.5">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>Notice: Monthly budget limit exceeded</span>
            </p>
          )}
        </div>
      </div>

      {/* Category Envelopes Grid */}
      <div className="finance-card p-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div>
            <h2 className="text-[19px] font-bold text-white tracking-tight flex items-center gap-2">
              <Sliders className="h-4 w-4 text-slate-400" />
              <span>Category Budgets</span>
            </h2>
            <p className="text-[13px] text-slate-400 font-medium mt-1">
              Click edit limit to adjust category allocation
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {categories.map((cat) => {
            const rawLimit = categoryBudgets[cat] || 0
            const limit = rawLimit * multiplier
            const spent = categorySpending[cat] || 0
            const percent = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0
            const remaining = limit - spent
            const colors = CATEGORY_COLORS[cat] || CATEGORY_COLORS.Other
            const isEditing = editingCategory === cat

            return (
              <div
                key={cat}
                className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${colors.bg} ${colors.text} ${colors.border}`}>
                    {cat}
                  </span>
                  <span className="text-xs font-mono-nums text-slate-400">
                    {percent.toFixed(0)}%
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-baseline text-xs font-mono-nums">
                    <span className="text-white font-semibold">
                      {currSym}{spent.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      of {currSym}{limit.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    </span>
                  </div>

                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        percent > 90 ? 'bg-rose-500' : percent > 75 ? 'bg-amber-500' : colors.bar
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px]">
                  <span className={`font-mono-nums ${remaining >= 0 ? 'text-slate-400' : 'text-rose-400 font-semibold'}`}>
                    {remaining >= 0 ? `${currSym}${remaining.toFixed(0)} left` : `-${currSym}${Math.abs(remaining).toFixed(0)} over`}
                  </span>

                  {isEditing ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        autoFocus
                        defaultValue={Number((rawLimit * multiplier).toFixed(0))}
                        onBlur={(e) => {
                          setEditingCategory(null)
                          handleUpdateCategoryBudget(cat, (Number(e.target.value) || 0) / multiplier)
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            setEditingCategory(null)
                            handleUpdateCategoryBudget(cat, (Number(e.target.value) || 0) / multiplier)
                          }
                        }}
                        className="w-16 bg-slate-800 border border-slate-700 rounded px-1 py-0.5 text-white text-xs font-mono-nums text-right"
                      />
                    </div>
                  ) : (
                    <button
                      onClick={() => handleStartEdit(cat, rawLimit)}
                      className="text-slate-400 hover:text-slate-200 underline text-[11px] cursor-pointer"
                    >
                      Edit Limit
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Savings Goals & Milestones */}
      <div className="finance-card p-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div>
            <h2 className="text-[19px] font-bold text-white tracking-tight flex items-center gap-2">
              <Target className="h-4 w-4 text-emerald-400" />
              <span>Savings Goals & Milestones</span>
            </h2>
            <p className="text-[13px] text-slate-400 font-medium mt-1">
              Track progress toward wealth targets
            </p>
          </div>
          <button
            onClick={() => setIsSavingsGoalsOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors cursor-pointer"
          >
            <Plus className="h-3 w-3" />
            <span>Manage Goals</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {savingsGoals.map((goal) => {
            const target = (goal.targetAmount || 1) * multiplier
            const current = (goal.currentAmount || 0) * multiplier
            const percent = Math.min((current / target) * 100, 100)
            const isCompleted = current >= target

            return (
              <div
                key={goal.id}
                className="p-4 rounded-lg bg-slate-900/60 border border-slate-800 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl p-1.5 rounded bg-slate-800 border border-slate-700">
                      {goal.emoji || "🎯"}
                    </span>
                    <div>
                      <h3 className="text-xs font-semibold text-white truncate max-w-[140px]">{goal.title}</h3>
                      {goal.targetDate && (
                        <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>Target: {goal.targetDate}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {isCompleted && (
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Completed
                    </span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-baseline font-mono-nums">
                    <span className="text-sm font-bold text-white">
                      {currSym}{current.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      of {currSym}{target.toLocaleString('en-US', { maximumFractionDigits: 0 })} ({percent.toFixed(0)}%)
                    </span>
                  </div>

                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${percent}%` }}
                      className={`h-full rounded-full transition-all duration-300 ${isCompleted ? 'bg-emerald-400' : 'bg-indigo-500'}`}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px]">
                  <span className="text-slate-400 font-mono">
                    {currSym}{Math.max(0, target - current).toLocaleString('en-US', { maximumFractionDigits: 0 })} to target
                  </span>
                  {!isCompleted && (
                    <button
                      onClick={() => handleQuickDeposit(goal.id, 100)}
                      className="px-2 py-0.5 text-[10px] font-medium bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded transition-colors cursor-pointer"
                    >
                      + Deposit {currSym}100
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
