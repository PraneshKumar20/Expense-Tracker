import { 
  Activity, 
  PieChart as PieIcon, 
  TrendingDown, 
  Percent, 
  Award
} from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import FinancialHealthCard from "./FinancialHealthCard"
import AnimatedCounter from "../ui/AnimatedCounter"

const COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b']

export default function AnalyticsView({
  totalIncome,
  totalExpense,
  balance,
  budgetLimit,
  multiplier,
  currencySymbol = "₹",
  displayExpenses = [],
  savingsRate = 0,
  avgTransaction = 0,
  topCategory = { name: "None", amount: 0 },
  trendData = [],
  categoryData = [],
  totalCategoryExpense = 0,
  activeCategoryIndex,
  setActiveCategoryIndex
}) {
  const formatYAxis = (value) => {
    if (value === 0) return '0'
    if (currencySymbol === '₹') {
      if (value >= 10000000) return `${currencySymbol}${(value / 10000000).toFixed(1).replace(/\.0$/, '')}Cr`
      if (value >= 100000) return `${currencySymbol}${(value / 100000).toFixed(1).replace(/\.0$/, '')}L`
      if (value >= 1000) return `${currencySymbol}${(value / 1000).toFixed(1).replace(/\.0$/, '')}K`
      return `${currencySymbol}${value}`
    } else {
      if (value >= 1000000) return `${currencySymbol}${(value / 1000000).toFixed(1).replace(/\.0$/, '')}M`
      if (value >= 1000) return `${currencySymbol}${(value / 1000).toFixed(1).replace(/\.0$/, '')}K`
      return `${currencySymbol}${value}`
    }
  }
  const CustomTooltip = ({ active, payload, label, currencySymbol }) => {
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
              <span className="text-emerald-400 font-mono-nums font-semibold">{currencySymbol}{inc.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex items-center justify-between gap-4 text-[13px]">
              <span className="text-slate-400 font-medium">Expense</span>
              <span className="text-rose-400 font-mono-nums font-semibold">{currencySymbol}{exp.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="border-t border-slate-700/80 pt-1.5 mt-1.5 flex items-center justify-between gap-4 text-[13px]">
              <span className="text-slate-300 font-medium">Net</span>
              <span className={`font-mono-nums font-bold ${net >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {net < 0 ? '-' : '+'}{currencySymbol}{Math.abs(net).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
      {/* Top Analytics KPI Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Savings Rate */}
        <div className="finance-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500">Savings Rate</span>
            <div className="p-1 rounded bg-slate-800 text-emerald-400">
              <Percent className="h-3.5 w-3.5" />
            </div>
          </div>
          <p className="text-[20px] sm:text-[26px] font-semibold text-emerald-400 font-mono-nums mt-1 leading-tight">
            <AnimatedCounter value={savingsRate} decimals={1} suffix="%" />
          </p>
          <p className="text-xs text-slate-400 font-normal mt-0.5">Surplus retention ratio</p>
        </div>

        {/* Avg Transaction */}
        <div className="finance-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500">Average Expense</span>
            <div className="p-1 rounded bg-slate-800 text-indigo-400">
              <Activity className="h-3.5 w-3.5" />
            </div>
          </div>
          <p className="text-[20px] sm:text-[26px] font-semibold text-white font-mono-nums mt-1 leading-tight">
            <AnimatedCounter value={avgTransaction} prefix={currencySymbol} />
          </p>
          <p className="text-xs text-slate-400 font-normal mt-0.5">Average ticket per expense</p>
        </div>

        {/* Top Outflow Category */}
        <div className="finance-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500">Top Expense Category</span>
            <div className="p-1 rounded bg-slate-800 text-rose-400">
              <TrendingDown className="h-3.5 w-3.5" />
            </div>
          </div>
          <p className="text-[20px] sm:text-[26px] font-semibold text-rose-400 truncate mt-1 leading-tight">
            {topCategory.name}
          </p>
          <p className="text-xs text-slate-400 font-normal mt-0.5 font-mono-nums">
            {currencySymbol}{Number(topCategory.amount).toLocaleString('en-US', { maximumFractionDigits: 0 })} total
          </p>
        </div>

        {/* Category Count */}
        <div className="finance-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500">Categories Used</span>
            <div className="p-1 rounded bg-slate-800 text-indigo-400">
              <PieIcon className="h-3.5 w-3.5" />
            </div>
          </div>
          <p className="text-[20px] sm:text-[26px] font-semibold text-white font-mono-nums mt-1 leading-tight">
            {categoryData.length}
          </p>
          <p className="text-xs text-slate-400 font-normal mt-0.5">Active partitions</p>
        </div>
      </div>

      {/* Cashflow Velocity + Donut Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Cashflow Velocity */}
        <div className="lg:col-span-2 finance-card p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-[19px] font-bold text-white tracking-tight flex items-center gap-2">
                <Activity className="h-3.5 w-3.5 text-indigo-400" />
                <span>Cashflow Trends</span>
              </h2>
              <p className="text-[13px] text-slate-400 font-medium mt-1">Income vs expense timeline</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-[0.06em]">Income</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-[0.06em]">Expense</span>
              </div>
            </div>
          </div>

          <div className="h-[180px] pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={formatYAxis} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  content={<CustomTooltip currencySymbol={currencySymbol} />}
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

        {/* Donut Chart with Breakdown List */}
        <div className="finance-card p-5 flex flex-col justify-between">
          <div className="pb-2 border-b border-slate-800">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <PieIcon className="h-3.5 w-3.5 text-indigo-400" />
              <span>Category Allocation</span>
            </h2>
            <p className="text-xs text-slate-400 font-normal mt-0.5">Distribution of expenses</p>
          </div>

          {categoryData.length > 0 ? (
            <div className="space-y-3 pt-2">
              <div className="relative w-full h-[160px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={44}
                      outerRadius={62}
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
                          className="cursor-pointer"
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Category Breakdown Table */}
              <div className="space-y-1 max-h-[140px] overflow-y-auto pr-1">
                {categoryData.map((cat, idx) => {
                  const color = COLORS[idx % COLORS.length]
                  const percent = totalCategoryExpense > 0 ? ((cat.value / totalCategoryExpense) * 100).toFixed(1) : 0

                  return (
                    <div
                      key={cat.name}
                      onMouseEnter={() => setActiveCategoryIndex(idx)}
                      onMouseLeave={() => setActiveCategoryIndex(null)}
                      className={`flex items-center justify-between p-1.5 rounded text-xs transition-colors cursor-pointer ${
                        activeCategoryIndex === idx ? 'bg-slate-800 text-white' : 'hover:bg-slate-850 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                        <span className="font-medium truncate">{cat.name}</span>
                      </div>
                      <div className="flex items-center gap-3 font-mono-nums shrink-0">
                        <span className="text-slate-400 text-[11px]">{percent}%</span>
                        <span className="font-semibold text-white">
                          {currencySymbol}{cat.value.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-slate-500 text-xs">
              No category data available yet.
            </div>
          )}
        </div>
      </div>

      {/* Financial Health Section */}
      <FinancialHealthCard
        totalIncome={totalIncome}
        totalExpense={totalExpense}
        budgetLimit={budgetLimit * multiplier}
        expenses={displayExpenses}
        currencySymbol={currencySymbol}
      />
    </div>
  )
}
