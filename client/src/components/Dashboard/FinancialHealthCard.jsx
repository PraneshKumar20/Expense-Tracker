import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { ShieldCheck, ChevronRight, X, CheckCircle2, Award } from "lucide-react"
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
    let color = "#10b981"
    let bg = "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
    let text = "Elite Cashflow"

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
        detail: `${recurringRatio.toFixed(0)}% recurring`
      }
    ]

    // Actionable Recommendations
    const recs = []
    if (recurringRatio > 35) {
      recs.push({
        title: "Audit Subscriptions",
        desc: "Fixed recurring charges take up more than 35% of outflows. Audit unused subscriptions in Bill Radar.",
        potentialSaving: `${currencySymbol}30-80/mo`
      })
    }
    if (budgetUsage > 85) {
      recs.push({
        title: "Pace Discretionary Spending",
        desc: "You have utilized over 85% of your planned monthly budget limit. Consider limiting dining & entertainment.",
        potentialSaving: `${currencySymbol}100-200`
      })
    }
    if (savingsRate >= 25) {
      recs.push({
        title: "High Savings Optimization",
        desc: "Your savings rate exceeds the benchmark 20%. Allocate recurring surplus into dedicated goals or reserves.",
        potentialSaving: "Wealth Compounder"
      })
    } else {
      recs.push({
        title: "Boost Emergency Runway",
        desc: "Aiming for a 20% savings target creates a comfortable living expense buffer against unexpected outlays.",
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
  const radius = 32
  const circumference = 2 * Math.PI * radius
  const strokeOffset = circumference - (totalScore / 100) * circumference

  return (
    <>
      <Card 
        className="finance-card h-full flex flex-col justify-between cursor-pointer" 
        onClick={() => setIsReportOpen(true)}
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-slate-200 tracking-tight flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-indigo-400" />
              <span>Financial Health Score</span>
            </div>
            <span className={`text-[10px] font-mono-nums font-semibold px-2 py-0.5 rounded border ${statusBg}`}>
              {statusText}
            </span>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3 pt-1">
          {/* Gauge & Score Area */}
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex items-center justify-center">
              <svg className="w-18 h-18 transform -rotate-90">
                <circle
                  cx="36"
                  cy="36"
                  r={radius}
                  stroke="#1e293b"
                  strokeWidth="6"
                  fill="transparent"
                />
                <circle
                  cx="36"
                  cy="36"
                  r={radius}
                  stroke={statusColor}
                  strokeWidth="6"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeOffset}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-white font-mono-nums leading-none">
                  <AnimatedCounter value={totalScore} decimals={0} />
                </span>
                <span className="text-[10px] text-slate-400 font-mono-nums mt-0.5">/ 100</span>
              </div>
            </div>

            {/* Quick Metrics Column */}
            <div className="flex-1 space-y-1 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-normal">Rating</span>
                <span className="font-bold font-mono-nums text-xs" style={{ color: statusColor }}>
                  Grade {grade}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Strongest Area</span>
                <span className="text-slate-200 font-medium text-[11px] truncate max-w-[90px]">
                  {pillars[0].detail}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Position</span>
                <span className="text-emerald-400 font-medium text-[11px]">
                  {totalIncome > totalExpense ? "Cashflow Positive" : "Deficit Warning"}
                </span>
              </div>
            </div>
          </div>

          {/* Diagnostic Link */}
          <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
            <p className="text-[11px] text-slate-300 font-medium truncate">
              {recommendations[0]?.title || "Balanced spending pace"}
            </p>
            <span className="text-[10px] font-semibold text-indigo-400 flex items-center shrink-0 ml-2">
              Report <ChevronRight className="h-3 w-3 ml-0.5" />
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Full AI Diagnostic Report Modal */}
      <AnimatePresence>
        {isReportOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsReportOpen(false)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 8 }}
              transition={{ duration: 0.15 }}
              className="relative w-full max-w-lg bg-[#0f1523] border border-slate-800 rounded-lg shadow-2xl overflow-hidden z-10 p-5 space-y-5"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-indigo-400" />
                    <h2 className="text-base font-bold text-white tracking-tight">
                      Financial Health Diagnostic
                    </h2>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Synthesized from your cashflow, budgets, and recurring liabilities.
                  </p>
                </div>
                <button
                  onClick={() => setIsReportOpen(false)}
                  className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-850 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Overall Score Badge Card */}
              <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400">Composite Health Score</span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-2xl font-bold text-white font-mono">
                      {totalScore}
                    </span>
                    <span className="text-xs text-slate-400">/ 100</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${statusBg}`}>
                      Grade {grade}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-semibold text-slate-400">Status</span>
                  <p className="text-xs font-semibold text-white mt-0.5">{statusText}</p>
                </div>
              </div>

              {/* 4 Health Pillars Grid */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Four Health Pillars
                </h3>
                <div className="grid grid-cols-2 gap-2.5">
                  {pillars.map((pillar) => (
                    <div key={pillar.name} className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-300 font-medium">{pillar.name}</span>
                        <span className="font-mono font-semibold text-white">{pillar.score}/{pillar.max}</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${pillar.percent}%` }}
                          className="h-full rounded-full bg-indigo-500"
                        />
                      </div>
                      <p className="text-[10px] text-slate-400">{pillar.detail}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actionable Recommendations */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Targeted Recommendations
                </h3>
                <div className="space-y-1.5">
                  {recommendations.map((rec, index) => (
                    <div key={index} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                          {rec.title}
                        </span>
                        <span className="text-[10px] font-mono text-slate-300 px-1.5 py-0.2 rounded bg-slate-800 border border-slate-700">
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
              <div className="pt-2 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => setIsReportOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
                >
                  Close Diagnostic
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
