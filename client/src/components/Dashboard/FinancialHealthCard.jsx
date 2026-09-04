import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Sparkles, ShieldCheck, TrendingUp, AlertTriangle, CheckCircle2, ChevronRight, X, Award, Zap, ArrowUpRight, DollarSign } from "lucide-react"
import AnimatedCounter from "../ui/AnimatedCounter"

export default function FinancialHealthCard({ 
  totalIncome, 
  totalExpense, 
  budgetLimit, 
  expenses = [], 
  currencySymbol = "$" 
}) {
  const [isReportOpen, setIsReportOpen] = useState(false)

  // --- Intelligent Scoring Engine ---
  const { 
    totalScore, 
    grade, 
    statusColor, 
    statusBg,
    statusText,
    pillars, 
    recommendations 
  } = useMemo(() => {
    // 1. Savings Pillar (0 - 35 points)
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0
    let savingsScore = 0
    if (savingsRate >= 30) savingsScore = 35
    else if (savingsRate >= 20) savingsScore = 28
    else if (savingsRate >= 10) savingsScore = 20
    else if (savingsRate > 0) savingsScore = 12
    else savingsScore = 5

    // 2. Budget Adherence Pillar (0 - 30 points)
    const budgetUsage = budgetLimit > 0 ? (totalExpense / budgetLimit) * 100 : 100
    let budgetScore = 0
    if (budgetUsage <= 60) budgetScore = 30
    else if (budgetUsage <= 75) budgetScore = 25
    else if (budgetUsage <= 90) budgetScore = 18
    else if (budgetUsage <= 100) budgetScore = 10
    else budgetScore = 3

    // 3. Cashflow Stability Pillar (0 - 20 points)
    const hasSurplus = totalIncome > totalExpense
    const bufferRatio = totalIncome > 0 ? (totalIncome - totalExpense) / totalIncome : 0
    let stabilityScore = 0
    if (hasSurplus && bufferRatio >= 0.25) stabilityScore = 20
    else if (hasSurplus) stabilityScore = 14
    else if (totalIncome === 0 && totalExpense === 0) stabilityScore = 10
    else stabilityScore = 4

    // 4. Fixed & Recurring Burden Pillar (0 - 15 points)
    const recurringExpense = Array.isArray(expenses)
      ? expenses.filter(e => e.isRecurring && e.type === 'expense').reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
      : 0
    const recurringRatio = totalExpense > 0 ? (recurringExpense / totalExpense) * 100 : 0
    let recurringScore = 0
    if (recurringRatio <= 20) recurringScore = 15
    else if (recurringRatio <= 35) recurringScore = 11
    else if (recurringRatio <= 50) recurringScore = 7
    else recurringScore = 3

    const finalScore = Math.min(100, Math.max(10, Math.round(savingsScore + budgetScore + stabilityScore + recurringScore)))

    // Grade & Tiering
    let gradeLabel = "A+"
    let color = "#10b981" // emerald
    let bg = "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
    let text = "Elite Financial Health"

    if (finalScore >= 85) {
      gradeLabel = "A+"
      color = "#10b981"
      bg = "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
      text = "Elite Cashflow"
    } else if (finalScore >= 70) {
      gradeLabel = "B+"
      color = "#6366f1"
      bg = "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
      text = "Strong & Stable"
    } else if (finalScore >= 50) {
      gradeLabel = "C"
      color = "#f59e0b"
      bg = "bg-amber-500/10 border-amber-500/20 text-amber-400"
      text = "Moderate Pace"
    } else {
      gradeLabel = "D"
      color = "#f43f5e"
      bg = "bg-rose-500/10 border-rose-500/20 text-rose-400"
      text = "High Burn Alert"
    }

    // Pillars Breakdown
    const pillarList = [
      {
        name: "Savings Ratio",
        score: savingsScore,
        max: 35,
        percent: Math.round((savingsScore / 35) * 100),
        detail: `${savingsRate.toFixed(1)}% income retained`
      },
      {
        name: "Budget Buffer",
        score: budgetScore,
        max: 30,
        percent: Math.round((budgetScore / 30) * 100),
        detail: `${Math.max(0, Math.round(100 - budgetUsage))}% headroom left`
      },
      {
        name: "Cashflow Stability",
        score: stabilityScore,
        max: 20,
        percent: Math.round((stabilityScore / 20) * 100),
        detail: hasSurplus ? "Net surplus positive" : "Deficit warning"
      },
      {
        name: "Fixed Burden",
        score: recurringScore,
        max: 15,
        percent: Math.round((recurringScore / 15) * 100),
        detail: `${recurringRatio.toFixed(0)}% in subscriptions/bills`
      }
    ]

    // AI Actionable Recommendations
    const recs = []
    if (budgetUsage > 80) {
      recs.push({
        title: "Pace Discretionary Spending",
        desc: `You have consumed ${budgetUsage.toFixed(0)}% of your monthly budget. Slowing non-essential shopping preserves your safety margin.`,
        potentialSaving: `${currencySymbol}${(budgetLimit * 0.15).toFixed(0)}/mo`
      })
    }
    if (recurringRatio > 30) {
      recs.push({
        title: "Audit Active Subscriptions",
        desc: "Fixed recurring charges account for over 30% of total spend. Consolidating overlapping digital services immediately frees up cashflow.",
        potentialSaving: `${currencySymbol}35 - ${currencySymbol}80/mo`
      })
    }
    if (savingsRate >= 25) {
      recs.push({
        title: "High Savings Optimization",
        desc: "Your savings rate exceeds the benchmark 20%. Allocate this recurring surplus into dedicated savings targets or index funds.",
        potentialSaving: "Wealth Compounder"
      })
    } else {
      recs.push({
        title: "Boost Emergency Runway",
        desc: "Aiming for a 20% savings target creates a comfortable 3-month living expense buffer against unexpected volatility.",
        potentialSaving: `${currencySymbol}150+/mo`
      })
    }

    return {
      totalScore: finalScore,
      grade: gradeLabel,
      statusColor: color,
      statusBg: bg,
      statusText: text,
      pillars: pillarList,
      recommendations: recs.slice(0, 3)
    }
  }, [totalIncome, totalExpense, budgetLimit, expenses, currencySymbol])

  // Radial Gauge Math
  const radius = 34
  const circumference = 2 * Math.PI * radius
  const strokeOffset = circumference - (totalScore / 100) * circumference

  return (
    <>
      <Card className="bento-card h-full flex flex-col justify-between relative overflow-hidden group cursor-pointer" onClick={() => setIsReportOpen(true)}>
        {/* Subtle Ambient Glow */}
        <div 
          className="absolute -top-16 -right-16 w-36 h-36 rounded-full blur-3xl opacity-20 pointer-events-none transition-opacity group-hover:opacity-40"
          style={{ backgroundColor: statusColor }}
        />

        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Sparkles className="h-4 w-4" />
              </div>
              <span>AI Health Score</span>
            </div>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border shadow-sm ${statusBg}`}>
              {statusText}
            </span>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4 pt-1">
          {/* Gauge & Score Area */}
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex items-center justify-center">
              <svg className="w-20 h-20 transform -rotate-90">
                {/* Background Ring */}
                <circle
                  cx="40"
                  cy="40"
                  r={radius}
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth="7"
                  fill="transparent"
                />
                {/* Animated Score Progress Arc */}
                <motion.circle
                  cx="40"
                  cy="40"
                  r={radius}
                  stroke={statusColor}
                  strokeWidth="7"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset: strokeOffset }}
                  transition={{ duration: 1.4, ease: "easeOut" }}
                  strokeLinecap="round"
                  fill="transparent"
                  style={{
                    filter: `drop-shadow(0 0 6px ${statusColor})`
                  }}
                />
              </svg>
              {/* Score Value in Center */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-extrabold text-white font-mono leading-none tracking-tight">
                  <AnimatedCounter value={totalScore} decimals={0} />
                </span>
                <span className="text-[9px] font-bold text-slate-400 font-mono mt-0.5">/ 100</span>
              </div>
            </div>

            {/* Quick Metrics Column */}
            <div className="flex-1 space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Financial Grade</span>
                <span className="font-extrabold font-mono text-sm" style={{ color: statusColor }}>
                  {grade}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Top Advantage</span>
                <span className="text-slate-200 font-semibold text-[11px] truncate max-w-[90px]">
                  {pillars[0].detail}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Runway</span>
                <span className="text-emerald-400 font-semibold text-[11px]">
                  {totalIncome > totalExpense ? "Positive Cashflow" : "Tight Buffer"}
                </span>
              </div>
            </div>
          </div>

          {/* AI Diagnosis Pill Banner */}
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/[0.06] hover:border-indigo-500/30 transition-all flex items-center justify-between group-hover:bg-slate-800/60">
            <div className="flex items-center gap-2 overflow-hidden">
              <Zap className="h-3.5 w-3.5 text-indigo-400 shrink-0 animate-pulse" />
              <p className="text-[11px] text-slate-300 font-medium truncate">
                {recommendations[0]?.title || "Balanced Spending Cadence"}
              </p>
            </div>
            <span className="text-[10px] font-bold text-indigo-400 flex items-center shrink-0 ml-2 group-hover:translate-x-0.5 transition-transform">
              Inspect <ChevronRight className="h-3 w-3 ml-0.5" />
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Full AI Diagnostic Report Modal */}
      <AnimatePresence>
        {isReportOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsReportOpen(false)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            {/* Modal Dialog Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              className="relative w-full max-w-lg bg-slate-950/95 border border-white/[0.12] rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.9)] backdrop-blur-2xl overflow-hidden z-10 p-6 space-y-6"
            >
              {/* Top ambient highlight */}
              <div 
                className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" 
              />

              {/* Modal Header */}
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 shadow-inner">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <h2 className="text-xl font-extrabold text-white tracking-tight">
                      Financial Health Diagnostic
                    </h2>
                  </div>
                  <p className="text-xs text-slate-400 font-medium pl-9">
                    AI analysis synthesized from your cashflow, budgets, and recurring liabilities.
                  </p>
                </div>
                <button
                  onClick={() => setIsReportOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Overall Score Badge Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-900/60 to-slate-900/80 border border-white/[0.08] flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Composite Score</span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-3xl font-extrabold text-white font-mono">
                      {totalScore}
                    </span>
                    <span className="text-sm font-bold text-slate-400">/ 100</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${statusBg}`}>
                      Grade {grade}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Status</span>
                  <p className="text-sm font-bold text-white mt-0.5">{statusText}</p>
                </div>
              </div>

              {/* 4 Health Pillars Grid */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Four Health Pillars
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {pillars.map((pillar) => (
                    <div key={pillar.name} className="p-3 rounded-xl bg-slate-900/60 border border-white/[0.06] space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-300 font-semibold">{pillar.name}</span>
                        <span className="font-mono font-bold text-white">{pillar.score}/{pillar.max}</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pillar.percent}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400"
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium">{pillar.detail}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Actionable Recommendations */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                  Actionable AI Insights
                </h3>
                <div className="space-y-2">
                  {recommendations.map((rec, index) => (
                    <div key={index} className="p-3 rounded-xl bg-slate-900/40 border border-white/[0.05] hover:border-indigo-500/25 transition-colors space-y-1">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                          {rec.title}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-indigo-300 px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                          {rec.potentialSaving}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 pl-5 leading-relaxed">
                        {rec.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-mono">
                  Engine: Aetheria Adaptive Analytics v2
                </span>
                <button
                  onClick={() => setIsReportOpen(false)}
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition-all"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
