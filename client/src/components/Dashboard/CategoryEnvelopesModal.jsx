import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Layers, X, Sparkles, AlertCircle, CheckCircle2, DollarSign, TrendingUp, RotateCcw, Sliders, ShieldAlert } from "lucide-react"
import AnimatedCounter from "../ui/AnimatedCounter"

const DEFAULT_ENVELOPES = {
  Food: 450,
  Travel: 250,
  Bills: 350,
  Subscriptions: 100,
  Entertainment: 150,
  Shopping: 200,
  Other: 150
}

const CATEGORY_COLORS = {
  Food: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30', bar: 'bg-amber-500' },
  Travel: { bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500/30', bar: 'bg-sky-500' },
  Bills: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30', bar: 'bg-purple-500' },
  Subscriptions: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/30', bar: 'bg-indigo-500' },
  Entertainment: { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/30', bar: 'bg-pink-500' },
  Shopping: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30', bar: 'bg-rose-500' },
  Other: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/30', bar: 'bg-slate-500' }
}

export default function CategoryEnvelopesModal({ 
  isOpen, 
  onClose, 
  expenses = [], 
  currencySymbol = "$", 
  multiplier = 1,
  categoryBudgets,
  onUpdateCategoryBudget
}) {
  const [editingCategory, setEditingCategory] = useState(null)

  // Calculate actual spend per category
  const categorySpending = useMemo(() => {
    const map = {}
    if (Array.isArray(expenses)) {
      expenses.filter(e => e.type === 'expense').forEach(e => {
        const cat = e.category || 'Other'
        map[cat] = (map[cat] || 0) + (Number(e.amount) || 0)
      })
    }
    return map
  }, [expenses])

  // Aggregate Envelope Stats
  const envelopeStats = useMemo(() => {
    const list = Object.entries(categoryBudgets).map(([cat, baseLimit]) => {
      const limit = baseLimit * multiplier
      const spent = categorySpending[cat] || 0
      const percent = limit > 0 ? (spent / limit) * 100 : 0
      const remaining = limit - spent

      return {
        category: cat,
        baseLimit,
        limit,
        spent,
        percent: Math.min(percent, 100),
        rawPercent: percent,
        remaining,
        isOver: spent > limit,
        theme: CATEGORY_COLORS[cat] || CATEGORY_COLORS.Other
      }
    })

    const totalAllocated = Object.values(categoryBudgets).reduce((sum, v) => sum + (v * multiplier), 0)
    const totalSpentInEnvelopes = list.reduce((sum, item) => sum + item.spent, 0)
    const overCount = list.filter(item => item.isOver).length

    return {
      list: list.sort((a, b) => b.rawPercent - a.rawPercent),
      totalAllocated,
      totalSpentInEnvelopes,
      overCount
    }
  }, [categoryBudgets, categorySpending, multiplier])

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
            {/* Top ambient glowing line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-indigo-500 to-emerald-500" />

            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-inner">
                    <Layers className="h-5 w-5" />
                  </div>
                  <h2 className="text-xl font-extrabold text-white tracking-tight">
                    Category Budget Envelopes
                  </h2>
                </div>
                <p className="text-xs text-slate-400 font-medium pl-9">
                  Set target caps per category to prevent runaway spending across specific lifestyle areas.
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Summary Ribbon */}
            <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-900/60 border border-white/[0.08]">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Total Allocated</span>
                <p className="text-lg font-extrabold text-white font-mono mt-0.5">
                  {currencySymbol}{envelopeStats.totalAllocated.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Envelopes Spent</span>
                <p className="text-lg font-extrabold text-white font-mono mt-0.5">
                  {currencySymbol}{envelopeStats.totalSpentInEnvelopes.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Threshold Status</span>
                <p className={`text-xs font-bold font-mono mt-1 flex items-center gap-1 ${envelopeStats.overCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {envelopeStats.overCount > 0 ? (
                    <>
                      <ShieldAlert className="h-3.5 w-3.5" />
                      {envelopeStats.overCount} Exceeded
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      All Healthy
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Envelopes List */}
            <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
              {envelopeStats.list.map((item) => (
                <div 
                  key={item.category}
                  className="p-3.5 rounded-2xl bg-slate-900/40 border border-white/[0.06] hover:border-white/[0.15] transition-all space-y-2.5 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className={`px-2.5 py-1 rounded-xl text-xs font-bold border ${item.theme.bg} ${item.theme.text} ${item.theme.border}`}>
                        {item.category}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        {item.isOver ? (
                          <span className="text-rose-400 font-bold flex items-center gap-1">
                            ⚠️ Over budget by {currencySymbol}{Math.abs(item.remaining).toFixed(0)}
                          </span>
                        ) : (
                          <span>{currencySymbol}{item.remaining.toFixed(0)} remaining</span>
                        )}
                      </span>
                    </div>

                    {/* Spend vs Limit & Inline Quick Edit */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-white">
                        {currencySymbol}{item.spent.toFixed(0)}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">/</span>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-mono text-slate-400">{currencySymbol}</span>
                        <input
                          type="number"
                          value={item.baseLimit}
                          onChange={(e) => onUpdateCategoryBudget(item.category, Number(e.target.value) || 0)}
                          className="w-16 bg-slate-800/80 border border-slate-700/80 rounded-lg px-1.5 py-0.5 text-xs font-mono text-white text-right outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden p-0.5 border border-white/[0.04] shadow-inner flex">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.percent}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={`h-full rounded-full transition-colors ${
                          item.rawPercent > 100 
                            ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]' 
                            : item.rawPercent > 80 
                              ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' 
                              : item.theme.bar
                        }`}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-slate-400">
                      <span>Usage: {item.rawPercent.toFixed(0)}%</span>
                      <span>Target: {currencySymbol}{item.limit.toFixed(0)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
              <p className="text-[11px] text-slate-400">
                💡 Tip: Category envelope targets scale automatically with your active currency.
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
