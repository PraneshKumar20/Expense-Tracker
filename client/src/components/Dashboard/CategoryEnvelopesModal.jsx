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
  currencySymbol = "₹", 
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
                    <Layers className="h-4 w-4" />
                  </div>
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    Category Budget Envelopes
                  </h2>
                </div>
                <p className="text-xs text-slate-400 font-normal mt-0.5">
                  Set target limits per category to maintain balanced cashflow.
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Summary Ribbon */}
            <div className="grid grid-cols-3 gap-3 p-3 rounded-lg bg-slate-900 border border-slate-800">
              <div>
                <span className="text-[11px] uppercase font-semibold tracking-[0.06em] text-slate-500">Total Allocated</span>
                <p className="text-xl font-semibold text-white font-mono-nums mt-0.5">
                  {currencySymbol}{envelopeStats.totalAllocated.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </p>
              </div>
              <div>
                <span className="text-[11px] uppercase font-semibold tracking-[0.06em] text-slate-500">Envelopes Spent</span>
                <p className="text-xl font-semibold text-white font-mono-nums mt-0.5">
                  {currencySymbol}{envelopeStats.totalSpentInEnvelopes.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </p>
              </div>
              <div>
                <span className="text-[11px] uppercase font-semibold tracking-[0.06em] text-slate-500">Threshold Status</span>
                <p className={`text-xs font-semibold font-mono-nums mt-1 flex items-center gap-1 ${envelopeStats.overCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
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
                  className="p-3 rounded-lg bg-[#0b101b] border border-slate-800 hover:border-slate-700 transition-colors space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium border ${item.theme.bg} ${item.theme.text} ${item.theme.border}`}>
                        {item.category}
                      </span>
                      <span className="text-xs text-slate-400">
                        {item.isOver ? (
                          <span className="text-rose-400 font-semibold flex items-center gap-1">
                            Over budget by {currencySymbol}{Math.abs(item.remaining).toFixed(0)}
                          </span>
                        ) : (
                          <span>{currencySymbol}{item.remaining.toFixed(0)} remaining</span>
                        )}
                      </span>
                    </div>

                    {/* Spend vs Limit & Inline Quick Edit */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono-nums font-semibold text-white">
                        {currencySymbol}{item.spent.toFixed(0)}
                      </span>
                      <span className="text-xs text-slate-500 font-mono-nums">/</span>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-mono-nums text-slate-400">{currencySymbol}</span>
                        <input
                          type="number"
                          value={item.baseLimit}
                          onChange={(e) => onUpdateCategoryBudget(item.category, Number(e.target.value) || 0)}
                          className="w-16 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-xs font-mono-nums text-white text-right outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.percent}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className={`h-full rounded-full transition-colors ${
                          item.rawPercent > 100 
                            ? 'bg-rose-500' 
                            : item.rawPercent > 80 
                              ? 'bg-amber-500' 
                              : item.theme.bar
                        }`}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] font-mono-nums text-slate-400">
                      <span>Usage: {item.rawPercent.toFixed(0)}%</span>
                      <span>Target: {currencySymbol}{item.limit.toFixed(0)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <p className="text-[11px] text-slate-400">
                Category envelope targets scale automatically with your active currency.
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
