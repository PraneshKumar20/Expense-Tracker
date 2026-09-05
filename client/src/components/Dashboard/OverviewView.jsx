import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Layers, 
  AlertTriangle, 
  Activity, 
  PieChart as PieIcon, 
  ArrowRight, 
  Receipt,
  Repeat,
  Edit2,
  Trash2,
  ChevronRight
} from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import AnimatedCounter from "../ui/AnimatedCounter"

const COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b']

const CATEGORY_BADGES = {
  Food: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Salary: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Travel: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  Bills: "bg-slate-800 text-slate-300 border-slate-700",
  Subscriptions: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  Entertainment: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  Shopping: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  Other: "bg-slate-800 text-slate-400 border-slate-700"
}

export default function OverviewView({
  balance,
  totalIncome,
  totalExpense,
  currSym,
  multiplier,
  incomeShare,
  budgetPercent,
  budgetLimit,
  setBudgetLimit,
  trendData,
  categoryData,
  totalCategoryExpense,
  activeCategoryIndex,
  setActiveCategoryIndex,
  displayExpenses,
  openEditModal,
  handleDeleteTransaction,
  setIsEnvelopeModalOpen,
  setActiveTab
}) {
  const recentTransactions = [...displayExpenses]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  const formatYAxis = (value) => {
    if (value === 0) return '0'
    if (currSym === '₹') {
      if (value >= 10000000) return `${currSym}${(value / 10000000).toFixed(1).replace(/\.0$/, '')}Cr`
      if (value >= 100000) return `${currSym}${(value / 100000).toFixed(1).replace(/\.0$/, '')}L`
      if (value >= 1000) return `${currSym}${(value / 1000).toFixed(1).replace(/\.0$/, '')}K`
      return `${currSym}${value}`
    } else {
      if (value >= 1000000) return `${currSym}${(value / 1000000).toFixed(1).replace(/\.0$/, '')}M`
      if (value >= 1000) return `${currSym}${(value / 1000).toFixed(1).replace(/\.0$/, '')}K`
      return `${currSym}${value}`
    }
  }
  const CustomTooltip = ({ active, payload, label, currSym }) => {
    if (active && payload && payload.length) {
      const inc = payload.find(p => p.dataKey === 'income')?.value || 0
      const exp = payload.find(p => p.dataKey === 'expense')?.value || 0
      const net = inc - exp
      return (
        <div className="bg-[#0f1523] border border-slate-700 p-3 rounded-lg shadow-xl min-w-[160px]">
          <p className="text-slate-300 text-[11px] font-semibold uppercase tracking-wider mb-2">{label}</p>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-4 text-[13px]">
              <span className="text-slate-400 font-medium">Income</span>
              <span className="text-emerald-400 font-mono-nums font-semibold">{currSym}{inc.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex items-center justify-between gap-4 text-[13px]">
              <span className="text-slate-400 font-medium">Expense</span>
              <span className="text-rose-400 font-mono-nums font-semibold">{currSym}{exp.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="border-t border-slate-700/80 pt-1.5 mt-1.5 flex items-center justify-between gap-4 text-[13px]">
              <span className="text-slate-300 font-medium">Net</span>
              <span className={`font-mono-nums font-bold ${net >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {net < 0 ? '-' : '+'}{currSym}{Math.abs(net).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-5">
      {/* Top Financial Stat Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Net Balance Card */}
        <div className="lg:col-span-2 finance-card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500">
              Total Net Balance
            </span>
            <div className="p-1 rounded bg-slate-800 text-slate-300">
              <Wallet className="h-3.5 w-3.5" />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="text-[32px] sm:text-[40px] font-bold text-white tracking-[-0.035em] font-mono-nums leading-none">
                <AnimatedCounter value={balance} prefix={currSym} />
              </div>
              <p className="text-[13px] sm:text-[14px] text-slate-400 font-medium mt-1.5 leading-relaxed">
                Current net position across active accounts
              </p>
            </div>

            {/* Income vs Expense Ratio Split */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-[11px] font-mono-nums font-semibold tracking-wide">
                <span className="text-emerald-400">
                  Income: {incomeShare.toFixed(0)}%
                </span>
                <span className="text-rose-400">
                  Expense: {(100 - incomeShare).toFixed(0)}%
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
                <div 
                  style={{ width: `${incomeShare}%` }} 
                  className="bg-emerald-500 h-full transition-all duration-500" 
                />
                <div 
                  style={{ width: `${100 - incomeShare}%` }} 
                  className="bg-rose-500 h-full transition-all duration-500" 
                />
              </div>
            </div>

            {/* Income & Expense Subtotals */}
            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-800">
              <div>
                <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-[0.06em] flex items-center gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-400" /> Monthly Income
                </p>
                <p className="text-[20px] sm:text-[24px] font-semibold text-emerald-400 font-mono-nums mt-0.5 leading-tight">
                  <AnimatedCounter value={totalIncome} prefix={currSym} />
                </p>
              </div>
              <div className="pl-4 border-l border-slate-800">
                <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-[0.06em] flex items-center gap-1.5">
                  <TrendingDown className="h-3.5 w-3.5 text-rose-400" /> Monthly Expenses
                </p>
                <p className="text-[20px] sm:text-[24px] font-semibold text-rose-400 font-mono-nums mt-0.5 leading-tight">
                  <AnimatedCounter value={totalExpense} prefix={currSym} />
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Budget Card */}
        <div className="finance-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500">
                Budget Usage
              </span>
              <button
                onClick={() => setIsEnvelopeModalOpen(true)}
                className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Layers className="h-3 w-3" />
                Envelopes
              </button>
            </div>

            <div className="space-y-3 mt-1">
              <div className="flex justify-between items-baseline">
                <span className="text-[32px] sm:text-[40px] font-bold text-white font-mono-nums tracking-[-0.035em] leading-none">
                  <AnimatedCounter value={budgetPercent} decimals={0} suffix="%" />
                </span>
                <span className="text-[13px] text-slate-400 font-mono-nums font-medium">
                  of {currSym}{(budgetLimit * multiplier).toLocaleString()}
                </span>
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
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
                  <p className="text-[11px] text-rose-400 font-medium flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3 shrink-0" /> Budget threshold exceeded
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">Monthly Limit:</span>
            <div className="flex items-center gap-1">
              <span className="text-xs text-slate-400 font-mono">{currSym}</span>
              <input
                type="number"
                value={Number((budgetLimit * multiplier).toFixed(0))}
                onChange={(e) => setBudgetLimit((Number(e.target.value) || 0) / multiplier)}
                className="w-20 bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-xs font-mono text-white text-right outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Navigation Portals Card */}
        <div className="finance-card p-5 flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Quick Portals
            </span>
            <p className="text-xs text-slate-400 mt-0.5">Jump to specific ledgers</p>
          </div>

          <div className="space-y-0.5 my-2">
            <button
              onClick={() => setActiveTab("transactions")}
              className="w-full flex items-center justify-between p-2 rounded hover:bg-slate-800/40 text-xs font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Receipt className="h-3.5 w-3.5 text-indigo-400" />
                <span>Full Ledger</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-slate-500 opacity-50" />
            </button>

            <button
              onClick={() => setActiveTab("budgets")}
              className="w-full flex items-center justify-between p-2 rounded hover:bg-slate-800/40 text-xs font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Target className="h-3.5 w-3.5 text-emerald-400" />
                <span>Savings Goals</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-slate-500 opacity-50" />
            </button>

            <button
              onClick={() => setActiveTab("subscriptions")}
              className="w-full flex items-center justify-between p-2 rounded hover:bg-slate-800/40 text-xs font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Repeat className="h-3.5 w-3.5 text-purple-400" />
                <span>Recurring Bills</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-slate-500 opacity-50" />
            </button>
          </div>

          <button
            onClick={() => setActiveTab("analytics")}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer pt-1"
          >
            <span>View 4-Pillar Diagnostic</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Cashflow Velocity & Expense Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 7-Day Cashflow Velocity */}
        <div className="lg:col-span-2 finance-card p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded bg-slate-800 text-indigo-400">
                <Activity className="h-3.5 w-3.5" />
              </div>
              <span className="text-sm font-semibold text-white tracking-tight">
                7-Day Cashflow Velocity
              </span>
            </div>
            <div className="flex items-center gap-4 text-[11px] font-medium">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-slate-400">Income</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                <span className="text-slate-400">Expense</span>
              </div>
            </div>
          </div>

          <div className="h-[180px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={formatYAxis} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  content={<CustomTooltip currSym={currSym} />}
                />
                <Bar 
                  dataKey="income" 
                  fill="#10b981" 
                  radius={[3, 3, 0, 0]} 
                  name="Income" 
                  maxBarSize={28}
                  minPointSize={6} 
                />
                <Bar 
                  dataKey="expense" 
                  fill="#f43f5e" 
                  radius={[3, 3, 0, 0]} 
                  name="Expense" 
                  maxBarSize={28}
                  minPointSize={6} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Category Donut */}
        <div className="finance-card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded bg-slate-800 text-indigo-400">
                <PieIcon className="h-3.5 w-3.5" />
              </div>
              <span className="text-sm font-semibold text-white tracking-tight">
                Spend Breakdown
              </span>
            </div>
          </div>

          {categoryData.length > 0 ? (
            <div className="flex flex-col justify-between flex-1 pt-2">
              <div className="relative w-full h-[180px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={46}
                      outerRadius={66}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="#0f1523"
                      strokeWidth={2}
                      onMouseEnter={(_, index) => setActiveCategoryIndex(index)}
                      onMouseLeave={() => setActiveCategoryIndex(null)}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[index % COLORS.length]} 
                          opacity={activeCategoryIndex === null || activeCategoryIndex === index ? 1 : 0.4}
                          className="cursor-pointer transition-opacity"
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>

                {/* Centered HUD */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  {activeCategoryIndex !== null && categoryData[activeCategoryIndex] ? (
                    <div className="flex flex-col items-center justify-center text-center px-1">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 truncate max-w-[90px]">
                        {categoryData[activeCategoryIndex].name}
                      </span>
                      <span className="text-sm font-bold text-white font-mono leading-tight">
                        {currSym}{categoryData[activeCategoryIndex].value.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5">
                        {totalCategoryExpense > 0 ? ((categoryData[activeCategoryIndex].value / totalCategoryExpense) * 100).toFixed(0) : 0}%
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center px-2">
                      <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                        TOTAL SPENT
                      </span>
                      <span className="text-sm font-bold text-white font-mono leading-tight">
                        {currSym}{totalCategoryExpense.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5">
                        {categoryData.length} categories
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Category Pills */}
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 pt-4 mt-2 border-t border-slate-800/80">
                {categoryData.slice(0, 5).map((cat, idx) => {
                  const color = COLORS[idx % COLORS.length]
                  const percent = totalCategoryExpense > 0 ? ((cat.value / totalCategoryExpense) * 100).toFixed(0) : 0
                  const isHovered = activeCategoryIndex === idx

                  return (
                    <button
                      key={cat.name}
                      onMouseEnter={() => setActiveCategoryIndex(idx)}
                      onMouseLeave={() => setActiveCategoryIndex(null)}
                      className={`flex items-center gap-1.5 text-[11px] transition-colors cursor-pointer ${
                        isHovered ? 'text-white' : 'text-slate-400 hover:text-slate-300'
                      }`}
                    >
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                      <span className="font-medium">{cat.name}</span>
                      <span className="font-mono opacity-60 ml-0.5">{percent}%</span>
                    </button>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-500 py-10 text-xs">
              No expenses recorded yet.
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions List */}
      <div className="finance-card p-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-[19px] font-bold text-white tracking-tight">
              Recent Transactions
            </h2>
            <p className="text-[13px] text-slate-400 font-medium mt-1">Latest entries in your journal</p>
          </div>

          <button
            onClick={() => setActiveTab("transactions")}
            className="flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
          >
            <span>View All ({displayExpenses.length})</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        <div className="divide-y divide-slate-800/80 mt-1">
          {recentTransactions.length === 0 ? (
            <div className="py-6 text-center text-slate-500 text-xs">
              No transactions logged yet. Click "+ New Transaction" to create one.
            </div>
          ) : (
            recentTransactions.map((tx) => {
              const isIncome = tx.type === "income"
              const badgeClass = CATEGORY_BADGES[tx.category] || CATEGORY_BADGES.Other

              return (
                <div 
                  key={tx._id} 
                  className="py-2.5 flex items-center justify-between hover:bg-slate-800/40 px-2 rounded transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-1.5 rounded shrink-0 ${isIncome ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                      {isIncome ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-200 truncate">{tx.title}</span>
                        {tx.isRecurring && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold uppercase font-mono-nums bg-slate-800 text-slate-300 border border-slate-700">
                            Recurring
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded border ${badgeClass}`}>
                          {tx.category}
                        </span>
                        <span className="text-xs text-slate-400 font-normal">
                          {new Date(tx.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`font-mono-nums font-semibold text-[13px] ${isIncome ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isIncome ? '+' : '-'}{currSym}{Number(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEditModal(tx)}
                        className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Edit"
                      >
                        <Edit2 className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => handleDeleteTransaction(tx._id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
